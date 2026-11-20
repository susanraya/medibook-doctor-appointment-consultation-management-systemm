// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { ApiError, apiFetch } from "@/lib/api";

const { Button, Input, Label, Select, Table, THead, TBody, TR, TH, TD, Avatar, Empty } = UI;

const { User, Home, ArrowLeft, ArrowRight } = Icons;

const CLINIC = "Meadowlane Clinic";

const TAB_DEFS = [
  { key: "accounts", label: "Accounts", wf: "i-1-0-0" },
  { key: "specializations", label: "Specializations", wf: "i-1-0-1" },
  { key: "mappings", label: "Disease mappings", wf: "i-1-0-2" },
  { key: "appointments", label: "Appointments", wf: "i-1-0-3" },
  { key: "availability", label: "Availability", wf: "i-1-0-4" },
  { key: "email", label: "Email & logs", wf: "i-1-0-5" },
];

const SPECS_SEED = [
  { id: "SPC-001", name: "Cardiology", doctors: 3, mappings: 4, is_active: true },
  { id: "SPC-002", name: "Dermatology", doctors: 2, mappings: 5, is_active: true },
  { id: "SPC-003", name: "Endocrinology", doctors: 1, mappings: 3, is_active: true },
  { id: "SPC-004", name: "ENT (Otolaryngology)", doctors: 1, mappings: 2, is_active: true },
  { id: "SPC-005", name: "Gastroenterology", doctors: 2, mappings: 3, is_active: true },
  { id: "SPC-006", name: "General Medicine", doctors: 4, mappings: 7, is_active: true },
  { id: "SPC-007", name: "Neurology", doctors: 2, mappings: 4, is_active: true },
  { id: "SPC-008", name: "Orthopaedics", doctors: 2, mappings: 3, is_active: true },
  { id: "SPC-009", name: "Paediatrics", doctors: 3, mappings: 2, is_active: true },
  { id: "SPC-010", name: "Psychiatry", doctors: 1, mappings: 3, is_active: false },
  { id: "SPC-011", name: "Pulmonology", doctors: 1, mappings: 2, is_active: true },
  { id: "SPC-012", name: "Travel Medicine", doctors: 0, mappings: 0, is_active: false },
];

const SPEC_BACKLOG = ["Rheumatology", "Ophthalmology", "Urology"];

const MAPPING_BACKLOG = [
  { term: "ringing in the ears", specs: ["ENT (Otolaryngology)"] },
  { term: "palpitations", specs: ["Cardiology", "General Medicine"] },
  { term: "persistent cough", specs: ["Pulmonology", "General Medicine"] },
];

// Doctor and admin accounts come from the server (GET /admin/users); no sample
// staff rows are seeded here any more (US-003-2).

const MAPPINGS_SEED = [
  {
    id: "MAP-014",
    term: "chest pain",
    specs: ["Cardiology", "General Medicine"],
    updated: "14 Nov 2026",
  },
  {
    id: "MAP-013",
    term: "shortness of breath",
    specs: ["Pulmonology", "Cardiology"],
    updated: "12 Nov 2026",
  },
  {
    id: "MAP-011",
    term: "migraine",
    specs: ["Neurology", "General Medicine"],
    updated: "09 Nov 2026",
  },
  { id: "MAP-010", term: "eczema", specs: ["Dermatology"], updated: "09 Nov 2026" },
  {
    id: "MAP-009",
    term: "type 2 diabetes",
    specs: ["Endocrinology", "General Medicine"],
    updated: "06 Nov 2026",
  },
  {
    id: "MAP-008",
    term: "persistent sore throat",
    specs: ["ENT (Otolaryngology)"],
    updated: "04 Nov 2026",
  },
  { id: "MAP-007", term: "acid reflux", specs: ["Gastroenterology"], updated: "02 Nov 2026" },
  { id: "MAP-006", term: "knee injury", specs: ["Orthopaedics"], updated: "28 Oct 2026" },
  { id: "MAP-004", term: "childhood fever", specs: ["Paediatrics"], updated: "26 Oct 2026" },
  {
    id: "MAP-002",
    term: "low mood",
    specs: ["Psychiatry", "General Medicine"],
    updated: "21 Oct 2026",
  },
];

const APPTS_SEED = [
  {
    id: "APT-2288",
    patient: "Elena Marsh",
    doctorId: "USR-0023",
    doctor: "Dr. Anita Raghunathan",
    dateISO: "2026-11-16",
    when: "Mon 16 Nov · 09:00",
    status: "scheduled",
  },
  {
    id: "APT-2264",
    patient: "Dev Shanmugam",
    doctorId: "USR-0036",
    doctor: "Dr. Priya Venkatesan",
    dateISO: "2026-11-16",
    when: "Mon 16 Nov · 09:30",
    status: "completed",
  },
  {
    id: "APT-2290",
    patient: "Róisín Doyle",
    doctorId: "USR-0031",
    doctor: "Dr. Søren Falk",
    dateISO: "2026-11-16",
    when: "Mon 16 Nov · 10:00",
    status: "scheduled",
  },
  {
    id: "APT-2281",
    patient: "Marcus Webb",
    doctorId: "USR-0041",
    doctor: "Dr. Hélène Dubois",
    dateISO: "2026-11-16",
    when: "Mon 16 Nov · 11:15",
    status: "no_show",
  },
  {
    id: "APT-2292",
    patient: "Yusuf Demir",
    doctorId: "USR-0044",
    doctor: "Dr. Rafael Ortiz",
    dateISO: "2026-11-16",
    when: "Mon 16 Nov · 14:00",
    status: "scheduled",
  },
  {
    id: "APT-2295",
    patient: "Alice Nwosu",
    doctorId: "USR-0023",
    doctor: "Dr. Anita Raghunathan",
    dateISO: "2026-11-17",
    when: "Tue 17 Nov · 08:45",
    status: "scheduled",
  },
  {
    id: "APT-2271",
    patient: "Hannah Pike",
    doctorId: "USR-0047",
    doctor: "Dr. Marcus Oyelaran",
    dateISO: "2026-11-17",
    when: "Tue 17 Nov · 10:30",
    status: "reassign",
  },
  {
    id: "APT-2274",
    patient: "Tobias Lindqvist",
    doctorId: "USR-0047",
    doctor: "Dr. Marcus Oyelaran",
    dateISO: "2026-11-18",
    when: "Wed 18 Nov · 09:15",
    status: "reassign",
  },
  {
    id: "APT-2297",
    patient: "Grace Oduya",
    doctorId: "USR-0036",
    doctor: "Dr. Priya Venkatesan",
    dateISO: "2026-11-18",
    when: "Wed 18 Nov · 13:00",
    status: "scheduled",
  },
  {
    id: "APT-2299",
    patient: "Felix Arnott",
    doctorId: "USR-0023",
    doctor: "Dr. Anita Raghunathan",
    dateISO: "2026-11-19",
    when: "Thu 19 Nov · 10:15",
    status: "scheduled",
  },
  {
    id: "APT-2284",
    patient: "Laurent Michel",
    doctorId: "USR-0031",
    doctor: "Dr. Søren Falk",
    dateISO: "2026-11-19",
    when: "Thu 19 Nov · 15:30",
    status: "cancelled",
  },
  {
    id: "APT-2301",
    patient: "Keiko Tanaka",
    doctorId: "USR-0044",
    doctor: "Dr. Rafael Ortiz",
    dateISO: "2026-11-20",
    when: "Fri 20 Nov · 11:00",
    status: "scheduled",
  },
  {
    id: "APT-2303",
    patient: "Idris Bello",
    doctorId: "USR-0051",
    doctor: "Dr. Jin-Ho Park",
    dateISO: "2026-11-20",
    when: "Fri 20 Nov · 09:30",
    status: "scheduled",
  },
  {
    id: "APT-2259",
    patient: "Omar Haddad",
    doctorId: "USR-0041",
    doctor: "Dr. Hélène Dubois",
    dateISO: "2026-11-13",
    when: "Fri 13 Nov · 16:00",
    status: "completed",
  },
  {
    id: "APT-2262",
    patient: "Bea Fontaine",
    doctorId: "USR-0023",
    doctor: "Dr. Anita Raghunathan",
    dateISO: "2026-11-14",
    when: "Sat 14 Nov · 10:00",
    status: "cancelled",
  },
];

const FREE_SLOTS = [
  { id: "SLT-5512", doctorId: "USR-0023", label: "Tue 17 Nov · 11:30", dateISO: "2026-11-17" },
  { id: "SLT-5519", doctorId: "USR-0023", label: "Thu 19 Nov · 14:30", dateISO: "2026-11-19" },
  { id: "SLT-5524", doctorId: "USR-0031", label: "Wed 18 Nov · 09:45", dateISO: "2026-11-18" },
  { id: "SLT-5530", doctorId: "USR-0036", label: "Thu 19 Nov · 08:30", dateISO: "2026-11-19" },
  { id: "SLT-5533", doctorId: "USR-0041", label: "Wed 18 Nov · 11:00", dateISO: "2026-11-18" },
  { id: "SLT-5541", doctorId: "USR-0044", label: "Fri 20 Nov · 15:00", dateISO: "2026-11-20" },
  { id: "SLT-5547", doctorId: "USR-0051", label: "Thu 19 Nov · 16:15", dateISO: "2026-11-19" },
];

