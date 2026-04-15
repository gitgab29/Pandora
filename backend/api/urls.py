from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import UserViewSet, AssetViewSet, AccessoryViewSet, TransactionLogViewSet
from .auth import EmailLoginView, RegisterView, GoogleAuthView, MeView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'accessories', AccessoryViewSet, basename='accessory')
router.register(r'transactions', TransactionLogViewSet, basename='transaction')

auth_urlpatterns = [
    path('login/', EmailLoginView.as_view(), name='auth_login'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('google/', GoogleAuthView.as_view(), name='auth_google'),
    path('refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('me/', MeView.as_view(), name='auth_me'),
]

urlpatterns = [
    path('auth/', include(auth_urlpatterns)),
    path('', include(router.urls)),
]
