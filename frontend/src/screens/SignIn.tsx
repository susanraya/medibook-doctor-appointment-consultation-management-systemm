import * as React from "react";

import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { ApiError } from "@/lib/api";
import { ROLE_HOME, useAuth } from "@/lib/auth";

const { AlertCircle, CheckCircle } = Icons;

const WORDMARK = "MediBook";
const PAGE_TITLE = "MediBook — Appointment & Consultation Management";
const SIGN_IN_ERROR = "Email or password is incorrect.";
const ROLE_NOTE =
  "Doctor and admin accounts are created by the clinic administrator; after signing in you are taken to the dashboard for your role.";

const TABS = [
  { key: "sign-in", label: "Sign in", wf: "i-1-0-0" },
  { key: "register", label: "Register as a patient", wf: "i-1-0-1" },
];

const tint = (pct: number) =>
  `color-mix(in srgb, ${brand.primaryColor} ${pct}%, ${brand.backgroundColor})`;

const PILL_STYLE = {
  borderRadius: 999,
  border: 0,
  backgroundColor: tint(8),
  color: brand.primaryColor,
};
const MUTED_STYLE = { color: brand.neutralColor };

type RegisterForm = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(reg: RegisterForm): RegisterErrors {
  const next: RegisterErrors = {};
  if (!reg.full_name.trim()) next.full_name = "we need a name to put on your appointments";
  const cleanEmail = reg.email.trim().toLowerCase();
  if (!EMAIL_RE.test(cleanEmail)) next.email = "that does not look like an email address";
  if (reg.phone.replace(/[^\d]/g, "").length < 7)
    next.phone = "a reachable phone number, please — reminders go out by email";
  if (reg.password.length < 8) next.password = "at least 8 characters";
  if (reg.confirm !== reg.password || !reg.confirm) next.confirm = "the two passwords do not match";
  return next;
}

// Hoisted to module scope: defined inside the screen component, this would be
// a fresh function identity on every render, and React treats a new identity
// used as a JSX tag as a different component -- unmounting and remounting
// the input (and losing whatever the user just typed) on every keystroke.
type FieldProps = {
  id: string;
  label: string;
  wf: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  tabular?: boolean;
};

