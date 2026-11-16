// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Input, Textarea, Label, Select, Badge, Avatar, Separator } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Check, ArrowRight, AlertCircle, CheckCircle } = Icons;

const SPECIALIZATIONS = [
  { id: 'sp-01', name: 'Cardiology', is_active: true },
  { id: 'sp-02', name: 'Dermatology', is_active: true },
  { id: 'sp-03', name: 'ENT — Ear, Nose & Throat', is_active: true },
  { id: 'sp-04', name: 'General Medicine', is_active: true },
  { id: 'sp-05', name: 'Neurology', is_active: true },
  { id: 'sp-06', name: 'Obstetrics & Gynaecology', is_active: true },
  { id: 'sp-07', name: 'Orthopaedics', is_active: true },
  { id: 'sp-08', name: 'Paediatrics', is_active: true },
  { id: 'sp-09', name: 'Psychiatry', is_active: true },
  { id: 'sp-10', name: 'Rheumatology', is_active: false }
];

// emails already held by another account — checked server-side on PUT /me/profile
const EMAILS_IN_USE = [
  'm.adeyemi@atriumclinic.test',
  'j.whitfield@mailbox.test',
  'priya.nair@atriumclinic.test'
];

const ACCOUNT = {
  id: 'usr-2041',
  role: 'doctor',
  full_name: 'Dr. Susan Raya',
  email: 'susan.raya@quorq.ai',
  phone: '+44 7700 900412',
  created_at: '18 Mar 2024',
  last_saved: '14 Nov 2026, 09:14'
};

const DOCTOR_PROFILE = {
  specialization_id: 'sp-02',
  bio:
    'Consultant dermatologist, fourteen years in general and paediatric skin care. Special interest in eczema, psoriasis and stubborn adult acne. Clinics at Atrium House on Mondays, Tuesdays and Thursdays.',
  contact: 'Atrium House, Room 4 · 020 7946 0318 · mon–thu, 09:00–16:00'
};

const CONSENT = {
  consented: true,
  consented_at_label: '12 Oct 2026, 14:32'
};

const BIO_LIMIT = 600;

function hexA(hex, alpha) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
}

