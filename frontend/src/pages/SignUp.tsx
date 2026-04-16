import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import Button from '../components/Button';
import Input from '../components/Input';
import type { GoogleUser, SignUpFormData } from '../types/auth';
import type { Person } from '../types/people';
import { usersApi } from '../api';

type Step = 'google' | 'profile';

export default function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('google');
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [managers, setManagers] = useState<Person[]>([]);
  const [form, setForm] = useState<SignUpFormData>({
    firstName: '', lastName: '', title: '', location: '',
    department: '', badgeNumber: '', manager: '',
  });
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    usersApi.list().then(setManagers).catch(() => {});
  }, []);

  const handleGoogleSignUp = () => {
    // TODO: Replace with actual Google OAuth redirect
    const mock: GoogleUser = {
      email: 'jane.doe@embeddedsil.com',
      firstName: 'Jane',
      lastName: 'Doe',
      avatarUrl: '',
    };
    setGoogleUser(mock);
    setForm(prev => ({ ...prev, firstName: mock.firstName, lastName: mock.lastName }));
    setStep('profile');
  };

  const setField = (key: keyof SignUpFormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<SignUpFormData> = {};
    if (!form.firstName.trim())   next.firstName   = 'Required';
    if (!form.lastName.trim())    next.lastName    = 'Required';
    if (!form.title.trim())       next.title       = 'Required';
    if (!form.location.trim())    next.location    = 'Required';
    if (!form.department.trim())  next.department  = 'Required';
    if (!form.badgeNumber.trim()) next.badgeNumber = 'Required';
    if (!form.manager.trim())     next.manager     = 'Required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // TODO: POST /api/users/register with form + google token
      console.log('Submitting:', { ...form, email: googleUser?.email });
      await new Promise(r => setTimeout(r, 900));
      navigate('/');
    } finally {
      setIsSubmitting(false);
    }
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
          boxShadow: shadows.auth,
        }}
      >
        {/* LEFT — blue brand panel */}
        <div
          className="auth-blue-panel"
          style={{
            flex: '0 0 38%',
            backgroundColor: colors.primary,
            display: 'flex',
            flexDirection: 'column',
            padding: `${spacing.xl4} 3.125rem`,
            boxSizing: 'border-box',
          }}
        >
          <img
            src="/whtie-logo-with-text.svg"
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
            <div style={{ width: '100%', maxWidth: '17.5rem' }}>
              {step === 'google' ? (
                <>
                  <h1
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 700,
                      fontSize: fontSize.h2,
                      lineHeight: 1.25,
                      color: colors.white,
                      margin: `0 0 ${spacing.md} 0`,
                    }}
                  >
                    Log In
                  </h1>
                  <div
                    style={{
                      width: '3rem',
                      height: '3px',
                      backgroundColor: 'rgba(255,255,255,0.6)',
                      borderRadius: radius.sm,
                      margin: `0 auto ${spacing.xl}`,
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: fontSize.lg,
                      lineHeight: 1.625,
                      color: 'rgba(255,255,255,0.75)',
                      margin: 0,
                    }}
                  >
                    Already have an account? Sign in to Pandora.
                  </p>
                </>
              ) : (
                <>
                  <h1
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 700,
                      fontSize: fontSize.h3,
                      lineHeight: 1.278,
                      color: colors.white,
                      margin: `0 0 ${spacing.md} 0`,
                    }}
                  >
                    Almost there!
                  </h1>
                  <div
                    style={{
                      width: '3rem',
                      height: '3px',
                      backgroundColor: 'rgba(255,255,255,0.6)',
                      borderRadius: radius.sm,
                      margin: `0 auto ${spacing.xl}`,
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: fontSize.lg,
                      lineHeight: 1.625,
                      color: 'rgba(255,255,255,0.75)',
                      margin: `0 0 ${spacing.xl3} 0`,
                    }}
                  >
                    Fill in your details so your team can find you.
                  </p>

                  {googleUser && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.md,
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        borderRadius: radius.lg,
                        padding: `${spacing.md} ${spacing.lg}`,
                        textAlign: 'left',
                      }}
                    >
                      <div
                        style={{
                          width: '2.25rem',
                          height: '2.25rem',
                          borderRadius: radius.full,
                          backgroundColor: 'rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: "'Archivo', sans-serif",
                          fontWeight: 700,
                          fontSize: fontSize.sm,
                          color: colors.white,
                          flexShrink: 0,
                        }}
                      >
                        {googleUser.firstName[0]}{googleUser.lastName[0]}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 700,
                            fontSize: fontSize.sm,
                            color: colors.white,
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {googleUser.firstName} {googleUser.lastName}
                        </p>
                        <p
                          style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontSize: fontSize.micro,
                            color: 'rgba(255,255,255,0.6)',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {googleUser.email}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <p
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontSize: fontSize.xs,
              color: 'rgba(255,255,255,0.4)',
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Embedded Silicon
          </p>
        </div>

        {/* RIGHT — white form panel */}
        <div
          style={{
            flex: '0 0 62%',
            backgroundColor: colors.bgSurface,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            overflowY: 'auto',
          }}
        >
          {step === 'google' ? (
            <GoogleStep onGoogleSignUp={handleGoogleSignUp} />
          ) : (
            <ProfileStep
              form={form}
              errors={errors}
              isSubmitting={isSubmitting}
              managers={managers}
              setField={setField}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Google ───────────────────────────────────────────────────────────

function GoogleStep({
  onGoogleSignUp,
}: {
  onGoogleSignUp: () => void;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: `${spacing.xl4} 3.375rem`,
      }}
    >
      <div style={{ width: '100%', maxWidth: '25rem' }}>
        <h2
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 700,
            fontSize: fontSize.h3,
            lineHeight: 1.222,
            color: colors.textPrimary,
            margin: `0 0 ${spacing.md} 0`,
          }}
        >
          Sign Up to Pandora
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

        <p
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: fontSize.lg,
            lineHeight: 1.6,
            color: colors.blueGrayMd,
            margin: `0 0 ${spacing.xl3} 0`,
          }}
        >
          Use your Embedded Silicon Google account to get started.
        </p>

        <Button variant="google" onClick={onGoogleSignUp}>
          <GoogleIcon />
          Sign Up With Google
        </Button>

        <p
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: fontSize.md,
            color: colors.blueGrayMd,
            margin: `${spacing.xl} 0 0 0`,
          }}
        >
          Already have an account?{' '}
          <Link
            to="/sign-in"
            style={{ color: colors.primary, fontWeight: 700, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Profile form ─────────────────────────────────────────────────────

interface ProfileStepProps {
  form: SignUpFormData;
  errors: Partial<SignUpFormData>;
  isSubmitting: boolean;
  managers: Person[];
  setField: (key: keyof SignUpFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function ProfileStep({ form, errors, isSubmitting, managers, setField, onSubmit }: ProfileStepProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      style={{ padding: `${spacing.xl4} 3.75rem`, display: 'flex', flexDirection: 'column' }}
    >
      <h2
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontWeight: 700,
          fontSize: fontSize.h4,
          lineHeight: 1.3125,
          color: colors.textPrimary,
          margin: `0 0 ${spacing.md} 0`,
        }}
      >
        Complete your profile
      </h2>

      <div
        style={{
          width: '3rem',
          height: '3px',
          backgroundColor: colors.primary,
          borderRadius: radius.sm,
          margin: `0 0 ${spacing.lg} 0`,
        }}
      />

      <p
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontSize: fontSize.lg,
          lineHeight: 1.6,
          color: colors.blueGrayMd,
          margin: `0 0 ${spacing.xl3} 0`,
        }}
      >
        All fields are required.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.xl }}>
        <Input label="First Name"    value={form.firstName}   error={errors.firstName}   onChange={v => setField('firstName',   v)} />
        <Input label="Last Name"     value={form.lastName}    error={errors.lastName}    onChange={v => setField('lastName',    v)} />
        <Input label="Position"      placeholder="e.g. IT Engineer"    value={form.title}       error={errors.title}       onChange={v => setField('title',       v)} />
        <Input label="Badge Number"  placeholder="e.g. ESI-1042"       value={form.badgeNumber} error={errors.badgeNumber} onChange={v => setField('badgeNumber', v)} />
        <Input label="Department"    placeholder="e.g. Engineering"    value={form.department}  error={errors.department}  onChange={v => setField('department',  v)} />
        <Input label="Office"        placeholder="e.g. San Jose"       value={form.location}    error={errors.location}    onChange={v => setField('location',    v)} />
      </div>

      <div style={{ marginTop: spacing.xl }}>
        <ManagerCombobox
          value={form.manager}
          error={errors.manager}
          managers={managers}
          onChange={v => setField('manager', v)}
        />
      </div>

      <div style={{ marginTop: spacing.xl3 }}>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          Create Account
        </Button>
      </div>
    </form>
  );
}

