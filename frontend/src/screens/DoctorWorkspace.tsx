// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Input, Textarea, Label, Select, Table, THead, TBody, TR, TH, TD, Avatar, Empty } = UI;

const { Edit, ArrowLeft, ArrowRight } = Icons;

const hexToRgb = (hex) => {
  const h = String(hex).replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const rgba = (hex, a) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const mixHex = (a, b, t) => {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

const DOCTOR = {
  name: "Meera Shah",
  specialization: "General Medicine",
  clinic: "Lotus Clinic, Indiranagar",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOT_LENGTHS = ["15", "20", "30", "45", "60"];

const APPOINTMENTS = [
  {
    id: "ap-1041",
    patient: "Rahul Mehta",
    period: "today",
    dateLabel: "Mon 16 Nov 2026",
    shortDate: "16 Nov 2026",
    start: "09:00",
    end: "09:30",
    slotMins: 30,
    status: "completed",
  },
  {
    id: "ap-1042",
    patient: "Devika Iyer",
    period: "today",
    dateLabel: "Mon 16 Nov 2026",
    shortDate: "16 Nov 2026",
    start: "09:30",
    end: "10:00",
    slotMins: 30,
    status: "no-show",
  },
  {
    id: "ap-1043",
    patient: "Priya Nair",
    period: "today",
    dateLabel: "Mon 16 Nov 2026",
    shortDate: "16 Nov 2026",
    start: "10:30",
    end: "11:00",
    slotMins: 30,
    status: "completed",
  },
  {
    id: "ap-1044",
    patient: "Sana Qureshi",
    period: "today",
    dateLabel: "Mon 16 Nov 2026",
    shortDate: "16 Nov 2026",
    start: "12:00",
    end: "12:30",
    slotMins: 30,
    status: "scheduled",
    treatingDoctor: "Dr. Kavita Menon",
    note: "reassigned to the covering doctor by the clinic admin on 15 nov",
  },
  {
    id: "ap-1051",
    patient: "Ananya Krishnan",
    period: "upcoming",
    dateLabel: "Wed 18 Nov 2026",
    shortDate: "18 Nov 2026",
    start: "14:00",
    end: "14:30",
    slotMins: 30,
    status: "scheduled",
  },
  {
    id: "ap-1052",
    patient: "Joseph Mathew",
    period: "upcoming",
    dateLabel: "Wed 18 Nov 2026",
    shortDate: "18 Nov 2026",
    start: "15:30",
    end: "16:00",
    slotMins: 30,
    status: "scheduled",
  },
  {
    id: "ap-1053",
    patient: "Nikhil Bansal",
    period: "upcoming",
    dateLabel: "Fri 20 Nov 2026",
    shortDate: "20 Nov 2026",
    start: "09:00",
    end: "09:30",
    slotMins: 30,
    status: "cancelled",
    note: "cancelled by the patient on 14 nov",
  },
  {
    id: "ap-1054",
    patient: "Leela Pillai",
    period: "upcoming",
    dateLabel: "Fri 20 Nov 2026",
    shortDate: "20 Nov 2026",
    start: "11:00",
    end: "11:30",
    slotMins: 30,
    status: "scheduled",
  },
  {
    id: "ap-1055",
    patient: "Tanvi Raghavan",
    period: "upcoming",
    dateLabel: "Mon 23 Nov 2026",
    shortDate: "23 Nov 2026",
    start: "09:30",
    end: "10:00",
    slotMins: 30,
    status: "scheduled",
  },
];

const INITIAL_RECORDS = {
  "ap-1041": {
    notes:
      "Reviewed two weeks of home blood-pressure readings, averaging 132/84. Reports no headaches or ankle swelling. Weight down 1.4 kg since September. Salt intake discussed; walking 30 minutes most evenings.",
    diagnosis: "Essential hypertension, well controlled on current dose",
    prescription:
      "Amlodipine 5 mg once daily, continue 3 months. Repeat BP diary before next review.",
    updatedAt: "16 Nov 2026, 09:28",
  },
  "ap-1043": {
    notes:
      "Six days of dry cough and sore throat, no fever since Friday. Chest clear on auscultation, throat mildly inflamed with no exudate. Temperature 37.1 °C, SpO2 98%. Advised steam inhalation and fluids, review if fever returns or the cough runs past ten days.",
    diagnosis: "Acute viral pharyngitis",
    prescription: "",
    updatedAt: "16 Nov 2026, 11:04",
  },
};

const INITIAL_HOURS = [
  { id: "av-01", day: "Monday", start: "09:00", end: "13:00", slot: "30", booked: 2 },
  { id: "av-02", day: "Wednesday", start: "14:00", end: "17:00", slot: "30", booked: 2 },
  { id: "av-03", day: "Friday", start: "09:00", end: "12:00", slot: "30", booked: 1 },
];

const PERIOD_HEADINGS = {
  today: "Scheduled appointments — Mon 16 Nov 2026",
  upcoming: "Scheduled appointments — Tue 17 Nov – Mon 23 Nov 2026",
  past: "Scheduled appointments — before Mon 16 Nov 2026",
};

const toMinutes = (t) => {
  const [h, m] = String(t).split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
};

export default function Screen() {
  const navigate = useNavigate();
  const ink = brand.primaryColor;
  const accent = brand.accentColor;
  const cream = brand.backgroundColor;
  const neutral = brand.neutralColor;
  const muted = mixHex(ink, neutral, 0.45);
  const accentStrong = mixHex(accent, ink, 0.4);
  const paper = "rgba(255, 255, 255, 0.72)";
  const hairline = rgba(ink, 0.12);

  const STATUS_META = {
    scheduled: { label: "Scheduled", Icon: Icons.Clock, bg: rgba(ink, 0.07), fg: ink },
    completed: { label: "Completed", Icon: Icons.CheckCircle, bg: rgba(accent, 0.26), fg: ink },
    "no-show": { label: "No-show", Icon: Icons.AlertCircle, bg: rgba(neutral, 0.26), fg: muted },
    cancelled: { label: "Cancelled", Icon: Icons.X, bg: "transparent", fg: muted },
  };

  const [tab, setTab] = React.useState("today");
  const [appts, setAppts] = React.useState(APPOINTMENTS);
  const [records, setRecords] = React.useState(INITIAL_RECORDS);
  const [selectedId, setSelectedId] = React.useState("ap-1043");
  const [draft, setDraft] = React.useState({
    notes: INITIAL_RECORDS["ap-1043"].notes,
    diagnosis: INITIAL_RECORDS["ap-1043"].diagnosis,
    prescription: INITIAL_RECORDS["ap-1043"].prescription,
  });
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [saveState, setSaveState] = React.useState("idle");
  const [statusDraft, setStatusDraft] = React.useState("completed");
  const [statusMsg, setStatusMsg] = React.useState(null);
  const [hours, setHours] = React.useState(INITIAL_HOURS);
  const [hoursForm, setHoursForm] = React.useState({
    day: "Tuesday",
    start: "10:00",
    end: "13:00",
    slot: "30",
  });
  const [hoursState, setHoursState] = React.useState("idle");
  const [hoursMsg, setHoursMsg] = React.useState(null);
  const [confirmRemove, setConfirmRemove] = React.useState(null);

  const timers = React.useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  const tabRefs = React.useRef([]);
  const counts = {
    today: appts.filter((a) => a.period === "today").length,
    upcoming: appts.filter((a) => a.period === "upcoming").length,
    past: appts.filter((a) => a.period === "past").length,
  };
  const TABS = [
    { key: "today", label: "Today", count: counts.today, wf: "i-1-0-0" },
    { key: "upcoming", label: "Upcoming", count: counts.upcoming, wf: "i-1-0-1" },
    { key: "past", label: "Past", count: counts.past, wf: "i-1-0-2" },
    { key: "availability", label: "Weekly availability", count: null, wf: "i-1-0-3" },
  ];

  const rows = tab === "availability" ? [] : appts.filter((a) => a.period === tab);
  const selected = appts.find((a) => a.id === selectedId) || null;
  const savedRecord = selected ? records[selected.id] : null;
  const isBlocked = selected && selected.status === "cancelled";
  const isOtherDoctor = Boolean(selected && selected.treatingDoctor);
  const canEdit = Boolean(selected) && !isBlocked && !isOtherDoctor;
  const dirty =
    canEdit &&
    savedRecord &&
    (savedRecord.notes !== draft.notes ||
      savedRecord.diagnosis !== draft.diagnosis ||
      savedRecord.prescription !== draft.prescription);

  const selectAppointment = (appt) => {
    setSelectedId(appt.id);
    const rec = records[appt.id] || { notes: "", diagnosis: "", prescription: "" };
    setDraft({ notes: rec.notes, diagnosis: rec.diagnosis, prescription: rec.prescription });
    setFieldErrors({});
    setSaveState("idle");
    setStatusDraft(appt.status === "cancelled" ? "scheduled" : appt.status);
    setStatusMsg(null);
  };

  const onTabKeyDown = (e) => {
    const i = TABS.findIndex((t) => t.key === tab);
    let next = null;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    if (next === null) return;
    e.preventDefault();
    setTab(TABS[next].key);
    const node = tabRefs.current[next];
    if (node) node.focus();
  };

  const saveRecord = (e) => {
    e.preventDefault();
    if (!canEdit) return;
    const errs = {};
    if (!draft.notes.trim())
      errs.notes = "clinical notes are needed before this consultation can be filed.";
    if (!draft.diagnosis.trim()) errs.diagnosis = "add a diagnosis, even a provisional one.";
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      setSaveState("error");
      return;
    }
    setSaveState("saving");
    later(() => {
      setRecords((prev) => ({
        ...prev,
        [selected.id]: { ...draft, updatedAt: `${selected.shortDate}, just now` },
      }));
      setSaveState("saved");
    }, 700);
  };

  const updateStatus = () => {
    if (!selected) return;
    if (selected.status === "cancelled") {
      setStatusMsg({
        kind: "error",
        text: `this appointment was cancelled, so it can't be moved to ${STATUS_META[statusDraft].label.toLowerCase()}. ask the clinic admin to rebook ${selected.patient} into a free slot.`,
      });
      return;
    }
    if (selected.treatingDoctor) {
      setStatusMsg({
        kind: "error",
        text: `${selected.treatingDoctor} is the treating doctor for this slot. only the treating doctor can change its status.`,
      });
      return;
    }
    if (statusDraft === selected.status) {
      setStatusMsg({
        kind: "info",
        text: `already marked ${STATUS_META[statusDraft].label.toLowerCase()} — nothing to save.`,
      });
      return;
    }
    setAppts((prev) => prev.map((a) => (a.id === selected.id ? { ...a, status: statusDraft } : a)));
    setStatusMsg({
      kind: "success",
      text: `${selected.patient.split(" ")[0]}'s consultation is now ${STATUS_META[statusDraft].label.toLowerCase()}. it shows on her appointments page too.`,
    });
  };

  const saveHours = (e) => {
    e.preventDefault();
    const { day, start, end, slot } = hoursForm;
    const s = toMinutes(start);
    const en = toMinutes(end);
    if (!start || !end || Number.isNaN(s) || Number.isNaN(en)) {
      setHoursMsg({
        kind: "error",
        text: "a start and an end time are both needed before slots can be generated.",
      });
      return;
    }
    if (en <= s) {
      setHoursMsg({ kind: "error", text: "the end time needs to come after the start time." });
      return;
    }
    const clash = hours.find(
      (h) => h.day === day && s < toMinutes(h.end) && en > toMinutes(h.start),
    );
    if (clash) {
      setHoursMsg({
        kind: "error",
        text: `${day.toLowerCase()} ${clash.start} – ${clash.end} already covers part of this range. overlapping ranges on the same day are rejected — edit the existing range instead.`,
      });
      return;
    }
    const generated = Math.floor((en - s) / parseInt(slot, 10));
    if (generated < 1) {
      setHoursMsg({ kind: "error", text: `that range is shorter than one ${slot} minute slot.` });
      return;
    }
    setHoursState("saving");
    later(() => {
      setHours((prev) => [
        ...prev,
        { id: `av-${Date.now()}`, day, start, end, slot, booked: 0, isNew: true },
      ]);
      setHoursState("idle");
      const remainder = (en - s) % parseInt(slot, 10);
      setHoursMsg({
        kind: "success",
        text:
          `${day.toLowerCase()} ${start} – ${end} saved · ${generated} slots of ${slot} min are now bookable.` +
          (remainder ? ` the last ${remainder} minutes stay unbooked.` : ""),
      });
    }, 650);
  };

  const removeHours = (h) => {
    setHours((prev) => prev.filter((x) => x.id !== h.id));
    setConfirmRemove(null);
    setHoursMsg({
      kind: "success",
      text: `${h.day.toLowerCase()} ${h.start} – ${h.end} removed${h.booked ? ` · ${h.booked} booked appointment${h.booked > 1 ? "s" : ""} kept and flagged for the clinic admin` : ""}.`,
    });
  };

  const pillBase =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm transition-colors duration-200 atrium-focusable";

  const labelCls = "block text-xs tracking-[0.14em] uppercase mb-2";

  const fieldStyle = {
    backgroundColor: rgba(ink, 0.05),
    border: `1px solid ${hairline}`,
    color: ink,
    borderRadius: "999px",
    padding: "12px 20px",
    width: "100%",
  };
  const areaStyle = { ...fieldStyle, borderRadius: "24px", padding: "16px 22px", lineHeight: 1.6 };

  const StatusChip = ({ status }) => {
    const meta = STATUS_META[status];
    const Icon = meta.Icon;
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs whitespace-nowrap"
        style={{
          backgroundColor: meta.bg,
          color: meta.fg,
          border: status === "cancelled" ? `1px dashed ${rgba(ink, 0.3)}` : "1px solid transparent",
        }}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {meta.label}
      </span>
    );
  };

  const Notice = ({ kind, children, className }) => (
    <p
      className={`flex items-start gap-2.5 text-sm leading-relaxed rounded-2xl px-4 py-3 ${className || ""}`}
      style={{
        backgroundColor: kind === "success" ? rgba(accent, 0.18) : rgba(ink, 0.07),
        color: ink,
        borderLeft: `3px solid ${kind === "success" ? accentStrong : rgba(ink, 0.45)}`,
      }}
    >
      {kind === "success" ? (
        <Icons.CheckCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
      ) : (
        <Icons.AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
      )}
      <span>{children}</span>
    </p>
  );

  const ArchMotif = ({ className }) => (
    <svg className={className} viewBox="0 0 80 96" fill="none" aria-hidden="true">
      <path d="M8 94V40a32 32 0 0 1 64 0v54" stroke={rgba(ink, 0.35)} strokeWidth="1.25" />
      <path d="M40 94V52" stroke={accentStrong} strokeWidth="1.25" />
      <path d="M40 66c0-8 6-13 13-13 0 8-5 13-13 13Z" stroke={accentStrong} strokeWidth="1.25" />
      <path d="M40 80c0-8-6-13-13-13 0 8 5 13 13 13Z" stroke={accentStrong} strokeWidth="1.25" />
    </svg>
  );

  return (
    <div
      data-atrium
      className="min-h-full w-full"
      style={{
        backgroundColor: cream,
        color: ink,
        fontFamily: brand.fontBody,
        ["--atrium-ink"]: ink,
        ["--atrium-accent"]: accentStrong,
        ["--atrium-tint"]: rgba(ink, 0.05),
        ["--atrium-tint-strong"]: rgba(ink, 0.1),
        ["--atrium-ink-hover"]: mixHex(ink, "#000000", 0.18),
      }}
    >
      <style>{`
        [data-atrium] .atrium-focusable:focus-visible {
          outline: 2px solid var(--atrium-accent);
          outline-offset: 3px;
        }
        [data-atrium] .atrium-row { transition: background-color .2s ease; }
        [data-atrium] .atrium-row:hover { background-color: var(--atrium-tint); }
        [data-atrium] .atrium-primary:hover:not(:disabled) { background-color: var(--atrium-ink-hover); }
        [data-atrium] .atrium-ghost:hover:not(:disabled) { background-color: var(--atrium-tint-strong); }
        [data-atrium] button:disabled { opacity: .5; cursor: not-allowed; }
        [data-atrium] .atrium-rise { animation: atrium-rise .34s cubic-bezier(.22,.8,.3,1) both; }
        [data-atrium] .atrium-fade { animation: atrium-fade .3s ease both; }
        @keyframes atrium-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes atrium-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          [data-atrium] .atrium-rise, [data-atrium] .atrium-fade { animation: none !important; }
          [data-atrium] * { transition-duration: .01ms !important; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:py-14">
        {/* Row 1 — page title */}
        <header data-wf="b-0-0" className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: muted }}>
              {DOCTOR.clinic}
            </p>
            <h1
              className="mt-3 text-[34px] leading-tight sm:text-[40px]"
              style={{ fontFamily: brand.fontHeading, fontStyle: "italic", color: ink }}
            >
              Doctor Workspace
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: muted }}>
              dr. {DOCTOR.name.toLowerCase()} · {DOCTOR.specialization.toLowerCase()} — your day,
              your consultation records, and the weekly hours patients book against.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Avatar name={DOCTOR.name} />
            <p
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs"
              style={{
                backgroundColor: rgba(ink, 0.06),
                color: muted,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <Icons.Clock className="h-3.5 w-3.5" aria-hidden="true" />
              slots synced 2 minutes ago
            </p>
          </div>
        </header>

        {/* Row 2 — tabs */}
        <nav
          data-wf="b-1-0"
          aria-label="Workspace sections"
          className="mt-10 flex flex-wrap gap-2 rounded-full p-1.5"
          style={{ backgroundColor: rgba(ink, 0.06) }}
          role="tablist"
          onKeyDown={onTabKeyDown}
        >
          {TABS.map((t, i) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                data-wf={t.wf}
                ref={(el) => (tabRefs.current[i] = el)}
                type="button"
                role="tab"
                id={`tab-${t.key}`}
                aria-selected={active}
                aria-controls={`panel-${t.key}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(t.key)}
                className={`${pillBase} min-h-[44px] ${active ? "" : "atrium-ghost"}`}
                style={{
                  backgroundColor: active ? ink : "transparent",
                  color: active ? cream : ink,
                  fontFamily: active ? brand.fontHeading : brand.fontBody,
                  fontStyle: active ? "italic" : "normal",
                  fontSize: "15px",
                }}
              >
                {t.label}
                {t.count !== null && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: active ? rgba(accent, 0.45) : rgba(ink, 0.1),
                      color: active ? cream : muted,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {tab !== "availability" && (
          <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
            {/* Row 3 — appointments table */}
            {rows.length > 0 && (
              <section data-wf="b-2-0" className="mt-10 atrium-fade" key={`table-${tab}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2
                    className="text-[22px] leading-snug"
                    style={{ fontFamily: brand.fontHeading, fontStyle: "italic" }}
                  >
                    {PERIOD_HEADINGS[tab]}
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: muted, fontVariantNumeric: "tabular-nums" }}
                  >
                    {rows.length} appointments · choose one to open its record
                  </p>
                </div>

                <div
                  className="mt-5 overflow-hidden"
                  style={{
                    backgroundColor: paper,
                    border: `1px solid ${hairline}`,
                    borderRadius: brand.radius,
                  }}
                >
                  <Table
                    className="w-full text-left text-sm"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    <THead>
                      <TR style={{ borderBottom: `1px solid ${hairline}` }}>
                        <TH
                          data-wf="i-2-0-0"
                          scope="col"
                          className="px-6 py-4 text-xs uppercase tracking-[0.14em] font-normal"
                          style={{ color: muted }}
                        >
                          Patient
                        </TH>
                        <TH
                          data-wf="i-2-0-1"
                          scope="col"
                          className="px-6 py-4 text-xs uppercase tracking-[0.14em] font-normal"
                          style={{ color: muted }}
                        >
                          Date &amp; time
                        </TH>
                        <TH
                          data-wf="i-2-0-2"
                          scope="col"
                          className="px-6 py-4 text-xs uppercase tracking-[0.14em] font-normal"
                          style={{ color: muted }}
                        >
                          Slot
                        </TH>
                        <TH
                          data-wf="i-2-0-3"
                          scope="col"
                          className="px-6 py-4 text-xs uppercase tracking-[0.14em] font-normal"
                          style={{ color: muted }}
                        >
                          Status
                        </TH>
                      </TR>
                    </THead>
                    <TBody>
                      {rows.map((a, idx) => {
                        const isSel = a.id === selectedId;
                        return (
                          <TR
                            key={a.id}
                            className="atrium-row atrium-rise"
                            style={{
                              borderBottom:
                                idx === rows.length - 1 ? "none" : `1px solid ${hairline}`,
                              backgroundColor: isSel ? rgba(accent, 0.14) : "transparent",
                              animationDelay: `${idx * 45}ms`,
                            }}
                          >
                            <TD className="px-6 py-4 align-top">
                              <span className="flex items-start gap-3">
                                <span
                                  aria-hidden="true"
                                  className="mt-1 h-8 w-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: isSel ? accentStrong : "transparent" }}
                                />
                                <span>
                                  <button
                                    type="button"
                                    onClick={() => selectAppointment(a)}
                                    aria-label={`Open consultation record for ${a.patient}, ${a.dateLabel} at ${a.start}`}
                                    aria-pressed={isSel}
                                    className="atrium-focusable text-left text-[15px] underline-offset-4 hover:underline"
                                    style={{
                                      color: ink,
                                      fontFamily: brand.fontHeading,
                                      fontStyle: "italic",
                                    }}
                                  >
                                    {a.patient}
                                  </button>
                                  {a.note && (
                                    <span className="block text-xs mt-1" style={{ color: muted }}>
                                      {a.note}
                                    </span>
                                  )}
                                </span>
                              </span>
                            </TD>
                            <TD className="px-6 py-4 align-top" style={{ color: ink }}>
                              {a.dateLabel}, {a.start}
                            </TD>
                            <TD className="px-6 py-4 align-top" style={{ color: muted }}>
                              {a.start} – {a.end} · {a.slotMins} min
                            </TD>
                            <TD className="px-6 py-4 align-top">
                              <StatusChip status={a.status} />
                            </TD>
                          </TR>
                        );
                      })}
                    </TBody>
                  </Table>
                </div>
              </section>
            )}

            {/* Row 4 — empty state */}
            {rows.length === 0 && (
              <section
                data-wf="b-3-0"
                className="mt-10 flex flex-col items-center px-6 py-12 atrium-fade"
                style={{
                  backgroundColor: rgba(ink, 0.05),
                  borderRadius: `${brand.radius} ${brand.radius} ${brand.radius} ${brand.radius}`,
                  border: `1px solid ${hairline}`,
                }}
              >
                <ArchMotif className="h-24 w-20" />
                <div className="mt-4 max-w-md text-center">
                  <Empty
                    title="No appointments scheduled for this period."
                    description="completed and no-show consultations move here the day after they take place. your first clinic day at lotus clinic is today, mon 16 nov 2026."
                  />
                </div>
              </section>
            )}

            {/* Rows 5 & 6 — consultation record */}
            <form onSubmit={saveRecord} className="mt-12">
              <section
                data-wf="b-4-0"
                className="px-6 pb-10 pt-14 sm:px-12"
                style={{
                  backgroundColor: paper,
                  border: `1px solid ${hairline}`,
                  borderTopLeftRadius: "min(50%, 200px)",
                  borderTopRightRadius: "min(50%, 200px)",
                  borderBottomLeftRadius: brand.radius,
                  borderBottomRightRadius: brand.radius,
                }}
              >
                <div className="mx-auto max-w-2xl">
                  <p
                    className="text-center text-xs uppercase tracking-[0.2em]"
                    style={{ color: muted }}
                  >
                    consultation record
                  </p>
                  <h2
                    className="mt-3 text-center text-[24px] leading-snug"
                    style={{ fontFamily: brand.fontHeading, fontStyle: "italic" }}
                  >
                    {selected
                      ? `Consultation record — ${selected.patient} · ${selected.shortDate}, ${selected.start} – ${selected.end}`
                      : "Consultation record"}
                  </h2>
                  {selected && savedRecord && (
                    <p
                      className="mt-2 text-center text-xs"
                      style={{ color: muted, fontVariantNumeric: "tabular-nums" }}
                    >
                      {dirty ? "draft open · last filed " : "last filed "}
                      {savedRecord.updatedAt}
                    </p>
                  )}

                  {!selected && (
                    <p
                      className="mt-8 text-center text-sm leading-relaxed"
                      style={{ color: muted }}
                    >
                      pick a patient from the list above to open their record. notes stay with the
                      appointment and the patient only.
                    </p>
                  )}

                  {isOtherDoctor && (
                    <div className="mt-8">
                      <Notice kind="error">
                        {selected.treatingDoctor} is the treating doctor for this slot, so her
                        record stays closed to you. ask the clinic admin to reassign the appointment
                        back if you are covering it.
                      </Notice>
                    </div>
                  )}

                  {isBlocked && (
                    <div className="mt-8">
                      <Notice kind="error">
                        {selected.patient} cancelled this appointment on 14 nov. cancelled
                        appointments can&rsquo;t be written up or marked completed — the slot is
                        back with the booking page.
                      </Notice>
                    </div>
                  )}

                  {selected && (
                    <div className="mt-8 space-y-7" aria-hidden={!canEdit}>
                      <div>
                        <Label htmlFor="cr-notes" className={labelCls} style={{ color: muted }}>
                          Clinical notes
                        </Label>
                        <Textarea
                          data-wf="i-4-0-0"
                          id="cr-notes"
                          rows={6}
                          disabled={!canEdit}
                          value={draft.notes}
                          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                          aria-invalid={Boolean(fieldErrors.notes)}
                          aria-describedby={fieldErrors.notes ? "cr-notes-err" : undefined}
                          className="atrium-focusable text-[15px]"
                          style={{
                            ...areaStyle,
                            borderColor: fieldErrors.notes ? accentStrong : hairline,
                          }}
                        />
                        {fieldErrors.notes && (
                          <p
                            id="cr-notes-err"
                            className="mt-2 flex items-center gap-2 text-xs"
                            style={{ color: ink }}
                          >
                            <Icons.AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            {fieldErrors.notes}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="cr-diagnosis" className={labelCls} style={{ color: muted }}>
                          Diagnosis
                        </Label>
                        <Input
                          data-wf="i-4-0-1"
                          id="cr-diagnosis"
                          disabled={!canEdit}
                          value={draft.diagnosis}
                          onChange={(e) => setDraft({ ...draft, diagnosis: e.target.value })}
                          aria-invalid={Boolean(fieldErrors.diagnosis)}
                          aria-describedby={fieldErrors.diagnosis ? "cr-diagnosis-err" : undefined}
                          className="atrium-focusable text-[15px]"
                          style={{
                            ...fieldStyle,
                            borderColor: fieldErrors.diagnosis ? accentStrong : hairline,
                          }}
                        />
                        {fieldErrors.diagnosis && (
                          <p
                            id="cr-diagnosis-err"
                            className="mt-2 flex items-center gap-2 text-xs"
                            style={{ color: ink }}
                          >
                            <Icons.AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            {fieldErrors.diagnosis}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="cr-prescription"
                          className={labelCls}
                          style={{ color: muted }}
                        >
                          Prescription (optional)
                        </Label>
                        <Textarea
                          data-wf="i-4-0-2"
                          id="cr-prescription"
                          rows={3}
                          disabled={!canEdit}
                          value={draft.prescription}
                          onChange={(e) => setDraft({ ...draft, prescription: e.target.value })}
                          placeholder="leave blank if nothing is prescribed"
                          aria-describedby="cr-prescription-help"
                          className="atrium-focusable text-[15px]"
                          style={areaStyle}
                        />
                        <p
                          id="cr-prescription-help"
                          className="mt-2 text-xs"
                          style={{ color: muted }}
                        >
                          free text only — the patient sees this on her appointment.
                        </p>
                      </div>

                      {saveState === "saved" && (
                        <Notice kind="success" className="atrium-fade">
                          record filed for {selected.patient} · {selected.shortDate},{" "}
                          {selected.start} – {selected.end}. she can read it from her appointments
                          page.
                        </Notice>
                      )}
                      {saveState === "error" && (
                        <Notice kind="error" className="atrium-fade">
                          nothing was filed and your typing is still here. fix the fields marked
                          above and save again.
                        </Notice>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Row 6 — save / status / update */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
                <div className="sm:col-span-4">
                  <button
                    data-wf="b-5-0"
                    type="submit"
                    disabled={!canEdit || saveState === "saving"}
                    className={`${pillBase} atrium-primary w-full min-h-[52px] text-base`}
                    style={{
                      backgroundColor: ink,
                      color: cream,
                      fontFamily: brand.fontHeading,
                      fontStyle: "italic",
                    }}
                  >
                    {saveState === "saving" ? (
                      <>
                        <Icons.Clock className="h-4 w-4 animate-spin" aria-hidden="true" />
                        filing record…
                      </>
                    ) : (
                      <>
                        <Icons.Check className="h-4 w-4" aria-hidden="true" />
                        Save consultation record
                      </>
                    )}
                  </button>
                </div>

                <div data-wf="b-5-1" className="sm:col-span-5">
                  <Label htmlFor="appt-status" className={labelCls} style={{ color: muted }}>
                    Status
                  </Label>
                  <Select
                    id="appt-status"
                    value={statusDraft}
                    disabled={!selected}
                    onChange={(e) => {
                      setStatusDraft(e.target.value);
                      setStatusMsg(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        updateStatus();
                      }
                    }}
                    className="atrium-focusable text-[15px]"
                    style={{ ...fieldStyle, minHeight: "52px" }}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="no-show">No-show</option>
                  </Select>
                </div>

                <div className="sm:col-span-3">
                  <button
                    data-wf="b-5-2"
                    type="button"
                    onClick={updateStatus}
                    disabled={!selected}
                    className={`${pillBase} atrium-ghost w-full min-h-[52px]`}
                    style={{
                      border: `1px solid ${rgba(ink, 0.35)}`,
                      color: ink,
                      backgroundColor: "transparent",
                    }}
                  >
                    Update status
                  </button>
                </div>
              </div>

              {statusMsg && (
                <div className="mt-4 sm:max-w-3xl">
                  <Notice
                    kind={statusMsg.kind === "success" ? "success" : "error"}
                    className="atrium-fade"
                  >
                    {statusMsg.text}
                  </Notice>
                </div>
              )}
            </form>
          </div>
        )}

        <div
          id="panel-availability"
          role={tab === "availability" ? "tabpanel" : undefined}
          aria-labelledby={tab === "availability" ? "tab-availability" : undefined}
        >
          {/* Row 7 — recurring weekly working hours */}
          <section
            data-wf="b-6-0"
            className="mt-14 px-6 py-10 sm:px-10"
            style={{ backgroundColor: rgba(ink, 0.06), borderRadius: brand.radius }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2
                className="text-[22px] leading-snug"
                style={{ fontFamily: brand.fontHeading, fontStyle: "italic" }}
              >
                Recurring weekly working hours
              </h2>
              <p className="text-xs" style={{ color: muted }}>
                saved hours repeat every week and generate whole bookable slots
              </p>
            </div>

            <form onSubmit={saveHours} className="mt-7">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor="av-day" className={labelCls} style={{ color: muted }}>
                    Day of week
                  </Label>
                  <Select
                    data-wf="i-6-0-0"
                    id="av-day"
                    value={hoursForm.day}
                    onChange={(e) => {
                      setHoursForm({ ...hoursForm, day: e.target.value });
                      setHoursMsg(null);
                    }}
                    className="atrium-focusable text-[15px]"
                    style={{ ...fieldStyle, backgroundColor: paper, minHeight: "48px" }}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="av-start" className={labelCls} style={{ color: muted }}>
                    Start time
                  </Label>
                  <Input
                    data-wf="i-6-0-1"
                    id="av-start"
                    type="time"
                    value={hoursForm.start}
                    onChange={(e) => {
                      setHoursForm({ ...hoursForm, start: e.target.value });
                      setHoursMsg(null);
                    }}
                    className="atrium-focusable text-[15px]"
                    style={{
                      ...fieldStyle,
                      backgroundColor: paper,
                      minHeight: "48px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="av-end" className={labelCls} style={{ color: muted }}>
                    End time
                  </Label>
                  <Input
                    data-wf="i-6-0-2"
                    id="av-end"
                    type="time"
                    value={hoursForm.end}
                    onChange={(e) => {
                      setHoursForm({ ...hoursForm, end: e.target.value });
                      setHoursMsg(null);
                    }}
                    className="atrium-focusable text-[15px]"
                    style={{
                      ...fieldStyle,
                      backgroundColor: paper,
                      minHeight: "48px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="av-slot" className={labelCls} style={{ color: muted }}>
                    Slot length (minutes)
                  </Label>
                  <Select
                    data-wf="i-6-0-3"
                    id="av-slot"
                    value={hoursForm.slot}
                    onChange={(e) => {
                      setHoursForm({ ...hoursForm, slot: e.target.value });
                      setHoursMsg(null);
                    }}
                    className="atrium-focusable text-[15px]"
                    style={{
                      ...fieldStyle,
                      backgroundColor: paper,
                      minHeight: "48px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {SLOT_LENGTHS.map((s) => (
                      <option key={s} value={s}>
                        {s} minutes
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {hoursMsg && (
                <div className="mt-6 sm:max-w-3xl">
                  <Notice
                    kind={hoursMsg.kind === "success" ? "success" : "error"}
                    className="atrium-fade"
                  >
                    {hoursMsg.text}
                  </Notice>
                </div>
              )}

              {/* Row 8 — current hours + save */}
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
                <section data-wf="b-7-0" className="lg:col-span-8">
                  <h3
                    className="text-base"
                    style={{ fontFamily: brand.fontHeading, fontStyle: "italic" }}
                  >
                    Current hours
                  </h3>
                  {hours.length === 0 ? (
                    <p
                      className="mt-4 rounded-3xl px-6 py-6 text-sm leading-relaxed"
                      style={{
                        backgroundColor: paper,
                        color: muted,
                        border: `1px solid ${hairline}`,
                      }}
                    >
                      no working hours saved yet. add a day above and save to generate bookable
                      slots — patients can&rsquo;t find you until at least one range exists.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {hours.map((h, idx) => (
                        <li
                          key={h.id}
                          data-wf={idx < 3 ? `i-7-0-${idx}` : undefined}
                          className={h.isNew ? "atrium-rise" : ""}
                          style={{
                            backgroundColor: paper,
                            border: `1px solid ${hairline}`,
                            borderRadius: "999px",
                            padding: "14px 18px 14px 24px",
                          }}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="flex items-center gap-3">
                              <Icons.Calendar
                                className="h-4 w-4 shrink-0"
                                style={{ color: accentStrong }}
                                aria-hidden="true"
                              />
                              <span
                                className="text-[15px]"
                                style={{ fontVariantNumeric: "tabular-nums" }}
                              >
                                <span
                                  style={{ fontFamily: brand.fontHeading, fontStyle: "italic" }}
                                >
                                  {h.day}
                                </span>{" "}
                                {h.start} – {h.end} · {h.slot} min slots
                              </span>
                              {h.booked > 0 && (
                                <span
                                  className="rounded-full px-3 py-1 text-xs"
                                  style={{ backgroundColor: rgba(accent, 0.22), color: ink }}
                                >
                                  {h.booked} booked
                                </span>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => setConfirmRemove(h.id)}
                              aria-label={`Remove ${h.day} ${h.start} to ${h.end}`}
                              className="atrium-focusable atrium-ghost flex h-11 w-11 items-center justify-center rounded-full"
                              style={{ color: ink }}
                            >
                              <Icons.Trash className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                          {confirmRemove === h.id && (
                            <div
                              className="atrium-fade mt-4 rounded-3xl px-5 py-4"
                              style={{ backgroundColor: rgba(ink, 0.07) }}
                            >
                              <p className="text-sm leading-relaxed">
                                {h.booked > 0
                                  ? `removing ${h.day.toLowerCase()} ${h.start} – ${h.end} affects ${h.booked} booked appointment${h.booked > 1 ? "s" : ""}. they stay booked and go to the clinic admin to move.`
                                  : `remove ${h.day.toLowerCase()} ${h.start} – ${h.end}? its free slots stop appearing to patients.`}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                  type="button"
                                  onClick={() => removeHours(h)}
                                  className={`${pillBase} atrium-primary min-h-[44px]`}
                                  style={{ backgroundColor: ink, color: cream }}
                                >
                                  Remove anyway
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmRemove(null)}
                                  className={`${pillBase} atrium-ghost min-h-[44px]`}
                                  style={{ border: `1px solid ${rgba(ink, 0.35)}`, color: ink }}
                                >
                                  Keep hours
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <div className="lg:col-span-4 lg:pt-9">
                  <button
                    data-wf="b-7-1"
                    type="submit"
                    disabled={hoursState === "saving"}
                    className={`${pillBase} atrium-ghost w-full min-h-[52px] text-base`}
                    style={{
                      border: `1px solid ${rgba(ink, 0.35)}`,
                      color: ink,
                      backgroundColor: paper,
                      fontFamily: brand.fontHeading,
                      fontStyle: "italic",
                    }}
                  >
                    {hoursState === "saving" ? (
                      <>
                        <Icons.Clock className="h-4 w-4 animate-spin" aria-hidden="true" />
                        generating slots…
                      </>
                    ) : (
                      <>
                        <Icons.Plus className="h-4 w-4" aria-hidden="true" />
                        Save hours &amp; generate slots
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* Row 9 — warning + profile link */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            <p
              data-wf="b-8-0"
              className="lg:col-span-8 flex items-start gap-3 rounded-3xl px-6 py-5 text-sm leading-relaxed"
              style={{ backgroundColor: rgba(accent, 0.16), color: ink }}
            >
              <Icons.AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">Warning:</span> shortening Monday hours affects 2
                booked appointments. Overlapping ranges on the same day are rejected.
              </span>
            </p>
            <div className="lg:col-span-4 lg:text-right">
              <button
                data-wf="b-8-1"
                type="button"
                onClick={() => navigate("my-account")}
                className="atrium-focusable inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm underline-offset-4 hover:underline"
                style={{ color: accentStrong }}
              >
                Edit my professional profile
                <Icons.ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
