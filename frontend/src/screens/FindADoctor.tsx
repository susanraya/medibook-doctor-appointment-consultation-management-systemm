// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.

import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Button, Input, Label, Checkbox, Badge, Avatar, Empty } = UI;

const { Search, Check, X, User, Calendar, Clock, Filter, AlertCircle, CheckCircle } = Icons;

// ─────────────────────────────────────────────────────────────
// MediBook · Find a Doctor
// Atrium direction: cream canvas, arch-topped panels, pill fields,
// italic serif headings, one gold accent.
// ─────────────────────────────────────────────────────────────

const hexToRgba = (hex, alpha) => {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const SPECIALIZATIONS = [
  { id: "sp-1", name: "Cardiology", is_active: true },
  { id: "sp-2", name: "Dermatology", is_active: true },
  { id: "sp-3", name: "General Medicine", is_active: true },
  { id: "sp-4", name: "Paediatrics", is_active: true },
  { id: "sp-5", name: "Orthopaedics", is_active: true },
];

// disease_mappings + disease_mapping_specializations — a fixed table, no inference
const DISEASE_MAPPINGS = [
  { id: "dm-01", term: "chest pain", specialization_ids: ["sp-1"] },
  { id: "dm-02", term: "palpitations", specialization_ids: ["sp-1"] },
  { id: "dm-03", term: "high blood pressure", specialization_ids: ["sp-1", "sp-3"] },
  { id: "dm-04", term: "breathlessness", specialization_ids: ["sp-1", "sp-3"] },
  { id: "dm-05", term: "eczema", specialization_ids: ["sp-2"] },
  { id: "dm-06", term: "acne", specialization_ids: ["sp-2"] },
  { id: "dm-07", term: "itchy rash", specialization_ids: ["sp-2", "sp-4"] },
  { id: "dm-08", term: "fever", specialization_ids: ["sp-3", "sp-4"] },
  { id: "dm-09", term: "persistent cough", specialization_ids: ["sp-3"] },
  { id: "dm-10", term: "knee pain", specialization_ids: ["sp-5"] },
  { id: "dm-11", term: "lower back pain", specialization_ids: ["sp-5", "sp-3"] },
  { id: "dm-12", term: "childhood asthma", specialization_ids: ["sp-4"] },
];

const DOCTORS = [
  {
    id: "doc-1",
    full_name: "Dr. Anita Rao",
    specialization_id: "sp-1",
    consults: "Mon–Fri",
    contact: "anita.rao@clinic.example",
    bio: "Interventional cardiology, 14 years. Special interest in post-stent follow-up.",
    is_active: true,
    wf_label: "Dr. Anita Rao · Cardiology · Consults Mon",
  },
  {
    id: "doc-2",
    full_name: "Dr. Samir Khan",
    specialization_id: "sp-1",
    consults: "Tue, Thu",
    contact: "samir.khan@clinic.example",
    bio: "Rhythm and blood-pressure clinics. Consults in English, Hindi and Urdu.",
    is_active: true,
  },
  {
    id: "doc-3",
    full_name: "Dr. Priya Menon",
    specialization_id: "sp-2",
    consults: "Mon, Wed, Fri",
    contact: "priya.menon@clinic.example",
    bio: "Adult and childhood skin conditions, patch testing, chronic urticaria.",
    is_active: true,
  },
  {
    id: "doc-4",
    full_name: "Dr. Ellen Whitfield",
    specialization_id: "sp-3",
    consults: "Mon–Sat",
    contact: "ellen.whitfield@clinic.example",
    bio: "General practice, long-term conditions and same-week triage.",
    is_active: true,
  },
  {
    id: "doc-5",
    full_name: "Dr. Tomas Lindqvist",
    specialization_id: "sp-3",
    consults: "Mon, Tue, Thu",
    contact: "tomas.lindqvist@clinic.example",
    bio: "General medicine with a respiratory clinic on Thursday afternoons.",
    is_active: true,
  },
  {
    id: "doc-6",
    full_name: "Dr. Grace Adeyemi",
    specialization_id: "sp-4",
    consults: "Mon–Thu",
    contact: "grace.adeyemi@clinic.example",
    bio: "Paediatrics from newborn to 16, asthma and allergy reviews.",
    is_active: true,
  },
  {
    id: "doc-7",
    full_name: "Dr. Ravi Shetty",
    specialization_id: "sp-5",
    consults: "Wed, Fri",
    contact: "ravi.shetty@clinic.example",
    bio: "Knee and shoulder clinics. Currently on extended leave.",
    is_active: false,
  },
];

const DAYS = [
  { key: "d1", pill: "Mon 17", label: "Mon 17 Nov 2026" },
  { key: "d2", pill: "Tue 18", label: "Tue 18 Nov 2026" },
  { key: "d3", pill: "Wed 19", label: "Wed 19 Nov 2026" },
];

const s = (id, start, end, status, contended) => ({
  id,
  start,
  end,
  status,
  contended: !!contended,
});

// appointment_slots, keyed doctor → day
const SLOTS = {
  "doc-1": {
    d1: [
      s("sl-101", "09:00", "09:30", "available"),
      s("sl-102", "09:30", "10:00", "available"),
      s("sl-103", "10:00", "10:30", "booked"),
      s("sl-104", "11:00", "11:30", "available"),
      s("sl-105", "14:00", "14:30", "available"),
      s("sl-106", "14:30", "15:00", "booked"),
    ],
    d2: [
      s("sl-111", "09:00", "09:30", "available"),
      s("sl-112", "09:30", "10:00", "booked"),
      s("sl-113", "10:00", "10:30", "available"),
      s("sl-114", "15:30", "16:00", "available"),
    ],
    d3: [
      s("sl-121", "11:00", "11:30", "available"),
      s("sl-122", "11:30", "12:00", "available"),
      s("sl-123", "12:00", "12:30", "available"),
    ],
  },
  "doc-2": {
    d1: [],
    d2: [
      s("sl-201", "10:00", "10:30", "available"),
      s("sl-202", "10:30", "11:00", "available"),
      s("sl-203", "16:00", "16:30", "available", true),
      s("sl-204", "16:30", "17:00", "booked"),
    ],
    d3: [],
  },
  "doc-3": {
    d1: [
      s("sl-301", "09:30", "10:00", "available"),
      s("sl-302", "13:00", "13:30", "available"),
      s("sl-303", "13:30", "14:00", "booked"),
    ],
    d2: [],
    d3: [s("sl-311", "09:00", "09:30", "available"), s("sl-312", "09:30", "10:00", "available")],
  },
  "doc-4": {
    d1: [
      s("sl-401", "08:30", "09:00", "available"),
      s("sl-402", "12:00", "12:30", "booked"),
      s("sl-403", "16:00", "16:30", "available"),
    ],
    d2: [s("sl-411", "08:30", "09:00", "available"), s("sl-412", "09:00", "09:30", "available")],
    d3: [s("sl-421", "11:00", "11:30", "available")],
  },
  "doc-5": {
    d1: [s("sl-501", "15:00", "15:30", "available"), s("sl-502", "15:30", "16:00", "available")],
    d2: [s("sl-511", "14:00", "14:30", "booked"), s("sl-512", "14:30", "15:00", "available")],
    d3: [],
  },
  "doc-6": {
    d1: [
      s("sl-601", "09:00", "09:30", "available"),
      s("sl-602", "09:30", "10:00", "available"),
      s("sl-603", "10:00", "10:30", "booked"),
      s("sl-604", "10:30", "11:00", "available"),
    ],
    d2: [s("sl-611", "09:00", "09:30", "available")],
    d3: [s("sl-621", "13:00", "13:30", "available"), s("sl-622", "13:30", "14:00", "available")],
  },
  "doc-7": { d1: [], d2: [], d3: [] },
};

const PATIENT_EMAIL = "susan.raya@quorq.ai";

const cloneSlots = () => {
  const out = {};
  Object.keys(SLOTS).forEach((docId) => {
    out[docId] = {};
    Object.keys(SLOTS[docId]).forEach((day) => {
      out[docId][day] = SLOTS[docId][day].map((slot) => ({ ...slot }));
    });
  });
  return out;
};

const specName = (id) => (SPECIALIZATIONS.find((x) => x.id === id) || {}).name || "";

export default function Screen() {
  const navigate = useNavigate();
  const ink = brand.primaryColor;
  const cream = brand.backgroundColor;
  const gold = brand.accentColor;
  const t = (a) => hexToRgba(ink, a);
  const muted = t(0.78);
  const soft = t(0.06);
  const hair = t(0.14);

  const archTop = { borderRadius: "50% 50% 24px 24px / 26% 26% 24px 24px" };
  const pill = { borderRadius: "999px" };
  const primaryBtn = {
    ...pill,
    backgroundColor: ink,
    color: cream,
    border: "1px solid transparent",
  };
  const ghostBtn = {
    ...pill,
    backgroundColor: "transparent",
    color: ink,
    border: `1px solid ${t(0.22)}`,
  };

  // ── state ────────────────────────────────────────────────
  const [query, setQuery] = React.useState("chest pain");
  const [result, setResult] = React.useState({
    kind: "mapping",
    term: "chest pain",
    matchedTerm: "chest pain",
    specIds: ["sp-1"],
  });
  const [searching, setSearching] = React.useState(false);
  const [selectedSpecId, setSelectedSpecId] = React.useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = React.useState("doc-1");
  const [day, setDay] = React.useState("d1");
  const [slots, setSlots] = React.useState(cloneSlots);
  const [freshness, setFreshness] = React.useState("live");
  const [checkedAt, setCheckedAt] = React.useState("just now");
  const [takenNote, setTakenNote] = React.useState("");

  const [modal, setModal] = React.useState(null); // { doctorId, day, slot }
  const [bookingState, setBookingState] = React.useState("idle"); // idle | booking | failed | confirmed
  const [consentChecked, setConsentChecked] = React.useState(false);
  const [consentError, setConsentError] = React.useState("");
  const [consent, setConsent] = React.useState({ consented: false, consented_at: null }); // patient_consents

  const timers = React.useRef([]);
  const panelRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const filterRef = React.useRef(null);
  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ── derived ──────────────────────────────────────────────
  const doctors = React.useMemo(
    () => DOCTORS.filter((d) => d.is_active && result.specIds.indexOf(d.specialization_id) !== -1),
    [result],
  );
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || null;
  const daySlots = selectedDoctor ? (slots[selectedDoctor.id] || {})[day] || [] : [];
  const freeCount = daySlots.filter((x) => x.status === "available").length;

  // ── search: static lookup against the mapping table ──────
  const runSearch = (raw) => {
    const q = (raw || "").trim().toLowerCase();
    if (!q) return;
    setSearching(true);
    setSelectedSpecId(null);
    setTakenNote("");
    later(() => {
      const hits = DISEASE_MAPPINGS.filter(
        (m) => m.term === q || m.term.indexOf(q) !== -1 || q.indexOf(m.term) !== -1,
      );
      const spec = SPECIALIZATIONS.find((x) => x.name.toLowerCase() === q);
      let next;
      if (hits.length) {
        const ids = [];
        hits.forEach((m) =>
          m.specialization_ids.forEach((id) => ids.indexOf(id) === -1 && ids.push(id)),
        );
        next = { kind: "mapping", term: raw.trim(), matchedTerm: hits[0].term, specIds: ids };
      } else if (spec) {
        next = { kind: "specialization", term: raw.trim(), matchedTerm: null, specIds: [spec.id] };
        setSelectedSpecId(spec.id);
      } else {
        next = { kind: "none", term: raw.trim(), matchedTerm: null, specIds: [] };
      }
      setResult(next);
      const first = DOCTORS.find(
        (d) => d.is_active && next.specIds.indexOf(d.specialization_id) !== -1,
      );
      setSelectedDoctorId(first ? first.id : null);
      setDay("d1");
      setSearching(false);
    }, 520);
  };

  const browseSpecialization = (sp) => {
    setQuery("");
    setSelectedSpecId(sp.id);
    setTakenNote("");
    setSearching(true);
    later(() => {
      setResult({ kind: "specialization", term: sp.name, matchedTerm: null, specIds: [sp.id] });
      const first = DOCTORS.find((d) => d.is_active && d.specialization_id === sp.id);
      setSelectedDoctorId(first ? first.id : null);
      setDay("d1");
      setSearching(false);
    }, 420);
  };

  // ── real-time availability refresh ───────────────────────
  const refreshAvailability = () => {
    if (!selectedDoctor) return;
    setFreshness("checking");
    later(() => {
      let note = "";
      setSlots((prev) => {
        const next = cloneSlots.length ? { ...prev } : prev;
        const list = ((next[selectedDoctor.id] || {})[day] || []).map((x) => ({ ...x }));
        const idx = list.findIndex((x) => x.status === "available" && x.start === "11:00");
        if (idx > -1) {
          list[idx].status = "booked";
          note = `${list[idx].start} – ${list[idx].end} was taken by another patient a moment ago.`;
        }
        next[selectedDoctor.id] = { ...next[selectedDoctor.id], [day]: list };
        return next;
      });
      setTakenNote(note);
      setCheckedAt("just now");
      setFreshness("live");
    }, 700);
  };

  // ── booking ──────────────────────────────────────────────
  const openBooking = (doctor, slot, ev) => {
    triggerRef.current = ev && ev.currentTarget ? ev.currentTarget : null;
    setModal({ doctorId: doctor.id, day, slot });
    setBookingState("idle");
    setConsentError("");
    setConsentChecked(consent.consented);
  };

  const closeModal = () => {
    setModal(null);
    setBookingState("idle");
    if (triggerRef.current && triggerRef.current.focus) {
      const el = triggerRef.current;
      later(() => {
        if (document.body.contains(el)) el.focus();
      }, 0);
    }
  };

  const confirmBooking = () => {
    if (!modal) return;
    if (!consent.consented && !consentChecked) {
      setConsentError("we need your consent before the clinic can hold a slot for you.");
      return;
    }
    setConsentError("");
    setBookingState("booking");
    later(() => {
      const doc = modal.doctorId;
      const list = ((slots[doc] || {})[modal.day] || []).map((x) => ({ ...x }));
      const idx = list.findIndex((x) => x.id === modal.slot.id);
      const target = idx > -1 ? list[idx] : null;

      if (target && target.contended && target.status === "available") {
        // server-side concurrency control said no
        list[idx] = { ...target, status: "booked", contended: false };
        setSlots((prev) => ({ ...prev, [doc]: { ...prev[doc], [modal.day]: list } }));
        setFreshness("stale");
        setBookingState("failed");
        return;
      }
      if (!consent.consented) {
        setConsent({ consented: true, consented_at: "17 Nov 2026, 10:04" });
      }
      if (target) {
        list[idx] = { ...target, status: "booked", mine: true };
        setSlots((prev) => ({ ...prev, [doc]: { ...prev[doc], [modal.day]: list } }));
      }
      setBookingState("confirmed");
      later(() => navigate("my-appointments"), 1500);
    }, 780);
  };

  // ── modal keyboard behaviour ─────────────────────────────
  React.useEffect(() => {
    if (!modal) return undefined;
    const node = panelRef.current;
    const auto = node && node.querySelector('[data-autofocus="true"]');
    if (auto && auto.focus) auto.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const all = Array.prototype.slice
        .call(
          node.querySelectorAll(
            'button, input, a[href], select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        )
        .filter((el) => !el.disabled && el.getAttribute("aria-hidden") !== "true");
      if (!all.length) return;
      const first = all[0];
      const last = all[all.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal]);

  // ── copy for the resolution line ─────────────────────────
  const specNames = result.specIds.map(specName);
  const joined = specNames.length === 2 ? specNames.join(" and ") : specNames.join(", ");
  const countCopy = `${doctors.length} active doctor${doctors.length === 1 ? "" : "s"} found.`;
  const resolutionText =
    result.kind === "mapping"
      ? `“${result.term}” resolved to ${joined} using the clinic's predefined mapping table. ${countCopy}`
      : result.kind === "specialization"
        ? `Browsing ${joined} straight from the clinic's specialization list — no mapping needed. ${countCopy}`
        : "";

  const styleTag = `
    .atr-focus:focus-visible { outline: 2px solid ${ink}; outline-offset: 2px; box-shadow: 0 0 0 5px ${hexToRgba(gold, 0.35)}; }
    .atr-btn { transition: filter .18s ease, background-color .18s ease, transform .18s ease; }
    .atr-btn:hover:not(:disabled) { filter: brightness(1.12); }
    .atr-ghost:hover:not(:disabled) { background-color: ${t(0.07)}; }
    .atr-card { transition: box-shadow .2s ease, background-color .2s ease; }
    .atr-row { transition: background-color .18s ease; }
    .atr-row:hover { background-color: ${t(0.05)}; }
    @keyframes atrRise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    @keyframes atrBreathe { 0%, 100% { opacity: .45; } 50% { opacity: .85; } }
    .atr-rise { animation: atrRise .32s ease both; }
    .atr-breathe { animation: atrBreathe 1.4s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .atr-rise, .atr-breathe { animation: none !important; }
      .atr-btn, .atr-card, .atr-row { transition: none !important; }
    }
  `;

  const Heading = ({ level, children, className, style }) => {
    const Tag = `h${level}`;
    return (
      <Tag
        className={className}
        style={{
          fontFamily: brand.fontHeading,
          fontStyle: "italic",
          letterSpacing: "-0.01em",
          ...style,
        }}
      >
        {children}
      </Tag>
    );
  };

  return (
    <div
      className="min-h-full w-full px-5 py-10 md:px-10 md:py-14"
      style={{ backgroundColor: cream, color: ink, fontFamily: brand.fontBody }}
    >
      <style>{styleTag}</style>
      <div className="mx-auto w-full max-w-5xl">
        {/* ── b-0-0 page title ───────────────────────────── */}
        <header data-wf="b-0-0" className="mb-8 md:mb-10">
          <p className="mb-2 text-xs uppercase tracking-[0.18em]" style={{ color: muted }}>
            Patient booking
          </p>
          <Heading level={1} className="text-[34px] leading-tight md:text-[40px]">
            Find a Doctor
          </Heading>
          <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed" style={{ color: muted }}>
            describe it the way you'd say it out loud. we match your words against the clinic's own
            disease-to-specialization table — a fixed list kept by the admin team, never a guess.
          </p>
        </header>

        {/* ── search panel (b-1-0 / b-1-1) ───────────────── */}
        <section
          className="mb-8 px-6 pb-8 pt-10 md:px-10 md:pb-10 md:pt-12"
          style={{ ...archTop, backgroundColor: soft }}
          aria-labelledby="search-h"
        >
          <Heading level={2} id="search-h" className="mb-5 text-center text-[21px]">
            what can we help with?
          </Heading>
          <form
            className="grid grid-cols-12 gap-3 md:gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              runSearch(query);
            }}
          >
            <div className="col-span-12 md:col-span-9">
              <Label
                htmlFor="doctor-search"
                className="mb-2 block text-xs uppercase tracking-[0.14em]"
                style={{ color: muted }}
              >
                Disease, symptom or specialization
              </Label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2"
                  style={{ color: gold }}
                />
                <Input
                  id="doctor-search"
                  data-wf="b-1-0"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Disease, symptom or specialization — e.g. chest pain"
                  className="atr-focus w-full pl-14 pr-5 text-[15px]"
                  style={{
                    ...pill,
                    height: "56px",
                    backgroundColor: cream,
                    border: `1px solid ${t(0.18)}`,
                    color: ink,
                  }}
                />
              </div>
            </div>
            <div className="col-span-12 flex items-end md:col-span-3">
              <Button
                type="submit"
                data-wf="b-1-1"
                className="atr-btn atr-focus w-full text-[15px] font-semibold"
                style={{ ...primaryBtn, height: "56px" }}
              >
                {searching ? "searching…" : "Search"}
              </Button>
            </div>
          </form>

          {/* ── b-2-0 filter bar ─────────────────────────── */}
          <div data-wf="b-2-0" className="mt-7" ref={filterRef}>
            <div className="mb-3 flex items-center gap-2">
              <Filter aria-hidden="true" className="h-4 w-4" style={{ color: gold }} />
              <span className="text-xs uppercase tracking-[0.14em]" style={{ color: muted }}>
                Or browse by specialization
              </span>
            </div>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Browse by specialization"
            >
              {SPECIALIZATIONS.map((sp, i) => {
                const on = selectedSpecId === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    data-wf={`i-2-0-${i}`}
                    aria-pressed={on}
                    onClick={() => browseSpecialization(sp)}
                    className="atr-btn atr-ghost atr-focus min-h-[44px] px-5 text-sm"
                    style={
                      on
                        ? {
                            ...pill,
                            backgroundColor: ink,
                            color: cream,
                            border: "1px solid transparent",
                          }
                        : {
                            ...pill,
                            backgroundColor: cream,
                            color: ink,
                            border: `1px solid ${t(0.18)}`,
                          }
                    }
                  >
                    {on ? "✓ " : ""}
                    {sp.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <p className="sr-only" aria-live="polite">
          {searching ? "checking the mapping table" : resolutionText || "no doctors to show"}
        </p>

        {/* ── loading ─────────────────────────────────────── */}
        {searching && (
          <section className="mb-10" aria-busy="true">
            <p className="mb-5 text-[15px]" style={{ color: muted }}>
              checking the clinic's mapping table for “{query || result.term}”…
            </p>
            <div className="grid grid-cols-12 gap-5">
              {[0, 1].map((k) => (
                <div
                  key={k}
                  className="atr-breathe col-span-12 h-56 md:col-span-6"
                  style={{ ...archTop, backgroundColor: soft, animationDelay: `${k * 0.18}s` }}
                />
              ))}
            </div>
          </section>
        )}

        {!searching && (
          <>
            {/* ── b-3-0 resolution text ──────────────────── */}
            {result.kind !== "none" && (
              <section data-wf="b-3-0" className="atr-rise mb-8">
                <div
                  className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between"
                  style={{ borderRadius: brand.radius, backgroundColor: hexToRgba(gold, 0.13) }}
                >
                  <p className="max-w-[70ch] text-[15px] leading-relaxed" style={{ color: ink }}>
                    {resolutionText}
                  </p>
                  {result.kind === "mapping" && (
                    <Badge
                      className="shrink-0 px-4 py-1.5 text-xs"
                      style={{
                        ...pill,
                        backgroundColor: cream,
                        color: ink,
                        border: `1px solid ${t(0.18)}`,
                      }}
                    >
                      static lookup · no AI
                    </Badge>
                  )}
                </div>
              </section>
            )}

            {/* ── b-4-0 / b-4-1 doctor cards ─────────────── */}
            {doctors.length > 0 && (
              <section className="mb-10" aria-labelledby="doctors-h">
                <Heading level={2} id="doctors-h" className="mb-5 text-[22px]">
                  doctors taking bookings
                </Heading>
                <ul className="grid grid-cols-12 gap-5 list-none p-0">
                  {doctors.map((d, i) => {
                    const on = selectedDoctorId === d.id;
                    const wf = i === 0 ? "b-4-0" : i === 1 ? "b-4-1" : undefined;
                    return (
                      <li key={d.id} data-wf={wf} className="atr-rise col-span-12 md:col-span-6">
                        {wf && (
                          <span className="sr-only" aria-hidden="true">
                            {d.wf_label ||
                              `${d.full_name} · ${specName(d.specialization_id)} · Consults ${d.consults}`}
                          </span>
                        )}
                        <div
                          className="atr-card flex h-full flex-col px-7 pb-7 pt-12"
                          style={{
                            ...archTop,
                            backgroundColor: on ? t(0.08) : t(0.045),
                            boxShadow: on
                              ? `inset 0 0 0 1px ${hexToRgba(gold, 0.75)}`
                              : `inset 0 0 0 1px ${hair}`,
                          }}
                        >
                          <div className="mb-4 flex items-start gap-4">
                            <Avatar name={d.full_name} className="h-12 w-12 shrink-0" />
                            <div className="min-w-0">
                              <Heading level={3} className="text-[19px] leading-snug">
                                {d.full_name}
                              </Heading>
                              <p className="mt-1 text-sm" style={{ color: muted }}>
                                {specName(d.specialization_id)}
                              </p>
                            </div>
                          </div>
                          <p className="mb-4 text-[14px] leading-relaxed" style={{ color: muted }}>
                            {d.bio}
                          </p>
                          <dl className="mb-6 space-y-1.5 text-[14px]">
                            <div className="flex gap-2">
                              <dt className="sr-only">Consults</dt>
                              <Calendar
                                aria-hidden="true"
                                className="h-4 w-4 shrink-0 translate-y-0.5"
                                style={{ color: gold }}
                              />
                              <dd style={{ color: ink }}>Consults {d.consults}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="sr-only">Contact</dt>
                              <User
                                aria-hidden="true"
                                className="h-4 w-4 shrink-0 translate-y-0.5"
                                style={{ color: gold }}
                              />
                              <dd className="truncate" style={{ color: muted }}>
                                {d.contact}
                              </dd>
                            </div>
                          </dl>
                          <div className="mt-auto">
                            <Button
                              type="button"
                              aria-pressed={on}
                              onClick={() => {
                                setSelectedDoctorId(d.id);
                                setTakenNote("");
                              }}
                              className="atr-btn atr-focus min-h-[44px] w-full px-5 text-sm font-semibold"
                              style={on ? { ...ghostBtn, backgroundColor: cream } : primaryBtn}
                            >
                              {on ? "showing free slots below" : "View free slots"}
                            </Button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {/* ── b-5-0 slot list ────────────────────────── */}
            {selectedDoctor && (
              <section
                data-wf="b-5-0"
                className="atr-rise mb-10 px-6 pb-8 pt-9 md:px-9"
                style={{
                  borderRadius: brand.radius,
                  backgroundColor: t(0.05),
                  boxShadow: `inset 0 0 0 1px ${hair}`,
                }}
                aria-labelledby="slots-h"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Heading level={2} id="slots-h" className="text-[22px] leading-snug">
                      Available slots — {selectedDoctor.full_name},{" "}
                      {DAYS.find((x) => x.key === day).label}
                    </Heading>
                    <p className="mt-2 text-[14px]" style={{ color: muted }}>
                      {freeCount > 0
                        ? `${freeCount} free slot${freeCount === 1 ? "" : "s"} · 30 minutes each · booking takes the whole slot`
                        : "no free slots on this day"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs"
                      style={{
                        ...pill,
                        backgroundColor: freshness === "stale" ? hexToRgba(gold, 0.18) : cream,
                        color: ink,
                        border: `1px solid ${t(0.16)}`,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className={freshness === "checking" ? "atr-breathe" : ""}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          backgroundColor: gold,
                          display: "inline-block",
                        }}
                      />
                      {freshness === "checking"
                        ? "checking…"
                        : freshness === "stale"
                          ? "may be a moment behind"
                          : `live · checked ${checkedAt}`}
                    </span>
                    <Button
                      type="button"
                      onClick={refreshAvailability}
                      disabled={freshness === "checking"}
                      className="atr-btn atr-ghost atr-focus min-h-[44px] px-5 text-sm"
                      style={{
                        ...ghostBtn,
                        backgroundColor: cream,
                        opacity: freshness === "checking" ? 0.6 : 1,
                      }}
                    >
                      <Clock aria-hidden="true" className="mr-2 inline h-4 w-4" />
                      Refresh availability
                    </Button>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Choose a day">
                  {DAYS.map((dd) => {
                    const on = day === dd.key;
                    return (
                      <button
                        key={dd.key}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setDay(dd.key);
                          setTakenNote("");
                        }}
                        className="atr-btn atr-ghost atr-focus min-h-[40px] px-4 text-sm"
                        style={
                          on
                            ? {
                                ...pill,
                                backgroundColor: ink,
                                color: cream,
                                border: "1px solid transparent",
                              }
                            : {
                                ...pill,
                                backgroundColor: cream,
                                color: ink,
                                border: `1px solid ${t(0.16)}`,
                              }
                        }
                      >
                        {dd.pill}
                      </button>
                    );
                  })}
                </div>

                {takenNote && (
                  <p
                    className="atr-rise mt-5 flex items-start gap-2 px-5 py-3 text-[14px]"
                    style={{ ...pill, backgroundColor: hexToRgba(gold, 0.16), color: ink }}
                    role="status"
                  >
                    <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 translate-y-0.5" />
                    {takenNote} the list below is up to date now.
                  </p>
                )}

                <div className="mt-6" style={{ height: 1, backgroundColor: hair }} />

                {daySlots.length === 0 ? (
                  <div className="py-10 text-center">
                    <Heading level={3} className="text-[18px]">
                      nothing on {DAYS.find((x) => x.key === day).pill}
                    </Heading>
                    <p
                      className="mx-auto mt-2 max-w-[48ch] text-[14px] leading-relaxed"
                      style={{ color: muted }}
                    >
                      {selectedDoctor.full_name} consults {selectedDoctor.consults}. pick another
                      day above, or choose another doctor from the list.
                    </p>
                  </div>
                ) : (
                  <ul className="list-none p-0">
                    {daySlots.map((slot, i) => {
                      const free = slot.status === "available";
                      return (
                        <li
                          key={slot.id}
                          className="atr-row flex flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                          style={{ borderBottom: `1px solid ${hair}` }}
                        >
                          <div className="flex items-center gap-4">
                            <Clock
                              aria-hidden="true"
                              className="h-4 w-4 shrink-0"
                              style={{ color: free ? gold : t(0.35) }}
                            />
                            <span
                              className="text-[16px] font-semibold"
                              style={{
                                fontVariantNumeric: "tabular-nums",
                                color: free ? ink : t(0.5),
                              }}
                            >
                              {slot.start} – {slot.end}
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs"
                              style={{
                                ...pill,
                                backgroundColor: free ? t(0.07) : "transparent",
                                color: free ? ink : muted,
                                border: free ? "1px solid transparent" : `1px solid ${t(0.14)}`,
                              }}
                            >
                              {free ? (
                                <Check aria-hidden="true" className="h-3.5 w-3.5" />
                              ) : (
                                <X aria-hidden="true" className="h-3.5 w-3.5" />
                              )}
                              {free ? "Available" : slot.mine ? "Booked by you" : "Booked"}
                            </span>
                          </div>
                          {free ? (
                            <Button
                              type="button"
                              data-wf={i < 4 ? `i-5-0-${i}` : undefined}
                              onClick={(e) => openBooking(selectedDoctor, slot, e)}
                              className="atr-btn atr-focus min-h-[44px] px-6 text-sm font-semibold"
                              style={primaryBtn}
                            >
                              Book this slot
                            </Button>
                          ) : (
                            <span className="px-2 text-[13px]" style={{ color: muted }}>
                              not available
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}

            {/* ── b-6-0 empty states ─────────────────────── */}
            {doctors.length === 0 && (
              <section
                data-wf="b-6-0"
                className="atr-rise mb-10 px-6 py-12 md:px-10"
                style={{ ...archTop, backgroundColor: soft }}
              >
                <Empty
                  title={
                    result.kind === "specialization"
                      ? `no active doctors in ${joined} right now`
                      : `no mapping for “${result.term}”`
                  }
                  description={
                    result.kind === "specialization"
                      ? "the specialization is on the clinic's list, but nobody in it is taking bookings this week. try General Medicine for a first look, or check back on Monday."
                      : "No mapping found for that term, and no doctors to show. Browse by specialization above."
                  }
                  action={
                    <Button
                      type="button"
                      onClick={() => {
                        const el = filterRef.current && filterRef.current.querySelector("button");
                        if (el) el.focus();
                      }}
                      className="atr-btn atr-focus min-h-[44px] px-6 text-sm font-semibold"
                      style={primaryBtn}
                    >
                      browse by specialization
                    </Button>
                  }
                />
              </section>
            )}
          </>
        )}
      </div>

      {/* ── b-7-0 confirm booking modal ─────────────────── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ backgroundColor: hexToRgba(ink, 0.5) }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            data-wf="b-7-0"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-h"
            className="atr-rise w-full max-w-xl px-7 pb-8 pt-12 md:px-10"
            style={{
              ...archTop,
              backgroundColor: cream,
              boxShadow: `0 24px 60px ${hexToRgba(ink, 0.3)}`,
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <Heading level={2} id="confirm-h" className="text-[26px] leading-tight">
                  Confirm booking
                </Heading>
                <p className="mt-2 text-[15px]" style={{ color: muted }}>
                  {(DOCTORS.find((d) => d.id === modal.doctorId) || {}).full_name} ·{" "}
                  {specName((DOCTORS.find((d) => d.id === modal.doctorId) || {}).specialization_id)}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close booking confirmation"
                onClick={closeModal}
                className="atr-btn atr-focus flex h-11 w-11 shrink-0 items-center justify-center"
                style={{
                  ...pill,
                  backgroundColor: t(0.07),
                  color: ink,
                  border: 0,
                  cursor: "pointer",
                }}
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div
              className="mb-6 px-6 py-5"
              style={{ borderRadius: brand.radius, backgroundColor: t(0.06) }}
            >
              <p className="text-xs uppercase tracking-[0.14em]" style={{ color: muted }}>
                {DAYS.find((x) => x.key === modal.day).label}
              </p>
              <p
                className="mt-1 text-[28px] font-semibold"
                style={{
                  fontVariantNumeric: "tabular-nums",
                  fontFamily: brand.fontHeading,
                  fontStyle: "italic",
                }}
              >
                {modal.slot.start} – {modal.slot.end}
              </p>
              <p
                className="mt-3 flex items-start gap-2 text-[14px] leading-relaxed"
                style={{ color: muted }}
              >
                <CheckCircle
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 translate-y-0.5"
                  style={{ color: gold }}
                />
                Consultation fee is paid at the clinic, no online payment.
              </p>
            </div>

            {bookingState === "failed" && (
              <div
                className="atr-rise mb-6 flex items-start gap-3 px-6 py-5"
                role="alert"
                style={{ borderRadius: brand.radius, backgroundColor: hexToRgba(gold, 0.2) }}
              >
                <AlertCircle
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 translate-y-0.5"
                  style={{ color: ink }}
                />
                <div>
                  <p className="text-[15px] font-semibold">that slot went a second before you</p>
                  <p className="mt-1 text-[14px] leading-relaxed" style={{ color: muted }}>
                    another patient confirmed {modal.slot.start} – {modal.slot.end} while you were
                    reading. nothing was charged and your consent is kept — close this and pick
                    another time, we'll book it straight away.
                  </p>
                </div>
              </div>
            )}

            {bookingState === "confirmed" && (
              <div
                className="atr-rise mb-6 flex items-start gap-3 px-6 py-5"
                role="status"
                style={{ borderRadius: brand.radius, backgroundColor: t(0.08) }}
              >
                <CheckCircle
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 translate-y-0.5"
                  style={{ color: gold }}
                />
                <div>
                  <p className="text-[15px] font-semibold">slot reserved — see you then</p>
                  <p className="mt-1 text-[14px] leading-relaxed" style={{ color: muted }}>
                    a confirmation is on its way to {PATIENT_EMAIL}. taking you to my appointments…
                  </p>
                </div>
              </div>
            )}

            {/* ── b-8-0 consent field ─────────────────── */}
            <div className="grid grid-cols-12 items-start gap-4">
              <div className="col-span-12 sm:col-span-8">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="health-consent"
                    data-wf="b-8-0"
                    className="atr-focus mt-1"
                    checked={consent.consented ? true : consentChecked}
                    disabled={consent.consented || bookingState === "confirmed"}
                    onChange={(e) => {
                      setConsentChecked(e.target.checked);
                      if (e.target.checked) setConsentError("");
                    }}
                  />
                  <div>
                    <Label
                      htmlFor="health-consent"
                      className="text-[14px] leading-relaxed"
                      style={{ color: ink }}
                    >
                      I consent to the clinic storing and processing my health data
                    </Label>
                    <p className="mt-1 text-[13px] leading-relaxed" style={{ color: muted }}>
                      {consent.consented
                        ? `consent recorded ${consent.consented_at} — thank you, we won't ask again.`
                        : "kept for your consultation records only, and you can withdraw it from my account."}
                    </p>
                    {consentError && (
                      <p
                        className="atr-rise mt-2 flex items-center gap-2 text-[13px] font-semibold"
                        role="alert"
                        style={{ color: ink }}
                      >
                        <AlertCircle aria-hidden="true" className="h-4 w-4" />
                        {consentError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── b-8-1 confirm ───────────────────── */}
              <div className="col-span-12 sm:col-span-4">
                {bookingState === "failed" ? (
                  <Button
                    type="button"
                    data-wf="b-8-1"
                    data-autofocus="true"
                    onClick={closeModal}
                    className="atr-btn atr-focus min-h-[52px] w-full px-5 text-[15px] font-semibold"
                    style={primaryBtn}
                  >
                    choose another time
                  </Button>
                ) : bookingState === "confirmed" ? (
                  <Button
                    type="button"
                    data-wf="b-8-1"
                    data-autofocus="true"
                    onClick={() => navigate("my-appointments")}
                    className="atr-btn atr-focus min-h-[52px] w-full px-5 text-[15px] font-semibold"
                    style={primaryBtn}
                  >
                    view my appointments
                  </Button>
                ) : (
                  <Button
                    type="button"
                    data-wf="b-8-1"
                    data-autofocus="true"
                    onClick={confirmBooking}
                    disabled={bookingState === "booking"}
                    className="atr-btn atr-focus min-h-[52px] w-full px-5 text-[15px] font-semibold"
                    style={{ ...primaryBtn, opacity: bookingState === "booking" ? 0.75 : 1 }}
                  >
                    {bookingState === "booking" ? "reserving your slot…" : "Confirm booking"}
                  </Button>
                )}
                {bookingState === "idle" && (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="atr-focus mt-3 w-full text-[13px] underline underline-offset-4"
                    style={{
                      color: muted,
                      background: "none",
                      border: 0,
                      cursor: "pointer",
                      minHeight: "44px",
                    }}
                  >
                    not now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