const AUDIT_SEED = [
  {
    id: "AUD-9041",
    user: "Susan Raya",
    action: "appointment.reassign",
    entity_type: "appointment",
    entity_id: "APT-2291",
    ts: "16 Nov 2026 · 09:12",
  },
  {
    id: "AUD-9040",
    user: "Dr. Anita Raghunathan",
    action: "consultation.view",
    entity_type: "consultation_record",
    entity_id: "CR-0843",
    ts: "16 Nov 2026 · 08:58",
  },
  {
    id: "AUD-9038",
    user: "Nadia Khoury",
    action: "doctor.deactivate",
    entity_type: "user",
    entity_id: "USR-0047",
    ts: "15 Nov 2026 · 17:40",
  },
  {
    id: "AUD-9036",
    user: "Dr. Rafael Ortiz",
    action: "consultation.update",
    entity_type: "consultation_record",
    entity_id: "CR-0839",
    ts: "15 Nov 2026 · 16:22",
  },
  {
    id: "AUD-9033",
    user: "Susan Raya",
    action: "mapping.update",
    entity_type: "disease_mapping",
    entity_id: "MAP-014",
    ts: "14 Nov 2026 · 11:05",
  },
  {
    id: "AUD-9031",
    user: "Dr. Priya Venkatesan",
    action: "appointment.status",
    entity_type: "appointment",
    entity_id: "APT-2264",
    ts: "14 Nov 2026 · 10:31",
  },
  {
    id: "AUD-9029",
    user: "Nadia Khoury",
    action: "email_settings.update",
    entity_type: "setting",
    entity_id: "SET-002",
    ts: "14 Nov 2026 · 09:02",
  },
  {
    id: "AUD-9026",
    user: "Susan Raya",
    action: "specialization.create",
    entity_type: "specialization",
    entity_id: "SPC-012",
    ts: "13 Nov 2026 · 15:47",
  },
];

