import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors, spacing, radius, fontSize } from '../theme';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/home');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Requires VITE_GOOGLE_OAUTH_CLIENT_ID to be configured
    // Google Identity Services flow would call useAuth().loginWithGoogle(id_token)
    setError('Google sign-in requires configuration. Use email/password for now.');
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
      {/* Card */}
      <div
        style={{
          display: 'flex',
          width: '65%',
          height: '80vh',
          minWidth: '37.5rem',
          minHeight: '30rem',
          borderRadius: radius.xl2,
          overflow: 'hidden',
          boxShadow: '0 2.5rem 6.25rem rgba(3,12,35,0.45)',
        }}
      >
        {/* LEFT — white form panel */}
        <div
          style={{
            flex: '0 0 58%',
            backgroundColor: colors.bgSurface,
            display: 'flex',
            flexDirection: 'column',
            padding: `${spacing.xl4} 3.125rem`,
            boxSizing: 'border-box',
          }}
        >
          <img
            src="/primary-logo-with-text.svg"
            alt="Pandora by Embedded Silicon"
            style={{ height: '1.625rem', width: 'auto', alignSelf: 'flex-start' }}
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
            <div style={{ width: '100%', maxWidth: '22.5rem' }}>
              <h2
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 700,
                  fontSize: '2.25rem',
                  lineHeight: 1.222,
                  color: colors.textPrimary,
                  margin: `0 0 ${spacing.md} 0`,
                }}
              >
                Sign in to Pandora
              </h2>

              <div
                style={{
                  width: '3rem',
                  height: '3px',
                  backgroundColor: colors.primary,
                  borderRadius: radius.sm,
                  margin: `0 auto ${spacing.xl}`,
                }}
              />

              <Button variant="google" onClick={handleGoogleSignIn}>
                <GoogleIcon />
                Sign In with Google
              </Button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.md,
                  margin: `${spacing.xl} 0`,
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
                <span
                  style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: fontSize.xs,
                    color: colors.textDisabled,
                    whiteSpace: 'nowrap',
                  }}
                >
                  or sign in with email
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
              </div>

              <form onSubmit={handleEmailSignIn} noValidate style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, textAlign: 'left' }}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@embeddedsilicon.com"
                  value={email}
                  onChange={setEmail}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                />

                {error && (
                  <p
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: fontSize.xs,
                      color: colors.error,
                      margin: 0,
                    }}
                  >
                    {error}
                  </p>
                )}

                <Button type="submit" variant="primary" loading={loading}>
                  Sign In
                </Button>
              </form>

              <p
                style={{
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: '0.875rem',
                  color: colors.blueGrayMd,
                  margin: `${spacing.xl} 0 0 0`,
                  textAlign: 'center',
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
              fontSize: '0.75rem',
              color: colors.textDisabled,
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
            padding: `${spacing.xl4} 2.9rem`,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ width: '100%', maxWidth: '18.75rem' }}>
            <h1
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 700,
                fontSize: '2.5rem',
                lineHeight: 1.25,
                color: colors.white,
                margin: `0 0 ${spacing.md} 0`,
              }}
            >
              Welcome!
            </h1>

            <div
              style={{
                width: '3rem',
                height: '3px',
                backgroundColor: 'rgba(255,255,255,0.5)',
                borderRadius: radius.sm,
                margin: `0 auto ${spacing.xl}`,
              }}
            />

            <p
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: '0.9375rem',
                lineHeight: 1.625,
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
