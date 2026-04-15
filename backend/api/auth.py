import os
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User
from .serializers import UserSerializer


def _token_response(user):
    """Return the standard token + user payload."""
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
        },
    }


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD  # email


class EmailLoginView(TokenObtainPairView):
    """POST /api/auth/login/ — email + password → access/refresh + user fields."""
    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        user = serializer.user
        return Response(_token_response(user), status=status.HTTP_200_OK)


class RegisterView(APIView):
    """POST /api/auth/register/ — create account + return tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        required = ['email', 'password', 'first_name', 'last_name']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return Response(
                {'detail': f'Missing required fields: {", ".join(missing)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=data['email']).exists():
            return Response({'detail': 'Email already registered.'}, status=status.HTTP_400_BAD_REQUEST)

        supervisor = None
        if data.get('supervisor_id'):
            try:
                supervisor = User.objects.get(pk=data['supervisor_id'])
            except User.DoesNotExist:
                pass

        user = User.objects.create_user(
            email=data['email'],
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            title=data.get('title', ''),
            location=data.get('location', ''),
            business_group=data.get('business_group', ''),
            badge_number=data.get('badge_number', ''),
            supervisor=supervisor,
            role=User.Role.STAFF,
        )
        return Response(_token_response(user), status=status.HTTP_201_CREATED)


class GoogleAuthView(APIView):
    """POST /api/auth/google/ — verify Google ID token → access/refresh + user fields."""
    permission_classes = [AllowAny]

    def post(self, request):
        id_token_str = request.data.get('id_token')
        if not id_token_str:
            return Response({'detail': 'id_token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        client_id = os.environ.get('GOOGLE_OAUTH_CLIENT_ID', '')
        if not client_id:
            return Response(
                {'detail': 'Google OAuth is not configured on this server.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests
            idinfo = google_id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                client_id,
            )
        except ValueError as e:
            return Response({'detail': f'Invalid Google token: {e}'}, status=status.HTTP_401_UNAUTHORIZED)

        email = idinfo.get('email')
        if not email:
            return Response({'detail': 'Token missing email claim.'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': idinfo.get('given_name', ''),
                'last_name': idinfo.get('family_name', ''),
                'role': User.Role.STAFF,
            },
        )
        if created:
            user.set_unusable_password()
            user.save()

        return Response(_token_response(user), status=status.HTTP_200_OK)


class MeView(APIView):
    """GET /api/auth/me/ — return the current authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
