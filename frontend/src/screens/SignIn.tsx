// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { AlertCircle, CheckCircle } = Icons;

const WORDMARK = "MediBook";
const PAGE_TITLE = "MediBook — Appointment & Consultation Management";
const SIGN_IN_ERROR = "Email or password is incorrect.";
const ROLE_NOTE =
  "Doctor and admin accounts are created by the clinic administrator; after signing in you are taken to the dashboard for your role.";

// Accounts the clinic has already provisioned or that patients have registered.
// Passwords are never stored or shown here; staff credentials are <set-at-first-login>.
const REGISTERED_EMAILS = [
  "asha.menon@northfield.clinic",
  "dr.ravi.iyer@northfield.clinic",
  "clinic.admin@northfield.clinic",
];

const TABS = [
  { key: "sign-in", label: "Sign in", wf: "i-1-0-0" },
  { key: "register", label: "Register as a patient", wf: "i-1-0-1" },
];

const tint = (pct) => `color-mix(in srgb, ${brand.primaryColor} ${pct}%, ${brand.backgroundColor})`;

export default function Screen() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState("sign-in");
  const [pending, setPending] = React.useState(null);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [signInError, setSignInError] = React.useState(false);

  const [reg, setReg] = React.useState({ full_name: "", email: "", phone: "", password: "", confirm: "" });
  const [regErrors, setRegErrors] = React.useState({});

  React.useEffect(() => {
    if (!pending) return undefined;
    const t = setTimeout(() => {
      setPending(null);
      navigate("find-a-doctor");
    }, 700);
    return () => clearTimeout(t);
  }, [pending]);

  const pill = { borderRadius: 999, border: 0, backgroundColor: tint(8), color: brand.primaryColor };
  const panel = { backgroundColor: tint(6), borderRadius: "200px 200px 0 0" };
  const panelFoot = { backgroundColor: tint(6), borderRadius: "0 0 24px 24px" };
  const muted = { color: brand.neutralColor };

  const setRegField = (key) => (e) => {
    const value = e.target.value;
    setReg((prev) => ({ ...prev, [key]: value }));
    setRegErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const onSignIn = (e) => {
    e.preventDefault();
    if (pending) return;
    const known = REGISTERED_EMAILS.indexOf(email.trim().toLowerCase()) !== -1;
    if (!known || password.length < 8) {
      setSignInError(true);
      return;
    }
    setSignInError(false);
    setPending("sign-in");
  };

  const onRegister = (e) => {
    e.preventDefault();
    if (pending) return;
    const next = {};
    if (!reg.full_name.trim()) next.full_name = "we need a name to put on your appointments";
    const cleanEmail = reg.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) next.email = "that does not look like an email address";
    else if (REGISTERED_EMAILS.indexOf(cleanEmail) !== -1) next.email = "that email is already in use — sign in instead";
    if (reg.phone.replace(/[^\d]/g, "").length < 7) next.phone = "a reachable phone number, please — reminders go out by email";
    if (reg.password.length < 8) next.password = "at least 8 characters";
    if (reg.confirm !== reg.password || !reg.confirm) next.confirm = "the two passwords do not match";
    setRegErrors(next);
    if (Object.keys(next).length) return;
    setPending("register");
  };

  const Field = ({ id, label, wf, type, value, onChange, error, hint, autoComplete, inputMode, tabular }) => (
    <div className="space-y-1">
      <label htmlFor={id} className="block pl-4 text-xs lowercase" style={muted}>
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
          ...pill,
          backgroundColor: error ? `color-mix(in srgb, ${brand.accentColor} 14%, ${brand.backgroundColor})` : pill.backgroundColor,
          fontVariantNumeric: tabular ? "tabular-nums" : undefined,
        }}
      />
      {error ? (
        <p id={id + "-msg"} className="flex items-start gap-1.5 pl-4 pt-0.5 text-xs" style={{ color: brand.primaryColor }}>
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={id + "-hint"} className="pl-4 pt-0.5 text-xs lowercase" style={muted}>
          {hint}
        </p>
      ) : null}
    </div>
  );

  const submitBtn = (wf, label, busyLabel, busy, formId) => (
    <button
      type="submit"
      form={formId}
      data-wf={wf}
      disabled={!!pending}
      className="atrium-focus mt-6 h-12 w-full text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-70"
      style={{ borderRadius: 999, backgroundColor: brand.accentColor, color: brand.backgroundColor }}
    >
      {busy ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="atrium-pulse inline-block h-2 w-2 rounded-full" style={{ backgroundColor: brand.backgroundColor }} aria-hidden="true" />
          {busyLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col" style={{ color: brand.primaryColor, fontFamily: brand.fontBody, backgroundColor: brand.backgroundColor }}>
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
        <p className="text-lg italic" style={{ fontFamily: brand.fontHeading }}>{WORDMARK}</p>
      </header>

      <div className="flex flex-1 justify-center px-6 py-12">
        <main className="w-full max-w-4xl">
          <div data-wf="b-0-0" className="text-center">
            <h1 className="text-3xl italic leading-tight sm:text-4xl" style={{ fontFamily: brand.fontHeading }}>
              {PAGE_TITLE}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm lowercase" style={muted}>
              book a consultation, keep your records in one place — the clinic handles fees in person.
            </p>
          </div>

          <div data-wf="b-1-0" className="mt-8 flex justify-center">
            <div role="tablist" aria-label="Sign in or register" className="inline-flex gap-1 p-1" style={{ borderRadius: 999, backgroundColor: tint(8) }}>
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
              <h2 className="text-center text-2xl italic" style={{ fontFamily: brand.fontHeading }}>Sign in</h2>
              <p className="mt-2 text-center text-sm lowercase" style={muted}>welcome back — patients, doctors and admins all start here</p>

              <form id="signin-form" className="mt-7 space-y-4 text-left" onSubmit={onSignIn} noValidate>
                <Field
                  id="signin-email"
                  wf="i-2-0-0"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSignInError(false); }}
                />
                <Field
                  id="signin-password"
                  wf="i-2-0-1"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setSignInError(false); }}
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
              <h2 className="text-center text-2xl italic" style={{ fontFamily: brand.fontHeading }}>Create a patient account</h2>
              <p className="mt-2 text-center text-sm lowercase" style={muted}>a minute now, then search by symptom and book a slot</p>

              <form id="register-form" className="mt-7 space-y-4 text-left" onSubmit={onRegister} noValidate>
                <Field id="reg-full-name" wf="i-2-1-0" label="Full name" type="text" autoComplete="name" value={reg.full_name} onChange={setRegField("full_name")} error={regErrors.full_name} />
                <Field id="reg-email" wf="i-2-1-1" label="Email" type="email" autoComplete="email" value={reg.email} onChange={setRegField("email")} error={regErrors.email} hint="confirmations and reminders go to this address" />
                <Field id="reg-phone" wf="i-2-1-2" label="Phone" type="tel" inputMode="tel" tabular autoComplete="tel" value={reg.phone} onChange={setRegField("phone")} error={regErrors.phone} />
                <Field id="reg-password" wf="i-2-1-3" label="Password" type="password" autoComplete="new-password" value={reg.password} onChange={setRegField("password")} error={regErrors.password} hint="8 characters or more; stored hashed, never in plain text" />
                <Field id="reg-confirm" wf="i-2-1-4" label="Confirm password" type="password" autoComplete="new-password" value={reg.confirm} onChange={setRegField("confirm")} error={regErrors.confirm} />
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
              {submitBtn("b-3-0-btn", "Sign in", "signing you in", pending === "sign-in", "signin-form")}
              <p className="mt-6 text-center text-xs lowercase" style={muted}>
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
              {submitBtn("b-3-1-btn", "Register", "creating your account", pending === "register", "register-form")}
              <p className="mt-6 text-center text-xs lowercase" style={muted}>
                you will be asked for health-data consent before your first booking.
              </p>
            </div>
          </div>

          <div
            data-wf="b-4-0"
            className="mx-auto mt-10 max-w-2xl px-7 py-5 text-center"
            style={{
              borderRadius: 24,
              backgroundColor: signInError ? `color-mix(in srgb, ${brand.accentColor} 16%, ${brand.backgroundColor})` : tint(6),
            }}
          >
            <p
              role={signInError ? "alert" : undefined}
              aria-live="polite"
              className="flex flex-col items-center gap-2 text-sm leading-relaxed sm:flex-row sm:items-start sm:text-left"
              style={{ color: brand.primaryColor }}
            >
              {signInError ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" style={muted} />
              )}
              <span>
                <span style={signInError ? { fontWeight: 600 } : muted}>{SIGN_IN_ERROR}</span>{" "}
                <span style={muted}>{ROLE_NOTE}</span>
              </span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