function Field({
  id,
  label,
  wf,
  type,
  value,
  onChange,
  error,
  hint,
  autoComplete,
  inputMode,
  tabular,
}: FieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block pl-4 text-xs lowercase" style={MUTED_STYLE}>
        {label}
      </label>
      <input
        id={id}
        data-wf={wf}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? id + "-msg" : hint ? id + "-hint" : undefined}
        className="atrium-focus h-12 w-full px-5 text-sm outline-none"
        style={{
          ...PILL_STYLE,
          backgroundColor: error
            ? `color-mix(in srgb, ${brand.accentColor} 14%, ${brand.backgroundColor})`
            : PILL_STYLE.backgroundColor,
          fontVariantNumeric: tabular ? "tabular-nums" : undefined,
        }}
      />
      {error ? (
        <p
          id={id + "-msg"}
          className="flex items-start gap-1.5 pl-4 pt-0.5 text-xs"
          style={{ color: brand.primaryColor }}
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={id + "-hint"} className="pl-4 pt-0.5 text-xs lowercase" style={MUTED_STYLE}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton({
  wf,
  label,
  busyLabel,
  busy,
  formId,
  disabled,
}: {
  wf: string;
  label: string;
  busyLabel: string;
  busy: boolean;
  formId: string;
  disabled: boolean;
}) {
  return (
    <button
      type="submit"
      form={formId}
      data-wf={wf}
      disabled={disabled}
      className="atrium-focus mt-6 h-12 w-full text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-70"
      style={{
        borderRadius: 999,
        backgroundColor: brand.accentColor,
        color: brand.backgroundColor,
      }}
    >
      {busy ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span
            className="atrium-pulse inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: brand.backgroundColor }}
            aria-hidden="true"
          />
          {busyLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

export default function Screen() {
  const navigate = useNavigate();
  const { login, register, sessionNotice, clearSessionNotice } = useAuth();
  const [tab, setTab] = React.useState("sign-in");
  const [submitting, setSubmitting] = React.useState<"sign-in" | "register" | null>(null);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [signInError, setSignInError] = React.useState(false);

  const [reg, setReg] = React.useState<RegisterForm>({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [regErrors, setRegErrors] = React.useState<RegisterErrors>({});

  const panel = { backgroundColor: tint(6), borderRadius: "200px 200px 0 0" };
  const panelFoot = { backgroundColor: tint(6), borderRadius: "0 0 24px 24px" };

  const setRegField = (key: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReg((prev) => ({ ...prev, [key]: value }));
    setRegErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSignInError(false);
    clearSessionNotice();
    setSubmitting("sign-in");
    try {
      const user = await login(email, password);
      navigate(ROLE_HOME[user.role]);
    } catch {
      setSignInError(true);
    } finally {
      setSubmitting(null);
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const next = validateRegister(reg);
    setRegErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting("register");
    try {
      const user = await register({
        full_name: reg.full_name.trim(),
        email: reg.email.trim(),
        phone: reg.phone.trim(),
        password: reg.password,
      });
      navigate(ROLE_HOME[user.role]);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setRegErrors((prev) => ({ ...prev, email: "that email is already in use" }));
        } else if (err.status === 422 && Array.isArray(err.detail)) {
          const fieldErrors: RegisterErrors = {};
          for (const item of err.detail as Array<{ field: string; message: string }>) {
            if (item && typeof item.field === "string") {
              fieldErrors[item.field as keyof RegisterForm] = item.message;
            }
          }
          setRegErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
      }
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        color: brand.primaryColor,
        fontFamily: brand.fontBody,
        backgroundColor: brand.backgroundColor,
      }}
    >
      <style>{`
        .atrium-focus:focus-visible { outline: 2px solid ${brand.accentColor}; outline-offset: 2px; }
        @keyframes atrium-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes atrium-pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
        .atrium-rise { animation: atrium-rise .34s ease-out both; }
        .atrium-pulse { animation: atrium-pulse 1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .atrium-rise, .atrium-pulse { animation: none; }
        }
      `}</style>

      <header className="px-10 py-5" style={{ backgroundColor: tint(10) }}>
        <p className="text-lg italic" style={{ fontFamily: brand.fontHeading }}>
          {WORDMARK}
        </p>
      </header>

      <div className="flex flex-1 justify-center px-6 py-12">
        <main className="w-full max-w-4xl">
          <div data-wf="b-0-0" className="text-center">
            <h1
              className="text-3xl italic leading-tight sm:text-4xl"
              style={{ fontFamily: brand.fontHeading }}
            >
              {PAGE_TITLE}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm lowercase" style={MUTED_STYLE}>
              book a consultation, keep your records in one place — the clinic handles fees in
              person.
            </p>
          </div>

          {sessionNotice ? (
            <div
              role="status"
              aria-live="polite"
              className="atrium-rise mx-auto mt-8 max-w-2xl px-7 py-4 text-center text-sm"
              style={{
                borderRadius: 24,
                backgroundColor: `color-mix(in srgb, ${brand.accentColor} 16%, ${brand.backgroundColor})`,
              }}
            >
              {sessionNotice}
            </div>
          ) : null}

          <div data-wf="b-1-0" className="mt-8 flex justify-center">
            <div
              role="tablist"
              aria-label="Sign in or register"
              className="inline-flex gap-1 p-1"
              style={{ borderRadius: 999, backgroundColor: tint(8) }}
            >
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    data-wf={t.wf}
                    id={"tab-" + t.key}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    aria-controls={"panel-" + t.key + " actions-" + t.key}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setTab(t.key)}
                    className="atrium-focus h-11 px-6 text-sm transition-colors"
                    style={{
                      borderRadius: 999,
                      backgroundColor: active ? brand.primaryColor : "transparent",
                      color: active ? brand.backgroundColor : brand.primaryColor,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-8 md:flex-row md:justify-center">
            <section
              data-wf="b-2-0"
              id="panel-sign-in"
              role="tabpanel"
              aria-labelledby="tab-sign-in"
              tabIndex={0}
              hidden={tab !== "sign-in"}
              className="atrium-rise atrium-focus w-full px-9 pt-14 md:w-1/2"
              style={panel}
            >
              <h2 className="text-center text-2xl italic" style={{ fontFamily: brand.fontHeading }}>
                Sign in
              </h2>
              <p className="mt-2 text-center text-sm lowercase" style={MUTED_STYLE}>
                welcome back — patients, doctors and admins all start here
              </p>

              <form
                id="signin-form"
                className="mt-7 space-y-4 text-left"
                onSubmit={onSignIn}
                noValidate
              >
                <Field
                  id="signin-email"
                  wf="i-2-0-0"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSignInError(false);
                  }}
                />
                <Field
                  id="signin-password"
                  wf="i-2-0-1"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSignInError(false);
                  }}
                />
              </form>
            </section>

            <section
              data-wf="b-2-1"
              id="panel-register"
              role="tabpanel"
              aria-labelledby="tab-register"
              tabIndex={0}
              hidden={tab !== "register"}
              className="atrium-rise atrium-focus w-full px-9 pt-14 md:w-1/2"
              style={panel}
            >
              <h2 className="text-center text-2xl italic" style={{ fontFamily: brand.fontHeading }}>
                Create a patient account
              </h2>
              <p className="mt-2 text-center text-sm lowercase" style={MUTED_STYLE}>
                a minute now, then search by symptom and book a slot
              </p>

              <form
                id="register-form"
                className="mt-7 space-y-4 text-left"
                onSubmit={onRegister}
                noValidate
              >
                <Field
                  id="reg-full-name"
                  wf="i-2-1-0"
                  label="Full name"
                  type="text"
                  autoComplete="name"
                  value={reg.full_name}
                  onChange={setRegField("full_name")}
                  error={regErrors.full_name}
                />
                <Field
                  id="reg-email"
                  wf="i-2-1-1"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={reg.email}
                  onChange={setRegField("email")}
                  error={regErrors.email}
                  hint="confirmations and reminders go to this address"
                />
                <Field
                  id="reg-phone"
                  wf="i-2-1-2"
                  label="Phone"
                  type="tel"
                  inputMode="tel"
                  tabular
                  autoComplete="tel"
                  value={reg.phone}
                  onChange={setRegField("phone")}
                  error={regErrors.phone}
                />
                <Field
                  id="reg-password"
                  wf="i-2-1-3"
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  value={reg.password}
                  onChange={setRegField("password")}
                  error={regErrors.password}
                  hint="8 characters or more; stored hashed, never in plain text"
                />
                <Field
                  id="reg-confirm"
                  wf="i-2-1-4"
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  value={reg.confirm}
                  onChange={setRegField("confirm")}
                  error={regErrors.confirm}
                />
              </form>
            </section>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:justify-center">
            <div
              data-wf="b-3-0"
              id="actions-sign-in"
              hidden={tab !== "sign-in"}
              className="atrium-rise w-full px-9 pb-9 md:w-1/2"
              style={panelFoot}
            >
              <SubmitButton
                wf="b-3-0-btn"
                label="Sign in"
                busyLabel="signing you in"
                busy={submitting === "sign-in"}
                formId="signin-form"
                disabled={!!submitting}
              />
              <p className="mt-6 text-center text-xs lowercase" style={MUTED_STYLE}>
                sessions end when you sign out, and after a long quiet spell.
              </p>
            </div>

            <div
              data-wf="b-3-1"
              id="actions-register"
              hidden={tab !== "register"}
              className="atrium-rise w-full px-9 pb-9 md:w-1/2"
              style={panelFoot}
            >
              <SubmitButton
                wf="b-3-1-btn"
                label="Register"
                busyLabel="creating your account"
                busy={submitting === "register"}
                formId="register-form"
                disabled={!!submitting}
              />
              <p className="mt-6 text-center text-xs lowercase" style={MUTED_STYLE}>
                you will be asked for health-data consent before your first booking.
              </p>
            </div>
          </div>

          {signInError ? (
            <div
              data-wf="b-4-0"
              className="mx-auto mt-10 max-w-2xl px-7 py-5 text-center"
              style={{
                borderRadius: 24,
                backgroundColor: `color-mix(in srgb, ${brand.accentColor} 16%, ${brand.backgroundColor})`,
              }}
            >
              <p
                role="alert"
                aria-live="polite"
                className="flex flex-col items-center gap-2 text-sm leading-relaxed sm:flex-row sm:items-start sm:text-left"
                style={{ color: brand.primaryColor }}
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span style={{ fontWeight: 600 }}>{SIGN_IN_ERROR}</span>
              </p>
            </div>
          ) : (
            <div
              className="mx-auto mt-10 max-w-2xl px-7 py-5 text-center"
              style={{ borderRadius: 24, backgroundColor: tint(6) }}
            >
              <p
                className="flex flex-col items-center gap-2 text-sm leading-relaxed sm:flex-row sm:items-start sm:text-left"
                style={{ color: brand.primaryColor }}
              >
                <CheckCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                  style={MUTED_STYLE}
                />
                <span style={MUTED_STYLE}>{ROLE_NOTE}</span>
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
