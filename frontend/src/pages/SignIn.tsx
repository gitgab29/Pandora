import { Link } from 'react-router-dom';
import { colors } from '../theme';
import Button from '../components/Button';

export default function SignIn() {
  const handleGoogleSignIn = () => {
    // TODO: Replace with actual Google OAuth redirect
    // window.location.href = '/api/auth/google/login';
    console.log('Google sign-in initiated');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: "url('/bg-auth.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: colors.grayDarkest,
      }}
    >
      {/* Card — 65% width, 80% height */}
      <div
        style={{
          display: 'flex',
          width: '65%',
          height: '80vh',
          minWidth: '600px',
          minHeight: '480px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(3,12,35,0.45)',
        }}
      >
        {/* LEFT — white form panel */}
        <div
          style={{
            flex: '0 0 58%',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 56px',
            boxSizing: 'border-box',
          }}
        >
          <img
            src="/primary-logo-with-text.svg"
            alt="Pandora by Embedded Silicon"
            style={{ height: '26px', width: 'auto', alignSelf: 'flex-start' }}
          />

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ width: '100%', maxWidth: '360px' }}>
              <h2
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 700,
                  fontSize: '36px',
                  lineHeight: '44px',
                  color: colors.textPrimary,
                  margin: '0 0 12px 0',
                }}
              >
                Sign in to Pandora
              </h2>

              <div
                style={{
                  width: '48px',
                  height: '3px',
                  backgroundColor: colors.primary,
                  borderRadius: '2px',
                  margin: '0 auto 20px',
                }}
              />

              <p
                style={{
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: '15px',
                  lineHeight: '24px',
                  color: colors.blueGrayMd,
                  margin: '0 0 36px 0',
                }}
              >
                Use your Embedded Silicon Google account to continue.
              </p>

              <Button variant="google" onClick={handleGoogleSignIn}>
                <GoogleIcon />
                Sign In with Google
              </Button>

              <p
                style={{
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: '14px',
                  color: colors.blueGrayMd,
                  margin: '28px 0 0 0',
                }}
              >
                New to Pandora?{' '}
                <Link
                  to="/sign-up"
                  style={{ color: colors.primary, fontWeight: 700, textDecoration: 'none' }}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <p
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontSize: '12px',
              color: '#9ca3af',
              margin: 0,
              textAlign: 'center',
            }}
          >
            © {new Date().getFullYear()} Embedded Silicon &nbsp;|&nbsp; Privacy Policy &nbsp;|&nbsp; Terms of Service
          </p>
        </div>

        {/* RIGHT — blue brand panel */}
        <div
          className="auth-blue-panel"
          style={{
            flex: '0 0 42%',
            backgroundColor: colors.primary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '48px 52px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <h1
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 700,
                fontSize: '40px',
                lineHeight: '50px',
                color: '#ffffff',
                margin: '0 0 12px 0',
              }}
            >
              Welcome!
            </h1>

            <div
              style={{
                width: '48px',
                height: '3px',
                backgroundColor: 'rgba(255,255,255,0.5)',
                borderRadius: '2px',
                margin: '0 auto 20px',
              }}
            />

            <p
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: '15px',
                lineHeight: '26px',
                color: 'rgba(255,255,255,0.75)',
                margin: 0,
              }}
            >
              The IT &amp; Asset Management Platform for Embedded Silicon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