export default function Screen() {
  const navigate = useNavigate();
  const ink = brand.primaryColor;
  const accent = brand.accentColor;
  const cream = brand.backgroundColor;

  const inkSoft = hexA(ink, 0.78);
  const hair = hexA(ink, 0.13);
  const tint = hexA(ink, 0.06);

  const initial = React.useMemo(
    () => ({
      full_name: ACCOUNT.full_name,
      email: ACCOUNT.email,
      phone: ACCOUNT.phone,
      specialization_id: DOCTOR_PROFILE.specialization_id,
      bio: DOCTOR_PROFILE.bio,
      contact: DOCTOR_PROFILE.contact
    }),
    []
  );

  const [form, setForm] = React.useState(initial);
  const [saved, setSaved] = React.useState(initial);
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState('idle'); // idle | saving | saved | taken
  const [lastSaved, setLastSaved] = React.useState(ACCOUNT.last_saved);
  const timer = React.useRef(null);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const isDoctor = ACCOUNT.role === 'doctor';
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const activeSpecs = SPECIALIZATIONS.filter(s => s.is_active);
  const specName = (SPECIALIZATIONS.find(s => s.id === form.specialization_id) || {}).name || '';

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => (e[key] ? { ...e, [key]: undefined } : e));
    if (status === 'taken' || status === 'saved') setStatus('idle');
  }

  function validate(v) {
    const e = {};
    if (!v.full_name.trim()) e.full_name = 'tell us the name the clinic should use.';
    if (!v.email.trim()) e.email = 'we need an email for appointment notices.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'that does not look like an email address.';
    if (!v.phone.trim()) e.phone = 'a phone number is required for reminders.';
    else if (!/^[+0-9][0-9 ()\-]{6,}$/.test(v.phone.trim())) e.phone = 'use digits, spaces, + or ( ) only.';
    if (isDoctor) {
      if (!v.specialization_id) e.specialization_id = 'choose a specialization from the clinic list.';
      if (!v.contact.trim()) e.contact = 'patients see this line — give them a way to reach you.';
      if (v.bio.length > BIO_LIMIT) e.bio = 'your bio is longer than ' + BIO_LIMIT + ' characters.';
    }
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) {
      setStatus('idle');
      const first = document.querySelector('[data-invalid="true"]');
      if (first && first.focus) first.focus();
      return;
    }
    setStatus('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (EMAILS_IN_USE.indexOf(form.email.trim().toLowerCase()) !== -1) {
        setStatus('taken'); // input values are kept exactly as typed
      } else {
        setSaved(form);
        setLastSaved('16 Nov 2026, ' + new Date().toTimeString().slice(0, 5));
        setStatus('saved');
      }
    }, 900);
  }

  const css = `
    .atr { --ink: ${ink}; --accent: ${accent}; --cream: ${cream}; }
    .atr-arch { border-radius: 50% 50% ${brand.radius} ${brand.radius} / 104px 104px ${brand.radius} ${brand.radius}; }
    .atr-tile { border-radius: 999px 999px 10px 10px; }
    .atr-field { transition: box-shadow .18s ease, background-color .18s ease, border-color .18s ease; }
    .atr-field:hover { background-color: rgba(255,255,255,.95); }
    .atr-field:focus { outline: 2px solid var(--ink); outline-offset: 2px; background-color: #fff; }
    .atr-field:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
    .atr-btn { transition: transform .16s ease, background-color .18s ease, box-shadow .18s ease, opacity .18s ease; }
    .atr-btn:not(:disabled):hover { transform: translateY(-1px); }
    .atr-btn:not(:disabled):active { transform: translateY(0); }
    .atr-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
    .atr-ghost:not(:disabled):hover { background-color: ${hexA(ink, 0.08)}; }
    @keyframes atrRise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    @keyframes atrSpin { to { transform: rotate(360deg); } }
    .atr-enter { animation: atrRise .34s cubic-bezier(.22,.61,.36,1) both; }
    .atr-spin { animation: atrSpin .85s linear infinite; }
    @media (prefers-reduced-motion: reduce) {
      .atr .atr-enter, .atr .atr-spin { animation: none !important; }
      .atr .atr-btn, .atr .atr-field { transition: none !important; }
    }
  `;

  const fieldStyle = {
    backgroundColor: 'rgba(255,255,255,0.82)',
    border: '1px solid ' + hair,
    color: ink,
    fontFamily: brand.fontBody
  };
  const fieldCls = 'atr-field w-full rounded-full px-5 h-12 text-[15px] leading-none';
  const labelCls = 'block text-[13px] lowercase tracking-[0.03em] mb-2';

  const panelStyle = {
    backgroundColor: tint,
    border: '1px solid ' + hair
  };

  function FieldError({ id, msg }) {
    if (!msg) return null;
    return (
      <p id={id} className="atr-enter mt-2 flex items-start gap-1.5 text-[13px]" style={{ color: ink }}>
        <AlertCircle className="h-4 w-4 shrink-0 mt-[1px]" aria-hidden="true" />
        <span>{msg}</span>
      </p>
    );
  }

  return (
    <div className="atr w-full min-h-full" style={{ fontFamily: brand.fontBody, color: ink }}>
      <style>{css}</style>

      <div className="mx-auto w-full max-w-[1120px] px-6 sm:px-8 pt-10 pb-20">

        {/* ── Row 1 ── */}
        <header data-wf="b-0-0" className="flex flex-wrap items-end justify-between gap-6 pb-8">
          <div>
            <p className="text-[12px] lowercase tracking-[0.22em]" style={{ color: inkSoft }}>
              atrium house · medibook
            </p>
            <h1
              className="mt-3 text-[40px] leading-[1.1] italic"
              style={{ fontFamily: brand.fontHeading, color: ink }}
            >
              My Account
            </h1>
            <div className="mt-3 h-[3px] w-20 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
            <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.6]" style={{ color: inkSoft }}>
              your details, exactly as the clinic and your patients see them. changes take effect the next time a
              reminder goes out.
            </p>
          </div>

          <dl className="flex items-center gap-5 text-[13px]" style={{ color: inkSoft }}>
            <div>
              <dt className="lowercase tracking-[0.03em]">account</dt>
              <dd className="mt-1 font-medium" style={{ color: ink }}>doctor · {ACCOUNT.id}</dd>
            </div>
            <div className="h-8 w-px" style={{ backgroundColor: hair }} aria-hidden="true" />
            <div>
              <dt className="lowercase tracking-[0.03em]">with the clinic since</dt>
              <dd className="mt-1 font-medium" style={{ color: ink, fontVariantNumeric: 'tabular-nums' }}>
                {ACCOUNT.created_at}
              </dd>
            </div>
          </dl>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Row 2 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* b-1-0 Profile details */}
            <section
              data-wf="b-1-0"
              aria-labelledby="h-profile"
              className="atr-arch px-7 sm:px-10 pt-14 pb-10"
              style={panelStyle}
            >
              <div className="text-center">
                <p className="text-[11px] lowercase tracking-[0.24em]" style={{ color: inkSoft }}>
                  everyone
                </p>
                <h2 id="h-profile" className="mt-2 text-[25px] italic" style={{ fontFamily: brand.fontHeading }}>
                  Profile details
                </h2>
                <p className="mt-2 mx-auto max-w-[34ch] text-[14px] leading-[1.6]" style={{ color: inkSoft }}>
                  used for sign-in, booking confirmations and appointment reminders.
                </p>
              </div>

              <div className="mt-9 space-y-6">
                <div>
                  <Label htmlFor="full_name" className={labelCls} style={{ color: inkSoft }}>full name</Label>
                  <Input
                    id="full_name"
                    data-wf="i-1-0-0"
                    name="full_name"
                    value={form.full_name}
                    onChange={e => set('full_name', e.target.value)}
                    className={fieldCls}
                    style={fieldStyle}
                    autoComplete="name"
                    aria-invalid={errors.full_name ? 'true' : undefined}
                    data-invalid={errors.full_name ? 'true' : undefined}
                    aria-describedby={errors.full_name ? 'err-full_name' : undefined}
                  />
                  <FieldError id="err-full_name" msg={errors.full_name} />
                </div>

                <div>
                  <Label htmlFor="email" className={labelCls} style={{ color: inkSoft }}>email</Label>
                  <Input
                    id="email"
                    data-wf="i-1-0-1"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className={fieldCls}
                    style={{
                      ...fieldStyle,
                      borderColor: status === 'taken' ? hexA(ink, 0.45) : hair,
                      fontVariantNumeric: 'tabular-nums'
                    }}
                    autoComplete="email"
                    aria-invalid={errors.email || status === 'taken' ? 'true' : undefined}
                    data-invalid={errors.email ? 'true' : undefined}
                    aria-describedby={
                      errors.email ? 'err-email' : status === 'taken' ? 'save-status' : 'hint-email'
                    }
                  />
                  <FieldError id="err-email" msg={errors.email} />
                  {!errors.email && (
                    <p id="hint-email" className="mt-2 text-[13px]" style={{ color: inkSoft }}>
                      changing this changes the address you sign in with.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className={labelCls} style={{ color: inkSoft }}>phone</Label>
                  <Input
                    id="phone"
                    data-wf="i-1-0-2"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    className={fieldCls}
                    style={{ ...fieldStyle, fontVariantNumeric: 'tabular-nums' }}
                    autoComplete="tel"
                    aria-invalid={errors.phone ? 'true' : undefined}
                    data-invalid={errors.phone ? 'true' : undefined}
                    aria-describedby={errors.phone ? 'err-phone' : undefined}
                  />
                  <FieldError id="err-phone" msg={errors.phone} />
                </div>
              </div>
            </section>

            {/* b-1-1 Doctor profile */}
            <section
              data-wf="b-1-1"
              aria-labelledby="h-doctor"
              className="atr-arch px-7 sm:px-10 pt-14 pb-10"
              style={panelStyle}
            >
              <div className="text-center">
                <Badge
                  className="rounded-full px-3 py-1 text-[11px] lowercase tracking-[0.18em] border-0"
                  style={{ backgroundColor: hexA(accent, 0.3), color: ink }}
                >
                  doctors only
                </Badge>
                <h2 id="h-doctor" className="mt-3 text-[25px] italic" style={{ fontFamily: brand.fontHeading }}>
                  Doctor profile
                </h2>
                <p className="mt-2 mx-auto max-w-[34ch] text-[14px] leading-[1.6]" style={{ color: inkSoft }}>
                  what patients read about you in search results before they book.
                </p>
              </div>

              <div className="mt-9 space-y-6">
                <div>
                  <Label htmlFor="specialization_id" className={labelCls} style={{ color: inkSoft }}>
                    specialization
                  </Label>
                  <Select
                    id="specialization_id"
                    data-wf="i-1-1-0"
                    name="specialization_id"
                    value={form.specialization_id}
                    onChange={e => set('specialization_id', e.target.value)}
                    className={fieldCls + ' pr-10'}
                    style={fieldStyle}
                    aria-invalid={errors.specialization_id ? 'true' : undefined}
                    data-invalid={errors.specialization_id ? 'true' : undefined}
                    aria-describedby={errors.specialization_id ? 'err-spec' : 'hint-spec'}
                  >
                    {activeSpecs.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                  <FieldError id="err-spec" msg={errors.specialization_id} />
                  {!errors.specialization_id && (
                    <p id="hint-spec" className="mt-2 text-[13px]" style={{ color: inkSoft }}>
                      {activeSpecs.length} specializations, kept by the clinic administrator. retired ones
                      (rheumatology) are no longer offered.
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <Label htmlFor="bio" className={labelCls} style={{ color: inkSoft }}>bio</Label>
                    <span
                      className="text-[12px] mb-2"
                      style={{ color: inkSoft, fontVariantNumeric: 'tabular-nums' }}
                      aria-hidden="true"
                    >
                      {form.bio.length}/{BIO_LIMIT}
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    data-wf="i-1-1-1"
                    name="bio"
                    rows={5}
                    value={form.bio}
                    onChange={e => set('bio', e.target.value)}
                    className="atr-field w-full px-5 py-4 text-[15px] leading-[1.6] resize-y"
                    style={{ ...fieldStyle, borderRadius: brand.radius }}
                    aria-invalid={errors.bio ? 'true' : undefined}
                    data-invalid={errors.bio ? 'true' : undefined}
                    aria-describedby={errors.bio ? 'err-bio' : undefined}
                  />
                  <FieldError id="err-bio" msg={errors.bio} />
                </div>

                <div>
                  <Label htmlFor="contact" className={labelCls} style={{ color: inkSoft }}>
                    contact shown to patients
                  </Label>
                  <Input
                    id="contact"
                    data-wf="i-1-1-2"
                    name="contact"
                    value={form.contact}
                    onChange={e => set('contact', e.target.value)}
                    className={fieldCls}
                    style={{ ...fieldStyle, fontVariantNumeric: 'tabular-nums' }}
                    aria-invalid={errors.contact ? 'true' : undefined}
                    data-invalid={errors.contact ? 'true' : undefined}
                    aria-describedby={errors.contact ? 'err-contact' : undefined}
                  />
                  <FieldError id="err-contact" msg={errors.contact} />
                </div>

                <div
                  className="mt-2 p-5"
                  style={{ backgroundColor: hexA(cream, 0.9), borderRadius: brand.radius, border: '1px solid ' + hair }}
                >
                  <p className="text-[11px] lowercase tracking-[0.2em]" style={{ color: inkSoft }}>
                    how patients see you
                  </p>
                  <div className="mt-3 flex items-start gap-3">
                    <Avatar name={form.full_name || 'Atrium Clinician'} className="h-10 w-10 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium truncate" style={{ color: ink }}>
                        {form.full_name || 'name not set'}
                      </p>
                      <p className="text-[13px]" style={{ color: inkSoft }}>{specName}</p>
                      <p className="mt-1 text-[13px] truncate" style={{ color: inkSoft, fontVariantNumeric: 'tabular-nums' }}>
                        {form.contact || 'no contact line yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ── Row 3 ── */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <Button
                data-wf="b-2-0"
                type="submit"
                disabled={!dirty || status === 'saving'}
                className="atr-btn w-full sm:w-auto rounded-full px-9 h-14 text-[15px] tracking-[0.02em] border-0 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: ink,
                  color: cream,
                  opacity: !dirty || status === 'saving' ? 0.45 : 1,
                  boxShadow: !dirty || status === 'saving' ? 'none' : '0 10px 24px ' + hexA(ink, 0.22)
                }}
              >
                {status === 'saving' ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="atr-spin inline-block h-4 w-4 rounded-full"
                      style={{ border: '2px solid ' + hexA(cream, 0.35), borderTopColor: cream }}
                      aria-hidden="true"
                    />
                    saving your details…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Save changes
                  </span>
                )}
              </Button>
            </div>

            <div data-wf="b-2-1" id="save-status" role="status" aria-live="polite" className="min-h-[48px] flex items-center">
              {status === 'taken' && (
                <p
                  className="atr-enter flex items-start gap-2.5 px-5 py-3 text-[14px] leading-[1.55]"
                  style={{
                    backgroundColor: hexA(ink, 0.08),
                    border: '1px solid ' + hexA(ink, 0.3),
                    borderRadius: brand.radius,
                    color: ink
                  }}
                >
                  <AlertCircle className="h-5 w-5 shrink-0 mt-[1px]" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold">That email is already in use by another account.</strong>{' '}
                    nothing was saved — your edits are still here. try a different address or ask the clinic
                    administrator to merge the accounts.
                  </span>
                </p>
              )}
              {status === 'saved' && (
                <p className="atr-enter flex items-center gap-2.5 text-[14px]" style={{ color: ink }}>
                  <CheckCircle className="h-5 w-5 shrink-0" style={{ color: accent }} aria-hidden="true" />
                  <span>
                    saved. your profile is live for patients — updated{' '}
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{lastSaved}</span>.
                  </span>
                </p>
              )}
              {status === 'saving' && (
                <p className="text-[14px]" style={{ color: inkSoft }}>
                  checking the email is free, then writing your profile…
                </p>
              )}
              {status === 'idle' && (
                <p className="text-[14px] leading-[1.55]" style={{ color: inkSoft }}>
                  {dirty ? (
                    <>unsaved edits on this page. nothing reaches patients until you save.</>
                  ) : (
                    <>
                      nothing to save — this matches what the clinic has on file. last change{' '}
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{lastSaved}</span>.
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </form>

        {/* ── Row 4 ── */}
        <section
          data-wf="b-3-0"
          aria-labelledby="h-consent"
          className="mt-14 px-7 sm:px-10 py-9"
          style={{
            backgroundColor: hexA(accent, 0.12),
            border: '1px solid ' + hexA(accent, 0.45),
            borderRadius: brand.radius
          }}
        >
          <div className="flex flex-wrap items-start gap-6">
            <div
              className="atr-tile flex h-20 w-14 shrink-0 items-end justify-center pb-3"
              style={{ backgroundColor: ink }}
              aria-hidden="true"
            >
              <Check className="h-6 w-6" style={{ color: cream }} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 id="h-consent" className="text-[23px] italic leading-snug" style={{ fontFamily: brand.fontHeading }}>
                Health-data consent — Given on{' '}
                <span style={{ fontVariantNumeric: 'tabular-nums', fontStyle: 'normal' }}>
                  {CONSENT.consented_at_label}
                </span>
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px]" style={{ color: inkSoft }}>
                <Badge
                  className="rounded-full px-3 py-1 text-[12px] lowercase tracking-[0.1em] border-0 inline-flex items-center gap-1.5"
                  style={{ backgroundColor: ink, color: cream }}
                >
                  <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  recorded
                </Badge>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  timestamped for audit · account {ACCOUNT.id}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Row 5 ── */}
        <p
          data-wf="b-4-0"
          className="mt-6 max-w-[72ch] text-[15px] leading-[1.7]"
          style={{ color: inkSoft }}
        >
          You agreed to the clinic storing and processing your health data for consultations. Consent is required
          before booking or saving consultation data.
        </p>

        <div className="mt-12 mb-8" style={{ color: hair }}>
          <Separator />
        </div>

        {/* ── Row 6 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <Button
            data-wf="b-5-0"
            type="button"
            onClick={() => navigate('sign-in')}
            className="atr-btn atr-ghost w-full sm:w-auto rounded-full px-8 h-13 min-h-[52px] text-[15px] bg-transparent"
            style={{ border: '1px solid ' + hexA(ink, 0.4), color: ink }}
          >
            <span className="inline-flex items-center gap-2">
              Sign out
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Button>
          <p className="sm:col-span-2 text-[13px]" style={{ color: inkSoft }}>
            ends this session on every tab. you will need your email and password to come back.
          </p>
        </div>
      </div>
    </div>
  );
}
