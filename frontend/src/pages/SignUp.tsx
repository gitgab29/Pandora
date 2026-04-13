import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// useNavigate kept for post-submit redirect
import { colors } from '../theme';
import Button from '../components/Button';
import Input from '../components/Input';
import type { GoogleUser, SignUpFormData } from '../types/auth';

const DUMMY_MANAGERS = [
  'Alice Thompson',
  'Bob Martinez',
  'Carol Williams',
  'David Chen',
  'Emma Rodriguez',
  'Frank Johnson',
  'Grace Kim',
  'Henry Brown',
  'Isabella Davis',
  'James Wilson',
];

type Step = 'google' | 'profile';

export default function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('google');
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [form, setForm] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    title: '',
    location: '',
    department: '',
    badgeNumber: '',
    manager: '',
  });
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignUp = () => {
    // TODO: Replace with actual Google OAuth redirect
    // window.location.href = '/api/auth/google/login?mode=signup';
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
    if (!form.firstName.trim()) next.firstName = 'Required';
    if (!form.lastName.trim()) next.lastName = 'Required';
    if (!form.title.trim()) next.title = 'Required';
    if (!form.location.trim()) next.location = 'Required';
    if (!form.department.trim()) next.department = 'Required';
    if (!form.badgeNumber.trim()) next.badgeNumber = 'Required';
    if (!form.manager.trim()) next.manager = 'Required';
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
        {/* LEFT — blue brand panel (hidden on mobile) */}
        <div
          className="auth-blue-panel"
          style={{
            flex: '0 0 38%',
            backgroundColor: colors.primary,
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 56px',
            boxSizing: 'border-box',
          }}
        >
          {/* Logo — white on blue */}
          <img
            src="/whtie-logo-with-text.svg"
            alt="Pandora by Embedded Silicon"
            style={{ height: '26px', width: 'auto', alignSelf: 'flex-start' }}
          />

          {/* Centered brand content */}
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
            <div style={{ width: '100%', maxWidth: '280px' }}>
              {step === 'google' ? (
                <>
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
                    Log In
                  </h1>
                  <div
                    style={{
                      width: '48px',
                      height: '3px',
                      backgroundColor: 'rgba(255,255,255,0.6)',
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
                    Already have an account? Sign in to Pandora.
                  </p>
                </>
              ) : (
                <>
                  <h1
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 700,
                      fontSize: '36px',
                      lineHeight: '46px',
                      color: '#ffffff',
                      margin: '0 0 12px 0',
                    }}
                  >
                    Almost there!
                  </h1>
                  <div
                    style={{
                      width: '48px',
                      height: '3px',
                      backgroundColor: 'rgba(255,255,255,0.6)',
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
                      margin: '0 0 32px 0',
                    }}
                  >
                    Fill in your details so your team can find you.
                  </p>

                  {/* Google user chip */}
                  {googleUser && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        textAlign: 'left',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: "'Archivo', sans-serif",
                          fontWeight: 700,
                          fontSize: '13px',
                          color: '#ffffff',
                          flexShrink: 0,
                        }}
                      >
                        {googleUser.firstName[0]}{googleUser.lastName[0]}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', color: '#ffffff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {googleUser.firstName} {googleUser.lastName}
                        </p>
                        <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {googleUser.email}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            © {new Date().getFullYear()} Embedded Silicon
          </p>
        </div>

        {/* RIGHT — white form panel */}
        <div
          style={{
            flex: '0 0 62%',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            overflowY: 'auto',
          }}
        >
          {step === 'google' ? (
            <GoogleStep onGoogleSignUp={handleGoogleSignUp} navigate={navigate} />
          ) : (
            <ProfileStep
              form={form}
              errors={errors}
              isSubmitting={isSubmitting}
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

function GoogleStep({ onGoogleSignUp, navigate }: { onGoogleSignUp: () => void; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 60px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
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
          Sign Up to Pandora
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
          Use your Embedded Silicon Google account to get started.
        </p>

        <Button variant="google" onClick={onGoogleSignUp}>
          <GoogleIcon />
          Sign Up With Google
        </Button>

        <p
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: '14px',
            color: colors.blueGrayMd,
            margin: '28px 0 0 0',
          }}
        >
          Already have an account?{' '}
          <Link to="/sign-in" style={{ color: colors.primary, fontWeight: 700, textDecoration: 'none' }}>
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
  setField: (key: keyof SignUpFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function ProfileStep({ form, errors, isSubmitting, setField, onSubmit }: ProfileStepProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      style={{ padding: '48px 60px', display: 'flex', flexDirection: 'column' }}
    >
      <h2
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontWeight: 700,
          fontSize: '32px',
          lineHeight: '42px',
          color: colors.textPrimary,
          margin: '0 0 12px 0',
        }}
      >
        Complete your profile
      </h2>

      <div
        style={{
          width: '48px',
          height: '3px',
          backgroundColor: colors.primary,
          borderRadius: '2px',
          margin: '0 0 16px 0',
        }}
      />

      <p
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontSize: '15px',
          lineHeight: '24px',
          color: colors.blueGrayMd,
          margin: '0 0 32px 0',
        }}
      >
        All fields are required.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Input label="First Name" value={form.firstName} error={errors.firstName} onChange={v => setField('firstName', v)} />
        <Input label="Last Name" value={form.lastName} error={errors.lastName} onChange={v => setField('lastName', v)} />
        <Input label="Position" placeholder="e.g. IT Engineer" value={form.title} error={errors.title} onChange={v => setField('title', v)} />
        <Input label="Badge Number" placeholder="e.g. ESI-1042" value={form.badgeNumber} error={errors.badgeNumber} onChange={v => setField('badgeNumber', v)} />
        <Input label="Department" placeholder="e.g. Engineering" value={form.department} error={errors.department} onChange={v => setField('department', v)} />
        <Input label="Office" placeholder="e.g. San Jose" value={form.location} error={errors.location} onChange={v => setField('location', v)} />
      </div>

      <div style={{ marginTop: '20px' }}>
        <ManagerCombobox value={form.manager} error={errors.manager} onChange={v => setField('manager', v)} />
      </div>

      <div style={{ marginTop: '32px' }}>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          Create Account
        </Button>
      </div>
    </form>
  );
}

// ─── Manager combobox ─────────────────────────────────────────────────────────

function ManagerCombobox({ value, error, onChange }: { value: string; error?: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? DUMMY_MANAGERS.filter(m => m.toLowerCase().includes(value.toLowerCase()))
    : DUMMY_MANAGERS;

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

  const borderColor = error ? '#ef4444' : focused ? colors.primary : '#d1d5db';

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
      <label style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '13px', lineHeight: '20px', color: colors.textPrimary }}>
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
            padding: '12px 40px 12px 14px',
            borderRadius: '8px',
            border: `1.5px solid ${borderColor}`,
            fontFamily: "'Archivo', sans-serif",
            fontSize: '15px',
            lineHeight: '26px',
            color: colors.textPrimary,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s ease',
          }}
        />
        <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: colors.blueGrayMd, display: 'flex' }}>
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
            backgroundColor: '#fff',
            border: '1.5px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(3,12,35,0.12)',
            maxHeight: '196px',
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
              style={{ padding: '12px 16px', fontFamily: "'Archivo', sans-serif", fontSize: '14px', color: colors.textPrimary, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f5ff')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
            >
              {name}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: '12px', color: '#ef4444' }}>
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