const NOTIF_SEED = [
  {
    id: "NTF-4418",
    appointment: "APT-2291",
    kind: "reschedule",
    status: "sent",
    error: "—",
    ts: "16 Nov 2026 · 09:12",
  },
  {
    id: "NTF-4417",
    appointment: "APT-2288",
    kind: "confirmation",
    status: "sent",
    error: "—",
    ts: "16 Nov 2026 · 08:41",
  },
  {
    id: "NTF-4415",
    appointment: "APT-2284",
    kind: "reminder",
    status: "failed",
    error: "provider rejected the stored key (401)",
    ts: "15 Nov 2026 · 20:00",
  },
  {
    id: "NTF-4413",
    appointment: "APT-2280",
    kind: "cancellation",
    status: "sent",
    error: "—",
    ts: "15 Nov 2026 · 18:12",
  },
  {
    id: "NTF-4412",
    appointment: "APT-2276",
    kind: "reminder",
    status: "queued",
    error: "waiting for a valid provider key",
    ts: "15 Nov 2026 · 17:55",
  },
  {
    id: "NTF-4409",
    appointment: "APT-2271",
    kind: "confirmation",
    status: "sent",
    error: "—",
    ts: "14 Nov 2026 · 12:03",
  },
  {
    id: "NTF-4406",
    appointment: "APT-2268",
    kind: "reminder",
    status: "failed",
    error: "timeout contacting provider",
    ts: "14 Nov 2026 · 07:00",
  },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOT_LENGTHS = [15, 20, 30, 45, 60];

export default function Screen() {
  const navigate = useNavigate();
  const ink = brand.primaryColor;
  const brass = brand.accentColor;
  const cream = brand.backgroundColor;
  const sage = brand.neutralColor;

  const toRgb = (hex) => {
    const s = String(hex).replace("#", "");
    const full =
      s.length === 3
        ? s
            .split("")
            .map((c) => c + c)
            .join("")
        : s;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const mix = (a, b, t) => {
    const A = toRgb(a);
    const B = toRgb(b);
    return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)}, ${Math.round(A[1] + (B[1] - A[1]) * t)}, ${Math.round(A[2] + (B[2] - A[2]) * t)})`;
  };
  const alpha = (hex, a) => {
    const [r, g, b] = toRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  const accentHsl = (() => {
    const [r, g, b] = toRgb(brass).map((v) => v / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    let h = 0;
    let s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      if (max === r) h = 60 * (((g - b) / d) % 6);
      else if (max === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
    }
    if (h < 0) h += 360;
    return { h, s, l };
  })();
  const clayHue = Math.round((accentHsl.h - 26 + 360) % 360);
  const claySat = Math.round(Math.min(100, accentHsl.s * 100 + 12));
  const clay = `hsl(${clayHue}deg ${claySat}% ${Math.round(Math.max(12, accentHsl.l * 100 - 16))}%)`;
  const clayTint = `hsl(${clayHue}deg ${Math.round(claySat * 0.7)}% 92%)`;

  const hair = alpha(ink, 0.13);
  const surface = "rgba(255, 255, 255, 0.62)";
  const inset = alpha(ink, 0.05);
  const muted = mix(sage, ink, 0.5);
  const accentText = mix(brass, ink, 0.45);

  const panelStyle = {
    backgroundColor: surface,
    border: `1px solid ${hair}`,
    borderRadius: brand.radius,
  };
  const archStyle = {
    backgroundColor: surface,
    border: `1px solid ${hair}`,
    borderRadius: `150px 150px ${brand.radius} ${brand.radius}`,
  };
  const ringVars = { "--tw-ring-color": brass, "--tw-ring-offset-color": cream };
  const inputCls =
    "w-full rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.75)",
    border: `1px solid ${hair}`,
    color: ink,
    borderRadius: 999,
    ...ringVars,
  };
  const btnFocus = "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const primaryBtn = {
    backgroundColor: ink,
    color: cream,
    borderRadius: 999,
    border: `1px solid ${ink}`,
    ...ringVars,
  };
  const quietBtn = {
    backgroundColor: "transparent",
    color: ink,
    borderRadius: 999,
    border: `1px solid ${hair}`,
    ...ringVars,
  };
  const thCls = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]";
  const tdCls = "px-4 py-4 text-sm align-middle";
  const tableStyle = { fontVariantNumeric: "tabular-nums", width: "100%" };

  const timers = React.useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  const [tab, setTab] = React.useState("accounts");
  const tabRefs = React.useRef({});

  const [accounts, setAccounts] = React.useState([]);
  const [accountsLoading, setAccountsLoading] = React.useState(true);
  const [accountsError, setAccountsError] = React.useState(null); // "forbidden" | "error" | null
  const [acctForm, setAcctForm] = React.useState({
    full_name: "",
    email: "",
    phone: "",
    role: "doctor",
  });
  const [acctErrors, setAcctErrors] = React.useState({});
  const [acctSaving, setAcctSaving] = React.useState(false);
  const [acctNotice, setAcctNotice] = React.useState(null);

  const toAccountRow = (u) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    is_active: u.is_active,
    password_status: u.password_status,
    status: u.is_active ? "active" : "deactivated",
    specialization: "—",
  });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setAccountsLoading(true);
      setAccountsError(null);
      try {
        const res = await apiFetch("/admin/users");
        if (!cancelled) setAccounts(res.users.map(toAccountRow));
      } catch (err) {
        if (cancelled) return;
        setAccountsError(err instanceof ApiError && err.status === 403 ? "forbidden" : "error");
      } finally {
        if (!cancelled) setAccountsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [specs, setSpecs] = React.useState(SPECS_SEED);
  const [specQueue, setSpecQueue] = React.useState(SPEC_BACKLOG);
  const [specNotice, setSpecNotice] = React.useState(null);
  const [specBlock, setSpecBlock] = React.useState(null);

  const [mappings, setMappings] = React.useState(MAPPINGS_SEED);
  const [mapQueue, setMapQueue] = React.useState(MAPPING_BACKLOG);
  const [mapNotice, setMapNotice] = React.useState(null);

  const [appts, setAppts] = React.useState(APPTS_SEED);
  const [usedSlots, setUsedSlots] = React.useState([]);
  const [filters, setFilters] = React.useState({
    doctor: "all",
    patient: "",
    date: "",
    status: "all",
  });
  const [selectedAppt, setSelectedAppt] = React.useState(null);
  const [apptNotice, setApptNotice] = React.useState(null);
  const [apptError, setApptError] = React.useState("");

  const [avail, setAvail] = React.useState({
    doctorId: "USR-0023",
    day: "Tuesday",
    start: "09:00",
    end: "13:00",
    slot: 30,
    blockFrom: "2026-11-16",
    blockTo: "2026-11-21",
  });
  const [availError, setAvailError] = React.useState("");
  const [availWarn, setAvailWarn] = React.useState(false);
  const [availSaving, setAvailSaving] = React.useState(false);
  const [availNotice, setAvailNotice] = React.useState(null);

  const [emailForm, setEmailForm] = React.useState({
    apiKey: "",
    sender: "appointments@meadowlane.health",
    lead: 24,
  });
  const [emailError, setEmailError] = React.useState("");
  const [emailSaving, setEmailSaving] = React.useState(false);
  const [emailNotice, setEmailNotice] = React.useState(null);

  const [audit, setAudit] = React.useState(AUDIT_SEED);
  const [notifs, setNotifs] = React.useState(NOTIF_SEED);

  const doctors = accounts.filter((a) => a.role === "doctor");
  const activeSpecs = specs.filter((s) => s.is_active);

  const pushAudit = (action, entity_type, entity_id) => {
    setAudit((prev) => [
      {
        id: "AUD-" + (9042 + prev.length),
        user: "Susan Raya",
        action,
        entity_type,
        entity_id,
        ts: "16 Nov 2026 · 09:4" + Math.min(9, prev.length),
        fresh: true,
      },
      ...prev,
    ]);
  };
  const pushNotif = (appointment, kind) => {
    setNotifs((prev) => [
      {
        id: "NTF-" + (4419 + prev.length),
        appointment,
        kind,
        status: "sent",
        error: "—",
        ts: "16 Nov 2026 · 09:4" + Math.min(9, prev.length),
        fresh: true,
      },
      ...prev,
    ]);
  };

  const statusMeta = (key) => {
    const map = {
      scheduled: { label: "Scheduled", Icon: Icons.Calendar, bg: alpha(ink, 0.07), fg: ink },
      completed: {
        label: "Completed",
        Icon: Icons.CheckCircle,
        bg: alpha(brass, 0.2),
        fg: accentText,
      },
      cancelled: { label: "Cancelled", Icon: Icons.X, bg: alpha(ink, 0.05), fg: muted },
      no_show: { label: "No-show", Icon: Icons.AlertCircle, bg: alpha(ink, 0.07), fg: muted },
      reassign: { label: "Needs reassignment", Icon: Icons.AlertCircle, bg: clayTint, fg: clay },
      active: { label: "Active", Icon: Icons.Check, bg: alpha(brass, 0.2), fg: accentText },
      deactivated: { label: "Deactivated", Icon: Icons.X, bg: alpha(ink, 0.06), fg: muted },
      invited: { label: "Invite pending", Icon: Icons.Clock, bg: alpha(ink, 0.07), fg: ink },
      sent: { label: "Sent", Icon: Icons.Check, bg: alpha(brass, 0.2), fg: accentText },
      failed: { label: "Failed", Icon: Icons.AlertCircle, bg: clayTint, fg: clay },
      queued: { label: "Queued", Icon: Icons.Clock, bg: alpha(ink, 0.07), fg: ink },
    };
    return map[key] || map.scheduled;
  };

  const pill = (key) => {
    const m = statusMeta(key);
    const I = m.Icon;
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap"
        style={{ backgroundColor: m.bg, color: m.fg }}
      >
        <I className="h-3.5 w-3.5" aria-hidden="true" />
        {m.label}
      </span>
    );
  };

  const sectionHead = (title, desc, extra) => (
    <div className="flex flex-wrap items-end justify-between gap-4 px-6 pt-6 pb-4">
      <div>
        <h2
          className="text-[22px] leading-tight"
          style={{ fontFamily: brand.fontHeading, fontStyle: "italic", color: ink }}
        >
          {title}
        </h2>
        {desc ? (
          <p className="mt-1 text-[13px]" style={{ color: muted }}>
            {desc}
          </p>
        ) : null}
      </div>
      {extra}
    </div>
  );

  const noticeBar = (tone, text, onDismiss) => {
    const tones = {
      good: { bg: alpha(brass, 0.16), fg: accentText, Icon: Icons.CheckCircle },
      warn: { bg: clayTint, fg: clay, Icon: Icons.AlertCircle },
      calm: { bg: alpha(ink, 0.06), fg: ink, Icon: Icons.Bell },
    };
    const t = tones[tone] || tones.calm;
    const I = t.Icon;
    return (
      <div
        className="atrium-rise flex items-start gap-3 rounded-[20px] px-5 py-4 text-sm"
        style={{ backgroundColor: t.bg, color: t.fg }}
        role="status"
      >
        <I className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p className="flex-1 leading-relaxed">{text}</p>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss this message"
            className={"rounded-full p-1 " + btnFocus}
            style={ringVars}
          >
            <Icons.X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    );
  };

  const onTabKeyDown = (e, idx) => {
    let next = null;
    if (e.key === "ArrowRight") next = (idx + 1) % TAB_DEFS.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + TAB_DEFS.length) % TAB_DEFS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TAB_DEFS.length - 1;
    if (next !== null) {
      e.preventDefault();
      const key = TAB_DEFS[next].key;
      setTab(key);
      const el = tabRefs.current[key];
      if (el) el.focus();
    }
  };

  /* ---------------- accounts ---------------- */

  const submitAccount = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!acctForm.full_name.trim())
      errs.full_name = "a full name is needed for the roster and for patient search.";
    if (!acctForm.email.trim()) errs.email = "an email address is needed — it is how they sign in.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(acctForm.email.trim()))
      errs.email = "that does not look like an email address.";
    if (!acctForm.phone.trim()) errs.phone = "a contact phone number is needed.";
    setAcctErrors(errs);
    if (Object.keys(errs).length) {
      setAcctNotice(null);
      return;
    }
    setAcctSaving(true);
    setAcctNotice(null);
    try {
      const created = await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          full_name: acctForm.full_name.trim(),
          email: acctForm.email.trim(),
          phone: acctForm.phone.trim(),
          role: acctForm.role,
        }),
      });
      const row = { ...toAccountRow(created), fresh: true };
      setAccounts((prev) => [row, ...prev]);
      pushAudit("user.create", "user", row.id);
      setAcctNotice({
        tone: "good",
        text:
          row.full_name +
          " now has a " +
          row.role +
          " account. the password is held as <set-at-first-login> until they sign in and set their own.",
      });
      setAcctForm({ full_name: "", email: "", phone: "", role: "doctor" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAcctErrors({ email: "that email is already in use." });
      } else if (err instanceof ApiError && err.status === 422 && Array.isArray(err.detail)) {
        const fieldErrs = {};
        for (const item of err.detail) {
          if (item && typeof item.field === "string") fieldErrs[item.field] = item.message;
        }
        setAcctErrors(fieldErrs);
      } else {
        setAcctNotice({
          tone: "warn",
          text: "something went wrong creating that account — please try again.",
        });
      }
    } finally {
      setAcctSaving(false);
    }
  };

  const toggleAccount = async (acct) => {
    const nextActive = !acct.is_active;
    try {
      const updated = await apiFetch(`/admin/users/${acct.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ is_active: nextActive }),
      });
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === acct.id
            ? {
                ...a,
                is_active: updated.is_active,
                status: updated.is_active ? "active" : "deactivated",
              }
            : a,
        ),
      );
      if (!updated.is_active) {
        const affected = appts.filter((a) => a.doctorId === acct.id && a.status === "scheduled");
        setAppts((prev) =>
          prev.map((a) =>
            a.doctorId === acct.id && a.status === "scheduled" ? { ...a, status: "reassign" } : a,
          ),
        );
        pushAudit("doctor.deactivate", "user", acct.id);
        setAcctNotice({
          tone: "warn",
          text:
            acct.full_name +
            " is hidden from patient search and can no longer sign in. " +
            affected.length +
            (affected.length === 1 ? " appointment is" : " appointments are") +
            " flagged for reassignment.",
        });
      } else {
        pushAudit("doctor.reactivate", "user", acct.id);
        setAcctNotice({
          tone: "good",
          text: acct.full_name + " is back in patient search and can sign in again.",
        });
      }
    } catch {
      setAcctNotice({
        tone: "warn",
        text: "could not update " + acct.full_name + "'s status — please try again.",
      });
    }
  };

  const renderAccounts = () => (
    <div className="space-y-8">
      {acctNotice ? noticeBar(acctNotice.tone, acctNotice.text, () => setAcctNotice(null)) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section
          data-wf="b-2-0"
          className="lg:col-span-7"
          style={panelStyle}
          aria-labelledby="accounts-table-h"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 px-6 pt-6 pb-4">
            <div>
              <h2
                id="accounts-table-h"
                className="text-[22px] leading-tight"
                style={{ fontFamily: brand.fontHeading, fontStyle: "italic", color: ink }}
              >
                Doctor &amp; admin accounts
              </h2>
              <p className="mt-1 text-[13px]" style={{ color: muted }}>
                {accountsLoading
                  ? "loading…"
                  : accountsError
                    ? ""
                    : accounts.length +
                      " provisioned · patients never appear here, they register themselves."}
              </p>
            </div>
          </div>
          {accountsError === "forbidden" ? (
            <div className="px-6 pb-6">
              <Empty
                title="not available for your role"
                description="this section is for clinic administrators only."
              />
            </div>
          ) : accountsError ? (
            <div className="px-6 pb-6">
              <Empty
                title="could not load staff accounts"
                description="please try again in a moment."
              />
            </div>
          ) : accountsLoading ? (
            <div className="px-6 pb-6 text-sm" style={{ color: muted }} role="status">
              loading staff accounts…
            </div>
          ) : accounts.length === 0 ? (
            <div className="px-6 pb-6">
              <Empty
                title="no staff accounts yet"
                description="provision the first doctor or admin account using the form."
              />
            </div>
          ) : (
            <div className="overflow-x-auto px-2 pb-6">
              <Table style={tableStyle}>
                <THead>
                  <TR style={{ borderBottom: `1px solid ${hair}` }}>
                    <TH data-wf="i-2-0-0" scope="col" className={thCls} style={{ color: muted }}>
                      Full name
                    </TH>
                    <TH data-wf="i-2-0-1" scope="col" className={thCls} style={{ color: muted }}>
                      Email
                    </TH>
                    <TH data-wf="i-2-0-2" scope="col" className={thCls} style={{ color: muted }}>
                      Role
                    </TH>
                    <TH data-wf="i-2-0-3" scope="col" className={thCls} style={{ color: muted }}>
                      Password
                    </TH>
                    <TH data-wf="i-2-0-4" scope="col" className={thCls} style={{ color: muted }}>
                      Status
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {accounts.map((a) => (
                    <TR
                      key={a.id}
                      className={a.fresh ? "atrium-rise" : ""}
                      style={{ borderBottom: `1px solid ${hair}` }}
                    >
                      <TD className={tdCls}>
                        <div className="flex items-center gap-3">
                          <Avatar name={a.full_name} className="h-8 w-8" />
                          <div>
                            <div className="font-medium" style={{ color: ink }}>
                              {a.full_name}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: muted, fontVariantNumeric: "tabular-nums" }}
                            >
                              {a.id}
                            </div>
                          </div>
                        </div>
                      </TD>
                      <TD className={tdCls} style={{ color: muted }}>
                        {a.email}
                      </TD>
                      <TD className={tdCls}>
                        <span
                          className="rounded-full px-3 py-1 text-xs capitalize"
                          style={{ backgroundColor: inset, color: ink }}
                        >
                          {a.role}
                        </span>
                      </TD>
                      <TD
                        className={tdCls}
                        style={{ color: muted, fontVariantNumeric: "tabular-nums" }}
                      >
                        {a.password_status}
                      </TD>
                      <TD className={tdCls}>
                        <div className="flex items-center gap-3">
                          {pill(a.status)}
                          <button
                            type="button"
                            onClick={() => toggleAccount(a)}
                            className={
                              "rounded-full px-3 py-1.5 text-xs underline-offset-4 hover:underline " +
                              btnFocus
                            }
                            style={{
                              color: a.status === "active" ? clay : accentText,
                              ...ringVars,
                            }}
                          >
                            {a.status === "active" ? "Deactivate" : "Reactivate"}
                            <span className="sr-only"> {a.full_name}</span>
                          </button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </section>

        <section
          data-wf="b-2-1"
          className="lg:col-span-5"
          style={archStyle}
          aria-labelledby="new-account-h"
        >
          <form id="new-account-form" onSubmit={submitAccount} className="px-6 pb-6 pt-12 sm:px-8">
            <div className="text-center">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: alpha(brass, 0.22), color: accentText }}
              >
                <Icons.Users className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2
                id="new-account-h"
                className="mt-4 text-[26px] leading-tight"
                style={{ fontFamily: brand.fontHeading, fontStyle: "italic", color: ink }}
              >
                New doctor or admin account
              </h2>
              <p
                className="mx-auto mt-2 max-w-[42ch] text-[13px] leading-relaxed"
                style={{ color: muted }}
              >
                staff accounts are provisioned here — they are never self-registered.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <Label
                  htmlFor="acct-name"
                  className="mb-2 block text-[13px] font-medium"
                  style={{ color: ink }}
                >
                  Full name
                </Label>
                <Input
                  data-wf="i-2-1-0"
                  id="acct-name"
                  value={acctForm.full_name}
                  onChange={(e) => setAcctForm({ ...acctForm, full_name: e.target.value })}
                  placeholder="Dr. Imogen Hartley"
                  className={inputCls}
                  style={inputStyle}
                  aria-invalid={acctErrors.full_name ? "true" : undefined}
                  aria-describedby={acctErrors.full_name ? "acct-name-err" : undefined}
                />
                {acctErrors.full_name ? (
                  <p id="acct-name-err" className="mt-2 text-xs" style={{ color: clay }}>
                    {acctErrors.full_name}
                  </p>
                ) : null}
              </div>

              <div>
                <Label
                  htmlFor="acct-email"
                  className="mb-2 block text-[13px] font-medium"
                  style={{ color: ink }}
                >
                  Email
                </Label>
                <Input
                  data-wf="i-2-1-1"
                  id="acct-email"
                  type="email"
                  value={acctForm.email}
                  onChange={(e) => setAcctForm({ ...acctForm, email: e.target.value })}
                  placeholder="i.hartley@meadowlane.health"
                  className={inputCls}
                  style={inputStyle}
                  aria-invalid={acctErrors.email ? "true" : undefined}
                  aria-describedby={acctErrors.email ? "acct-email-err" : undefined}
                />
                {acctErrors.email ? (
                  <p id="acct-email-err" className="mt-2 text-xs" style={{ color: clay }}>
                    {acctErrors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <Label
                  htmlFor="acct-phone"
                  className="mb-2 block text-[13px] font-medium"
                  style={{ color: ink }}
                >
                  Phone
                </Label>
                <Input
                  data-wf="i-2-1-2"
                  id="acct-phone"
                  value={acctForm.phone}
                  onChange={(e) => setAcctForm({ ...acctForm, phone: e.target.value })}
                  placeholder="+44 20 7946 0000"
                  className={inputCls}
                  style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }}
                  aria-invalid={acctErrors.phone ? "true" : undefined}
                  aria-describedby={acctErrors.phone ? "acct-phone-err" : undefined}
                />
                {acctErrors.phone ? (
                  <p id="acct-phone-err" className="mt-2 text-xs" style={{ color: clay }}>
                    {acctErrors.phone}
                  </p>
                ) : null}
              </div>

              <div>
                <Label
                  htmlFor="acct-role"
                  className="mb-2 block text-[13px] font-medium"
                  style={{ color: ink }}
                >
                  Role
                </Label>
                <Select
                  data-wf="i-2-1-3"
                  id="acct-role"
                  value={acctForm.role}
                  onChange={(e) => setAcctForm({ ...acctForm, role: e.target.value })}
                  className={inputCls}
                  style={inputStyle}
                >
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: muted }}>
                no credential is collected here — the account holder sets their own password the
                first time they sign in, and only a hash is ever kept.
              </p>
            </div>
          </form>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
        <div className="md:col-span-4">
          <Button
            data-wf="b-3-0"
            type="submit"
            form="new-account-form"
            disabled={acctSaving}
            className={
              "w-full justify-center px-6 py-3.5 text-sm font-medium transition-opacity " +
              btnFocus +
              (acctSaving ? " opacity-70" : " hover:opacity-90")
            }
            style={primaryBtn}
          >
            {acctSaving ? "creating account…" : "Create account"}
          </Button>
        </div>
        <div className="md:col-span-4">
          <button
            data-wf="b-3-1"
            type="button"
            onClick={() => navigate("find-a-doctor")}
            className={
              "inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium underline-offset-4 hover:underline " +
              btnFocus
            }
            style={quietBtn}
          >
            Preview patient search results
            <Icons.ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p
          data-wf="b-3-2"
          className="md:col-span-4 text-[13px] leading-relaxed"
          style={{ color: muted }}
        >
          Deactivating a doctor hides them from search and flags their appointments for
          reassignment.
        </p>
      </div>
    </div>
  );

  /* ---------------- specializations ---------------- */

  const addSpecialization = () => {
    if (!specQueue.length) return;
    const name = specQueue[0];
    setSpecBlock(null);
    if (specs.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setSpecQueue((q) => q.slice(1));
      setSpecNotice(null);
      setSpecBlock(
        name +
          " is already on the list, so nothing was added. it has been taken off the waiting list.",
      );
      return;
    }
    const id = "SPC-0" + (13 + specs.length);
    setSpecs((prev) => [
      ...prev,
      { id, name, doctors: 0, mappings: 0, is_active: true, fresh: true },
    ]);
    pushAudit("specialization.create", "specialization", id);
    setSpecQueue((q) => q.slice(1));
    setSpecNotice(
      name +
        " added from the list the clinical lead signed off. it is now offered wherever a specialization is chosen.",
    );
  };

  const removeSpec = (s) => {
    if (s.doctors > 0 || s.mappings > 0) {
      setSpecNotice(null);
      setSpecBlock(
        s.name +
          " is assigned to " +
          s.doctors +
          (s.doctors === 1 ? " doctor" : " doctors") +
          " and used in " +
          s.mappings +
          (s.mappings === 1 ? " mapping entry" : " mapping entries") +
          ". move those first, then it can be removed.",
      );
      return;
    }
    setSpecs((prev) => prev.filter((x) => x.id !== s.id));
    pushAudit("specialization.delete", "specialization", s.id);
    setSpecBlock(null);
    setSpecNotice(
      s.name + " removed. no doctor and no mapping entry depended on it, so nothing else changed.",
    );
  };

  const renderSpecializations = () => (
    <div className="space-y-8">
      {specNotice ? noticeBar("good", specNotice, () => setSpecNotice(null)) : null}
      {specBlock ? noticeBar("warn", specBlock, () => setSpecBlock(null)) : null}

      <section data-wf="b-4-0" style={panelStyle} aria-labelledby="specs-h">
        {sectionHead(
          "Specializations",
          specs.length + " defined · " + activeSpecs.length + " offered to doctors and patients",
        )}
        <div className="overflow-x-auto px-2 pb-6">
          <Table style={tableStyle}>
            <THead>
              <TR style={{ borderBottom: `1px solid ${hair}` }}>
                <TH data-wf="i-4-0-0" scope="col" className={thCls} style={{ color: muted }}>
                  Name
                </TH>
                <TH data-wf="i-4-0-1" scope="col" className={thCls} style={{ color: muted }}>
                  Doctors assigned
                </TH>
                <TH data-wf="i-4-0-2" scope="col" className={thCls} style={{ color: muted }}>
                  Used in mappings
                </TH>
                <TH data-wf="i-4-0-3" scope="col" className={thCls} style={{ color: muted }}>
                  Active
                </TH>
              </TR>
            </THead>
            <TBody>
              {specs.map((s) => (
                <TR
                  key={s.id}
                  className={s.fresh ? "atrium-rise" : ""}
                  style={{ borderBottom: `1px solid ${hair}` }}
                >
                  <TD className={tdCls}>
                    <span className="font-medium" style={{ color: ink }}>
                      {s.name}
                    </span>
                    <span className="ml-2 text-xs" style={{ color: muted }}>
                      {s.id}
                    </span>
                  </TD>
                  <TD className={tdCls} style={{ color: s.doctors ? ink : muted }}>
                    {s.doctors}
                  </TD>
                  <TD className={tdCls} style={{ color: s.mappings ? ink : muted }}>
                    {s.mappings}
                  </TD>
                  <TD className={tdCls}>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        aria-pressed={s.is_active}
                        onClick={() => {
                          setSpecs((prev) =>
                            prev.map((x) =>
                              x.id === s.id ? { ...x, is_active: !x.is_active } : x,
                            ),
                          );
                          pushAudit(
                            s.is_active ? "specialization.hide" : "specialization.show",
                            "specialization",
                            s.id,
                          );
                        }}
                        className={
                          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium " +
                          btnFocus
                        }
                        style={{
                          backgroundColor: s.is_active ? alpha(brass, 0.2) : alpha(ink, 0.06),
                          color: s.is_active ? accentText : muted,
                          ...ringVars,
                        }}
                      >
                        {s.is_active ? (
                          <Icons.Check className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Icons.X className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {s.is_active ? "Active" : "Hidden"}
                        <span className="sr-only">
                          — {s.name}, select to {s.is_active ? "hide" : "show"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSpec(s)}
                        className={
                          "rounded-full px-2 py-1 text-xs underline-offset-4 hover:underline " +
                          btnFocus
                        }
                        style={{ color: muted, ...ringVars }}
                      >
                        Remove<span className="sr-only"> {s.name}</span>
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </section>

      <div className="space-y-4">
        <Button
          data-wf="b-5-0"
          type="button"
          onClick={addSpecialization}
          disabled={!specQueue.length}
          aria-describedby="add-spec-hint"
          className={
            "inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium " +
            btnFocus +
            (specQueue.length ? " hover:opacity-90" : " opacity-45")
          }
          style={primaryBtn}
        >
          <Icons.Plus className="h-4 w-4" aria-hidden="true" />
          Add specialization
        </Button>
        <p
          id="add-spec-hint"
          className="max-w-[60ch] text-[13px] leading-relaxed"
          style={{ color: muted, fontVariantNumeric: "tabular-nums" }}
        >
          {specQueue.length
            ? "next in line: " +
              specQueue[0] +
              " · " +
              specQueue.length +
              (specQueue.length === 1 ? " specialization" : " specializations") +
              " waiting from the clinical lead."
            : "nothing is waiting — the clinical lead sends the next specialization to add."}
        </p>
      </div>
    </div>
  );

  /* ---------------- mappings ---------------- */

  const addMapping = () => {
    if (!mapQueue.length) return;
    const next = mapQueue[0];
    if (mappings.some((m) => m.term.toLowerCase() === next.term.toLowerCase())) {
      setMapQueue((q) => q.slice(1));
      setMapNotice({
        tone: "warn",
        text:
          "“" +
          next.term +
          "” is already mapped, so nothing was added. it has been taken off the waiting list.",
      });
      return;
    }
    const known = next.specs.filter((n) => specs.some((s) => s.name === n && s.is_active));
    if (!known.length) {
      setMapNotice({
        tone: "warn",
        text:
          "“" +
          next.term +
          "” cannot be saved yet — " +
          next.specs.join(" and ") +
          " is not on the specialization list. add it under Specializations first, then this entry will go through.",
      });
      return;
    }
    const id = "MAP-0" + (15 + mappings.length);
    setMappings((prev) => [
      { id, term: next.term, specs: known, updated: "16 Nov 2026", fresh: true },
      ...prev,
    ]);
    setSpecs((prev) =>
      prev.map((s) => (known.includes(s.name) ? { ...s, mappings: s.mappings + 1 } : s)),
    );
    pushAudit("mapping.create", "disease_mapping", id);
    setMapQueue((q) => q.slice(1));
    setMapNotice({
      tone: "good",
      text:
        "“" +
        next.term +
        "” now resolves to " +
        known.join(" and ") +
        " — one of the unmapped searches the clinical lead has reviewed. patient search uses it from the next lookup, by static table only.",
    });
  };

  const renderMappings = () => (
    <div className="space-y-8">
      {mapNotice ? noticeBar(mapNotice.tone, mapNotice.text, () => setMapNotice(null)) : null}

      <section data-wf="b-4-1" style={panelStyle} aria-labelledby="map-h">
        {sectionHead(
          "Disease / symptom mappings",
          mappings.length + " entries · resolved by static lookup, never by a model",
          <span
            className="rounded-full px-4 py-2 text-xs"
            style={{ backgroundColor: alpha(brass, 0.16), color: accentText }}
          >
            owned by admin
          </span>,
        )}
        <div className="overflow-x-auto px-2 pb-6">
          <Table style={tableStyle}>
            <THead>
              <TR style={{ borderBottom: `1px solid ${hair}` }}>
                <TH data-wf="i-4-1-0" scope="col" className={thCls} style={{ color: muted }}>
                  Term
                </TH>
                <TH data-wf="i-4-1-1" scope="col" className={thCls} style={{ color: muted }}>
                  Mapped specializations
                </TH>
                <TH data-wf="i-4-1-2" scope="col" className={thCls} style={{ color: muted }}>
                  Updated
                </TH>
              </TR>
            </THead>
            <TBody>
              {mappings.map((m) => (
                <TR
                  key={m.id}
                  className={m.fresh ? "atrium-rise" : ""}
                  style={{ borderBottom: `1px solid ${hair}` }}
                >
                  <TD className={tdCls}>
                    <span className="font-medium" style={{ color: ink }}>
                      {m.term}
                    </span>
                    <span className="ml-2 text-xs" style={{ color: muted }}>
                      {m.id}
                    </span>
                  </TD>
                  <TD className={tdCls}>
                    <ul className="flex flex-wrap gap-2">
                      {m.specs.map((s) => (
                        <li
                          key={s}
                          className="rounded-full px-3 py-1 text-xs"
                          style={{ backgroundColor: inset, color: ink }}
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </TD>
                  <TD className={tdCls} style={{ color: muted }}>
                    {m.updated}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </section>

      <div className="space-y-4">
        <Button
          data-wf="b-5-1"
          type="button"
          onClick={addMapping}
          disabled={!mapQueue.length}
          aria-describedby="add-map-hint"
          className={
            "inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium " +
            btnFocus +
            (mapQueue.length ? " hover:opacity-90" : " opacity-45")
          }
          style={primaryBtn}
        >
          <Icons.Plus className="h-4 w-4" aria-hidden="true" />
          Add mapping entry
        </Button>
        <p
          id="add-map-hint"
          className="max-w-[66ch] text-[13px] leading-relaxed"
          style={{ color: muted, fontVariantNumeric: "tabular-nums" }}
        >
          {mapQueue.length
            ? "next in line: “" +
              mapQueue[0].term +
              "” → " +
              mapQueue[0].specs.join(" and ") +
              " · " +
              mapQueue.length +
              " reviewed from last week's unmapped searches."
            : "every reviewed search term is mapped — new ones appear here once the clinical lead has looked at them."}
        </p>
      </div>
    </div>
  );

  /* ---------------- appointments ---------------- */

  const filtered = appts.filter((a) => {
    if (filters.doctor !== "all" && a.doctorId !== filters.doctor) return false;
    if (filters.status !== "all" && a.status !== filters.status) return false;
    if (filters.date && a.dateISO !== filters.date) return false;
    if (
      filters.patient.trim() &&
      !a.patient.toLowerCase().includes(filters.patient.trim().toLowerCase())
    )
      return false;
    return true;
  });
  const selected = appts.find((a) => a.id === selectedAppt) || null;
  const filtersDirty =
    filters.doctor !== "all" ||
    filters.status !== "all" ||
    !!filters.date ||
    !!filters.patient.trim();

  const reassignSelected = () => {
    if (!selected) return;
    const activeDoctorIds = accounts
      .filter((d) => d.role === "doctor" && d.status === "active")
      .map((d) => d.id);
    const open = FREE_SLOTS.filter(
      (s) => !usedSlots.includes(s.id) && activeDoctorIds.includes(s.doctorId),
    );
    const slot = open.find((s) => s.doctorId === selected.doctorId) || open[0];
    if (!slot) {
      setApptNotice(null);
      setApptError(
        "no free slot is left in this week's diaries, so " +
          selected.id +
          " has not moved. open more availability under the Availability tab, then try again.",
      );
      return;
    }
    const doc = accounts.find((a) => a.id === slot.doctorId);
    setAppts((prev) =>
      prev.map((a) =>
        a.id === selected.id
          ? {
              ...a,
              doctorId: doc.id,
              doctor: doc.full_name,
              dateISO: slot.dateISO,
              when: slot.label,
              status: "scheduled",
              fresh: true,
            }
          : a,
      ),
    );
    setUsedSlots((prev) => [...prev, slot.id]);
    pushAudit("appointment.reassign", "appointment", selected.id);
    pushNotif(selected.id, "reschedule");
    setApptError("");
    setApptNotice({
      tone: "good",
      text:
        selected.id +
        " moved to " +
        doc.full_name +
        ", " +
        slot.label +
        " — the next free slot under the same double-booking rules. the old slot is open again and a reschedule email is on its way.",
    });
  };

  const cancelSelected = () => {
    if (!selected) return;
    const a = selected;
    setAppts((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: "cancelled" } : x)));
    pushAudit("appointment.cancel", "appointment", a.id);
    pushNotif(a.id, "cancellation");
    setApptError("");
    setApptNotice({
      tone: "calm",
      text:
        a.id +
        " cancelled on behalf of the clinic. " +
        a.when +
        " with " +
        a.doctor +
        " is open again and " +
        a.patient +
        " has been emailed.",
    });
    setSelectedAppt(null);
  };

  const renderAppointments = () => (
    <div className="space-y-8">
      {apptNotice ? noticeBar(apptNotice.tone, apptNotice.text, () => setApptNotice(null)) : null}

      <section data-wf="b-6-0" style={panelStyle} aria-labelledby="filters-h">
        <div className="flex items-center gap-3 px-6 pt-6">
          <Icons.Filter className="h-4 w-4" aria-hidden="true" style={{ color: accentText }} />
          <h2
            id="filters-h"
            className="text-[20px]"
            style={{ fontFamily: brand.fontHeading, fontStyle: "italic", color: ink }}
          >
            All appointments
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 px-6 pb-6 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label
              htmlFor="f-doctor"
              className="mb-2 block text-[13px] font-medium"
              style={{ color: ink }}
            >
              Doctor
            </Label>
            <Select
              data-wf="i-6-0-0"
              id="f-doctor"
              value={filters.doctor}
              onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
              className={inputCls}
              style={inputStyle}
            >
              <option value="all">All doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label
              htmlFor="f-patient"
              className="mb-2 block text-[13px] font-medium"
              style={{ color: ink }}
            >
              Patient
            </Label>
            <Input
              data-wf="i-6-0-1"
              id="f-patient"
              type="search"
              value={filters.patient}
              onChange={(e) => setFilters({ ...filters, patient: e.target.value })}
              placeholder="search by name"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <Label
              htmlFor="f-date"
              className="mb-2 block text-[13px] font-medium"
              style={{ color: ink }}
            >
              Date
            </Label>
            <Input
              data-wf="i-6-0-2"
              id="f-date"
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className={inputCls}
              style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }}
            />
          </div>
          <div>
            <Label
              htmlFor="f-status"
              className="mb-2 block text-[13px] font-medium"
              style={{ color: ink }}
            >
              Status
            </Label>
            <Select
              data-wf="i-6-0-3"
              id="f-status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={inputCls}
              style={inputStyle}
            >
              <option value="all">Any status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No-show</option>
              <option value="reassign">Needs reassignment</option>
            </Select>
          </div>
        </div>
      </section>

      <section data-wf="b-7-0" style={panelStyle} aria-labelledby="appts-h">
        {sectionHead(
          "Appointments across all doctors",
          filtered.length +
            " of " +
            appts.length +
            " shown" +
            (selected ? " · " + selected.id + " selected" : " · select a row to act on it"),
          filtersDirty ? (
            <button
              type="button"
              onClick={() => setFilters({ doctor: "all", patient: "", date: "", status: "all" })}
              className={
                "rounded-full px-4 py-2 text-xs underline-offset-4 hover:underline " + btnFocus
              }
              style={{ color: accentText, ...ringVars }}
            >
              Clear filters
            </button>
          ) : null,
        )}
        <div className="overflow-x-auto px-2 pb-6">
          {filtered.length ? (
            <Table style={tableStyle}>
              <THead>
                <TR style={{ borderBottom: `1px solid ${hair}` }}>
                  <TH data-wf="i-7-0-0" scope="col" className={thCls} style={{ color: muted }}>
                    Patient
                  </TH>
                  <TH data-wf="i-7-0-1" scope="col" className={thCls} style={{ color: muted }}>
                    Doctor
                  </TH>
                  <TH data-wf="i-7-0-2" scope="col" className={thCls} style={{ color: muted }}>
                    Date &amp; time
                  </TH>
                  <TH data-wf="i-7-0-3" scope="col" className={thCls} style={{ color: muted }}>
                    Status
                  </TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((a) => {
                  const isSel = a.id === selectedAppt;
                  return (
                    <TR
                      key={a.id}
                      className={a.fresh ? "atrium-rise" : ""}
                      style={{
                        borderBottom: `1px solid ${hair}`,
                        backgroundColor: isSel ? alpha(brass, 0.12) : "transparent",
                      }}
                    >
                      <TD className={tdCls}>
                        <button
                          type="button"
                          aria-pressed={isSel}
                          onClick={() => {
                            setSelectedAppt(isSel ? null : a.id);
                            setApptError("");
                          }}
                          className={"text-left " + btnFocus + " rounded-full px-2 py-1 -ml-2"}
                          style={ringVars}
                        >
                          <span className="font-medium" style={{ color: ink }}>
                            {a.patient}
                          </span>
                          <span
                            className="block text-xs"
                            style={{ color: muted, fontVariantNumeric: "tabular-nums" }}
                          >
                            {a.id}
                          </span>
                        </button>
                      </TD>
                      <TD className={tdCls} style={{ color: ink }}>
                        {a.doctor}
                      </TD>
                      <TD
                        className={tdCls}
                        style={{ color: ink, fontVariantNumeric: "tabular-nums" }}
                      >
                        {a.when}
                      </TD>
                      <TD className={tdCls}>{pill(a.status)}</TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          ) : (
            <div className="px-4 py-6">
              <Empty
                title="nothing matches those filters"
                description="no appointment in the clinic diary fits this doctor, patient, date and status together. widen the date or clear the filters to see the full week."
                action={
                  <Button
                    type="button"
                    className={"px-6 py-3 text-sm font-medium " + btnFocus}
                    style={primaryBtn}
                    onClick={() =>
                      setFilters({ doctor: "all", patient: "", date: "", status: "all" })
                    }
                  >
                    Clear filters
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </section>

      {apptError ? noticeBar("warn", apptError, () => setApptError("")) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
        <div className="md:col-span-4">
          <Button
            data-wf="b-8-0"
            type="button"
            disabled={!selected}
            onClick={reassignSelected}
            className={
              "w-full justify-center px-6 py-3.5 text-sm font-medium " +
              btnFocus +
              (selected ? " hover:opacity-90" : " opacity-45")
            }
            style={primaryBtn}
          >
            Reassign to another doctor or slot
          </Button>
        </div>
        <div className="md:col-span-4">
          <Button
            data-wf="b-8-1"
            type="button"
            disabled={
              !selected || selected.status === "cancelled" || selected.status === "completed"
            }
            onClick={cancelSelected}
            className={
              "w-full justify-center px-6 py-3.5 text-sm font-medium " +
              btnFocus +
              (!selected || selected.status === "cancelled" || selected.status === "completed"
                ? " opacity-45"
                : " hover:opacity-90")
            }
            style={{
              backgroundColor: "transparent",
              color: clay,
              borderRadius: 999,
              border: `1px solid ${clay}`,
              ...ringVars,
            }}
          >
            Cancel appointment
          </Button>
        </div>
        <p className="md:col-span-4 text-[13px] leading-relaxed" style={{ color: muted }}>
          {selected
            ? selected.status === "completed" || selected.status === "cancelled"
              ? selected.id +
                " is " +
                statusMeta(selected.status).label.toLowerCase() +
                " — it can no longer be cancelled, only reassigned for the record."
              : "acting on " +
                selected.id +
                " for " +
                selected.patient +
                ". reassigning takes the next free slot; both actions email the patient straight away."
            : "select a patient name above to reassign or cancel that appointment."}
        </p>
      </div>
    </div>
  );

  /* ---------------- availability ---------------- */

  const affectedByBlock = appts.filter(
    (a) =>
      a.doctorId === avail.doctorId &&
      a.dateISO >= avail.blockFrom &&
      a.dateISO <= avail.blockTo &&
      (a.status === "scheduled" || a.status === "reassign"),
  );

  const saveAvailability = (e) => {
    e.preventDefault();
    if (avail.end <= avail.start) {
      setAvailError("the end time must be after the start time — 09:00 to 13:00, for example.");
      setAvailWarn(false);
      return;
    }
    setAvailError("");
    if (avail.blockFrom && avail.blockTo && affectedByBlock.length && !availWarn) {
      setAvailWarn(true);
      return;
    }
    setAvailSaving(true);
    later(() => {
      const doc = accounts.find((a) => a.id === avail.doctorId);
      const span =
        Number(avail.end.split(":")[0]) * 60 +
        Number(avail.end.split(":")[1]) -
        (Number(avail.start.split(":")[0]) * 60 + Number(avail.start.split(":")[1]));
      const slots = Math.floor(span / avail.slot);
      if (availWarn) {
        setAppts((prev) =>
          prev.map((a) =>
            affectedByBlock.some((x) => x.id === a.id) ? { ...a, status: "reassign" } : a,
          ),
        );
        affectedByBlock.forEach((a) => pushNotif(a.id, "reschedule"));
      }
      pushAudit("availability.override", "doctor_availability", avail.doctorId);
      setAvailSaving(false);
      setAvailWarn(false);
      setAvailNotice(
        slots +
          " × " +
          avail.slot +
          "-minute slots saved for " +
          doc.full_name +
          " every " +
          avail.day.toLowerCase() +
          ", " +
          avail.start +
          "–" +
          avail.end +
          "." +
          (affectedByBlock.length
            ? " " +
              affectedByBlock.length +
              " booked appointment" +
              (affectedByBlock.length === 1 ? " is" : "s are") +
              " flagged for reassignment."
            : ""),
      );
    }, 700);
  };

  const renderAvailability = () => (
    <div className="space-y-8">
      {availNotice ? noticeBar("good", availNotice, () => setAvailNotice(null)) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section data-wf="b-9-0" style={archStyle} aria-labelledby="avail-h">
          <form
            id="availability-form"
            onSubmit={saveAvailability}
            className="px-6 pb-6 pt-12 sm:px-8"
          >
            <div className="text-center">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: alpha(brass, 0.22), color: accentText }}
              >
                <Icons.Clock className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2
                id="avail-h"
                className="mt-4 text-[26px] leading-tight"
                style={{ fontFamily: brand.fontHeading, fontStyle: "italic", color: ink }}
              >
                Override doctor availability
              </h2>
              <p
                className="mx-auto mt-2 max-w-[44ch] text-[13px] leading-relaxed"
                style={{ color: muted }}
              >
                recurring weekly hours, split into whole slots. use the block-out for leave and
                closures.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <Label
                  htmlFor="av-doctor"
                  className="mb-2 block text-[13px] font-medium"
                  style={{ color: ink }}
                >
                  Doctor
                </Label>
                <Select
                  data-wf="i-9-0-0"
                  id="av-doctor"
                  value={avail.doctorId}
                  onChange={(e) => {
                    setAvail({ ...avail, doctorId: e.target.value });
                    setAvailWarn(false);
                  }}
                  className={inputCls}
                  style={inputStyle}
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} · {d.specialization}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="av-day"
                    className="mb-2 block text-[13px] font-medium"
                    style={{ color: ink }}
                  >
                    Day of week
                  </Label>
                  <Select
                    data-wf="i-9-0-1"
                    id="av-day"
                    value={avail.day}
                    onChange={(e) => setAvail({ ...avail, day: e.target.value })}
                    className={inputCls}
                    style={inputStyle}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="av-slot"
                    className="mb-2 block text-[13px] font-medium"
                    style={{ color: ink }}
                  >
                    Slot length (minutes)
                  </Label>
                  <Select
                    data-wf="i-9-0-4"
                    id="av-slot"
                    value={avail.slot}
                    onChange={(e) => setAvail({ ...avail, slot: Number(e.target.value) })}
                    className={inputCls}
                    style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }}
                  >
                    {SLOT_LENGTHS.map((n) => (
                      <option key={n} value={n}>
                        {n} minutes
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="av-start"
                    className="mb-2 block text-[13px] font-medium"
                    style={{ color: ink }}
                  >
                    Start time
                  </Label>
                  <Input
                    data-wf="i-9-0-2"
                    id="av-start"
                    type="time"
                    value={avail.start}
                    onChange={(e) => {
                      setAvail({ ...avail, start: e.target.value });
                      setAvailError("");
                    }}
                    className={inputCls}
                    style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="av-end"
                    className="mb-2 block text-[13px] font-medium"
                    style={{ color: ink }}
                  >
                    End time
                  </Label>
                  <Input
                    data-wf="i-9-0-3"
                    id="av-end"
                    type="time"
                    value={avail.end}
                    onChange={(e) => {
                      setAvail({ ...avail, end: e.target.value });
                      setAvailError("");
                    }}
                    className={inputCls}
                    style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }}
                    aria-invalid={availError ? "true" : undefined}
                    aria-describedby={availError ? "av-err" : undefined}
                  />
                </div>
              </div>
              {availError ? (
                <p id="av-err" className="text-xs" style={{ color: clay }}>
                  {availError}
                </p>
              ) : null}

              <fieldset
                data-wf="i-9-0-5"
                className="rounded-[20px] px-5 py-5"
                style={{ backgroundColor: inset }}
              >
                <legend className="px-2 text-[13px] font-medium" style={{ color: ink }}>
                  Block out date range
                </legend>
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="av-block-from"
                      className="mb-2 block text-xs"
                      style={{ color: muted }}
                    >
                      From
                    </Label>
                    <Input
                      id="av-block-from"
                      type="date"
                      value={avail.blockFrom}
                      onChange={(e) => {
                        setAvail({ ...avail, blockFrom: e.target.value });
                        setAvailWarn(false);
                      }}
                      className={inputCls}
                      style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="av-block-to"
                      className="mb-2 block text-xs"
                      style={{ color: muted }}
                    >
                      To
                    </Label>
                    <Input
                      id="av-block-to"
                      type="date"
                      value={avail.blockTo}
                      onChange={(e) => {
                        setAvail({ ...avail, blockTo: e.target.value });
                        setAvailWarn(false);
                      }}
                      className={inputCls}
                      style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed" style={{ color: muted }}>
                  leave both empty to change the weekly pattern only.
                </p>
              </fieldset>
            </div>
          </form>
        </section>

        <div className="space-y-6">
          <div
            className="rounded-[24px] px-6 py-6"
            style={{ backgroundColor: inset, border: `1px solid ${hair}` }}
          >
            <h3
              className="text-[18px]"
              style={{ fontFamily: brand.fontHeading, fontStyle: "italic", color: ink }}
            >
              What this override will do
            </h3>
            <ul className="mt-4 space-y-3 text-sm" style={{ color: ink }}>
              <li className="flex gap-3">
                <Icons.Check
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                  style={{ color: accentText }}
                />
                <span>
                  overlapping ranges on the same day are merged, so no duplicate slots are
                  generated.
                </span>
              </li>
              <li className="flex gap-3">
                <Icons.Check
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                  style={{ color: accentText }}
                />
                <span>
                  patients see the new slots as soon as it saves — booked slots stay booked.
                </span>
              </li>
              <li className="flex gap-3">
                <Icons.AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                  style={{ color: clay }}
                />
                <span>shortening cover over a booked slot is always confirmed with you first.</span>
              </li>
            </ul>
            <div className="mt-5" style={{ borderTop: `1px solid ${hair}` }} />
            <p
              className="mt-4 text-sm"
              style={{ color: muted, fontVariantNumeric: "tabular-nums" }}
            >
              inside {avail.blockFrom || "—"} → {avail.blockTo || "—"}:{" "}
              <span style={{ color: ink }}>{affectedByBlock.length} booked</span>
            </p>
          </div>

          {availWarn ? (
            <div
              data-wf="b-8-2"
              className="atrium-rise rounded-[24px] px-6 py-6"
              style={{ backgroundColor: clayTint, border: `1px solid ${hair}` }}
              role="alert"
            >
              <div className="flex gap-3">
                <Icons.AlertCircle
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                  style={{ color: clay }}
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: clay }}>
                    {affectedByBlock.length} booked appointments fall inside the time range you are
                    blocking out — confirm to continue.
                  </p>
                  <ul
                    className="mt-3 space-y-1 text-sm"
                    style={{ color: ink, fontVariantNumeric: "tabular-nums" }}
                  >
                    {affectedByBlock.map((a) => (
                      <li key={a.id}>
                        {a.id} · {a.patient} · {a.when}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      type="submit"
                      form="availability-form"
                      className={"px-5 py-3 text-sm font-medium " + btnFocus}
                      style={{
                        backgroundColor: clay,
                        color: cream,
                        borderRadius: 999,
                        border: "1px solid transparent",
                        ...ringVars,
                      }}
                    >
                      Confirm and flag them
                    </Button>
                    <Button
                      type="button"
                      className={"px-5 py-3 text-sm " + btnFocus}
                      style={quietBtn}
                      onClick={() => setAvailWarn(false)}
                    >
                      Leave availability as it is
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p
              data-wf="b-8-2"
              className="px-2 text-[13px] leading-relaxed"
              style={{ color: muted }}
            >
              {affectedByBlock.length} booked appointments fall inside the time range you are
              blocking out — confirm to continue.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <Button
          data-wf="b-10-0"
          type="submit"
          form="availability-form"
          disabled={availSaving}
          className={
            "w-full justify-center px-6 py-3.5 text-sm font-medium " +
            btnFocus +
            (availSaving ? " opacity-70" : " hover:opacity-90")
          }
          style={primaryBtn}
        >
          {availSaving ? "saving availability…" : "Save availability"}
        </Button>
      </div>
    </div>
  );

  /* ---------------- email & logs ---------------- */

  const failedCount = notifs.filter((n) => n.status === "failed").length;

  const saveEmail = (e) => {
    e.preventDefault();
    if (emailForm.apiKey && emailForm.apiKey.trim().length < 12) {
      setEmailError(
        "that key looks too short — paste the whole key from your provider dashboard. nothing has been changed.",
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.sender.trim())) {
      setEmailError("the sender address must be a full mailbox on a verified domain.");
      return;
    }
    setEmailError("");
    setEmailSaving(true);
    later(() => {
      setEmailSaving(false);
      pushAudit("email_settings.update", "setting", "SET-002");
      setEmailNotice(
        (emailForm.apiKey
          ? "key stored as a secret — it will never be displayed again. "
          : "key left unchanged. ") +
          "confirmations, reschedules and cancellations send from " +
          emailForm.sender.trim() +
          ", reminders " +
          emailForm.lead +
          " hours ahead.",
      );
      setEmailForm({ ...emailForm, apiKey: "" });
    }, 700);
  };

  const renderEmail = () => (
    <div className="space-y-8">
      {failedCount
        ? noticeBar(
            "warn",
            failedCount +
              " reminder emails failed since 15 Nov — the provider rejected the stored key. appointments were saved either way; re-enter the key below and the queue retries.",
          )
        : null}
      {emailNotice ? noticeBar("good", emailNotice, () => setEmailNotice(null)) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section data-wf="b-9-1" style={archStyle} aria-labelledby="email-h">
          <form id="email-form" onSubmit={saveEmail} className="px-6 pb-6 pt-12 sm:px-8">
            <div className="text-center">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: alpha(brass, 0.22), color: accentText }}
              >
                <Icons.Bell className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2
                id="email-h"
                className="mt-4 text-[26px] leading-tight"
                style={{ fontFamily: brand.fontHeading, fontStyle: "italic", color: ink }}
              >
                Transactional email provider
              </h2>
              <p
                className="mx-auto mt-2 max-w-[44ch] text-[13px] leading-relaxed"
                style={{ color: muted }}
              >
                booking, reschedule and cancellation mail, plus the reminder run.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <Label
                  htmlFor="em-key"
                  className="mb-2 block text-[13px] font-medium"
                  style={{ color: ink }}
                >
                  API key
                </Label>
                <Input
                  data-wf="i-9-1-0"
                  id="em-key"
                  type="password"
                  value={emailForm.apiKey}
                  onChange={(e) => {
                    setEmailForm({ ...emailForm, apiKey: e.target.value });
                    setEmailError("");
                  }}
                  placeholder="<your-api-key>"
                  className={inputCls}
                  style={inputStyle}
                  aria-describedby="em-key-hint"
                />
                <p
                  id="em-key-hint"
                  className="mt-2 text-xs leading-relaxed"
                  style={{ color: muted }}
                >
                  held as a secret, never shown back. a key was last stored on 14 Nov 2026 by Nadia
                  Khoury.
                </p>
              </div>
              <div>
                <Label
                  htmlFor="em-sender"
                  className="mb-2 block text-[13px] font-medium"
                  style={{ color: ink }}
                >
                  Sender address
                </Label>
                <Input
                  data-wf="i-9-1-1"
                  id="em-sender"
                  type="email"
                  value={emailForm.sender}
                  onChange={(e) => {
                    setEmailForm({ ...emailForm, sender: e.target.value });
                    setEmailError("");
                  }}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <Label
                  htmlFor="em-lead"
                  className="mb-2 block text-[13px] font-medium"
                  style={{ color: ink }}
                >
                  Reminder lead time (hours)
                </Label>
                <Input
                  data-wf="i-9-1-2"
                  id="em-lead"
                  type="number"
                  min="1"
                  max="168"
                  value={emailForm.lead}
                  onChange={(e) => setEmailForm({ ...emailForm, lead: e.target.value })}
                  className={inputCls}
                  style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }}
                  aria-describedby="em-lead-hint"
                />
                <p id="em-lead-hint" className="mt-2 text-xs" style={{ color: muted }}>
                  cancelled appointments drop out of the reminder run automatically.
                </p>
              </div>
              {emailError ? (
                <p className="text-xs" style={{ color: clay }} role="alert">
                  {emailError}
                </p>
              ) : null}
            </div>
          </form>
        </section>

        <div className="space-y-6">
          <div
            className="rounded-[24px] px-6 py-6"
            style={{ backgroundColor: inset, border: `1px solid ${hair}` }}
          >
            <h3
              className="text-[18px]"
              style={{ fontFamily: brand.fontHeading, fontStyle: "italic", color: ink }}
            >
              Delivery this week
            </h3>
            <dl
              className="mt-5 grid grid-cols-3 gap-4"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {[
                { k: "sent", label: "sent" },
                { k: "queued", label: "queued" },
                { k: "failed", label: "failed" },
              ].map((row) => (
                <div key={row.k}>
                  <dt className="text-[11px] uppercase tracking-[0.14em]" style={{ color: muted }}>
                    {row.label}
                  </dt>
                  <dd
                    className="mt-1 text-[28px] leading-none"
                    style={{
                      fontFamily: brand.fontHeading,
                      color: row.k === "failed" && failedCount ? clay : ink,
                    }}
                  >
                    {notifs.filter((n) => n.status === row.k).length}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[13px] leading-relaxed" style={{ color: muted }}>
              a failed notification never blocks a booking change — it is logged here for retry.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:justify-items-end">
        <div className="md:col-start-2 w-full">
          <Button
            data-wf="b-10-1"
            type="submit"
            form="email-form"
            disabled={emailSaving}
            className={
              "w-full justify-center px-6 py-3.5 text-sm font-medium " +
              btnFocus +
              (emailSaving ? " opacity-70" : " hover:opacity-90")
            }
            style={primaryBtn}
          >
            {emailSaving ? "saving settings…" : "Save email settings"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section data-wf="b-11-0" style={panelStyle} aria-labelledby="audit-h">
          {sectionHead("Audit log", "who read or changed records and appointments")}
          <div className="overflow-x-auto px-2 pb-6">
            <Table style={tableStyle}>
              <THead>
                <TR style={{ borderBottom: `1px solid ${hair}` }}>
                  <TH data-wf="i-11-0-0" scope="col" className={thCls} style={{ color: muted }}>
                    User
                  </TH>
                  <TH data-wf="i-11-0-1" scope="col" className={thCls} style={{ color: muted }}>
                    Action
                  </TH>
                  <TH data-wf="i-11-0-2" scope="col" className={thCls} style={{ color: muted }}>
                    Entity type
                  </TH>
                  <TH data-wf="i-11-0-3" scope="col" className={thCls} style={{ color: muted }}>
                    Entity ID
                  </TH>
                  <TH data-wf="i-11-0-4" scope="col" className={thCls} style={{ color: muted }}>
                    Timestamp
                  </TH>
                </TR>
              </THead>
              <TBody>
                {audit.slice(0, 12).map((l) => (
                  <TR
                    key={l.id}
                    className={l.fresh ? "atrium-rise" : ""}
                    style={{ borderBottom: `1px solid ${hair}` }}
                  >
                    <TD className={tdCls} style={{ color: ink }}>
                      {l.user}
                    </TD>
                    <TD className={tdCls}>
                      <span
                        className="rounded-full px-3 py-1 text-xs"
                        style={{ backgroundColor: inset, color: ink }}
                      >
                        {l.action}
                      </span>
                    </TD>
                    <TD className={tdCls} style={{ color: muted }}>
                      {l.entity_type}
                    </TD>
                    <TD
                      className={tdCls}
                      style={{ color: ink, fontVariantNumeric: "tabular-nums" }}
                    >
                      {l.entity_id}
                    </TD>
                    <TD
                      className={tdCls}
                      style={{ color: muted, fontVariantNumeric: "tabular-nums" }}
                    >
                      {l.ts}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </section>

        <section data-wf="b-11-1" style={panelStyle} aria-labelledby="notif-h">
          {sectionHead("Notification log", "every booking email, with its outcome")}
          <div className="overflow-x-auto px-2 pb-6">
            <Table style={tableStyle}>
              <THead>
                <TR style={{ borderBottom: `1px solid ${hair}` }}>
                  <TH data-wf="i-11-1-0" scope="col" className={thCls} style={{ color: muted }}>
                    Appointment
                  </TH>
                  <TH data-wf="i-11-1-1" scope="col" className={thCls} style={{ color: muted }}>
                    Kind
                  </TH>
                  <TH data-wf="i-11-1-2" scope="col" className={thCls} style={{ color: muted }}>
                    Status
                  </TH>
                  <TH data-wf="i-11-1-3" scope="col" className={thCls} style={{ color: muted }}>
                    Error
                  </TH>
                  <TH data-wf="i-11-1-4" scope="col" className={thCls} style={{ color: muted }}>
                    Sent at
                  </TH>
                </TR>
              </THead>
              <TBody>
                {notifs.slice(0, 12).map((n) => (
                  <TR
                    key={n.id}
                    className={n.fresh ? "atrium-rise" : ""}
                    style={{ borderBottom: `1px solid ${hair}` }}
                  >
                    <TD
                      className={tdCls}
                      style={{ color: ink, fontVariantNumeric: "tabular-nums" }}
                    >
                      {n.appointment}
                    </TD>
                    <TD className={tdCls} style={{ color: ink }}>
                      {n.kind}
                    </TD>
                    <TD className={tdCls}>{pill(n.status)}</TD>
                    <TD className={tdCls} style={{ color: n.error === "—" ? muted : clay }}>
                      {n.error}
                    </TD>
                    <TD
                      className={tdCls}
                      style={{ color: muted, fontVariantNumeric: "tabular-nums" }}
                    >
                      {n.ts}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );

  const panels = {
    accounts: renderAccounts,
    specializations: renderSpecializations,
    mappings: renderMappings,
    appointments: renderAppointments,
    availability: renderAvailability,
    email: renderEmail,
  };

  return (
    <div
      className="min-h-full px-4 py-10 sm:px-8 lg:px-12"
      style={{ backgroundColor: cream, color: ink, fontFamily: brand.fontBody }}
    >
      <style>{`
        @keyframes atrium-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .atrium-rise { animation: atrium-rise 320ms ease-out both; }
        @media (prefers-reduced-motion: reduce) { .atrium-rise { animation: none; } }
      `}</style>

      <div className="mx-auto w-full max-w-[1180px]">
        <header data-wf="b-0-0" className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: accentText }}>
              {CLINIC}
            </p>
            <h1
              className="mt-3 text-[40px] leading-[1.1]"
              style={{ fontFamily: brand.fontHeading, fontStyle: "italic", color: ink }}
            >
              Admin Console
            </h1>
            <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed" style={{ color: muted }}>
              staff accounts, the specialization list, the disease mapping table, clinic-wide
              appointments and the mail that goes with them — all in one place.
            </p>
          </div>
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2 text-xs"
            style={{
              backgroundColor: alpha(ink, 0.06),
              color: muted,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <Icons.Clock className="h-3.5 w-3.5" aria-hidden="true" />
            counts synced 09:42 · mon 16 nov
          </div>
        </header>

        <div className="mt-8" style={{ borderTop: `1px solid ${hair}` }} />

        <div
          data-wf="b-1-0"
          role="tablist"
          aria-label="Admin console sections"
          className="mt-8 flex flex-wrap gap-2"
        >
          {TAB_DEFS.map((t, i) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                data-wf={t.wf}
                ref={(el) => {
                  tabRefs.current[t.key] = el;
                }}
                id={"tab-" + t.key}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls={"panel-" + t.key}
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(t.key)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
                className={
                  "rounded-full px-5 py-3 text-sm font-medium transition-colors " + btnFocus
                }
                style={
                  active
                    ? {
                        backgroundColor: ink,
                        color: cream,
                        border: `1px solid ${ink}`,
                        ...ringVars,
                      }
                    : {
                        backgroundColor: alpha(ink, 0.05),
                        color: muted,
                        border: `1px solid ${hair}`,
                        ...ringVars,
                      }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          id={"panel-" + tab}
          role="tabpanel"
          aria-labelledby={"tab-" + tab}
          tabIndex={0}
          className="mt-8 pb-16 focus:outline-none"
        >
          {panels[tab]()}
        </div>
      </div>
    </div>
  );
}