// ─── Manager combobox ─────────────────────────────────────────────────────────

function ManagerCombobox({
  value,
  error,
  managers,
  onChange,
}: {
  value: string;
  error?: string;
  managers: Person[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const managerNames = managers.map(m => `${m.first_name} ${m.last_name}`);
  const filtered = value.trim()
    ? managerNames.filter(m => m.toLowerCase().includes(value.toLowerCase()))
    : managerNames;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const borderColor = error ? colors.error : focused ? colors.primary : colors.border;

  return (
    <div
      ref={ref}
      style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs, position: 'relative' }}
    >
      <label
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontWeight: 700,
          fontSize: fontSize.sm,
          lineHeight: 1.538,
          color: colors.textPrimary,
        }}
      >
        Manager
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={value}
          placeholder="Search for your manager…"
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          style={{
            width: '100%',
            padding: `${spacing.md} 2.5rem ${spacing.md} 0.875rem`,
            borderRadius: radius.md,
            border: `1.5px solid ${borderColor}`,
            fontFamily: "'Archivo', sans-serif",
            fontSize: fontSize.lg,
            lineHeight: 1.625,
            color: colors.textPrimary,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s ease',
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: colors.blueGrayMd,
            display: 'flex',
          }}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {open && filtered.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 20,
            backgroundColor: colors.bgSurface,
            border: `1.5px solid ${colors.border}`,
            borderRadius: radius.md,
            boxShadow: shadows.dropdown,
            maxHeight: '12.25rem',
            overflowY: 'auto',
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}
        >
          {filtered.map(name => (
            <li
              key={name}
              onMouseDown={() => { onChange(name); setOpen(false); setFocused(false); }}
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                fontFamily: "'Archivo', sans-serif",
                fontSize: fontSize.md,
                color: colors.textPrimary,
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bgHover)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.bgSurface)}
            >
              {name}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <span
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: fontSize.xs,
            color: colors.error,
          }}
        >
          {error}
        </span>
      )}
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
