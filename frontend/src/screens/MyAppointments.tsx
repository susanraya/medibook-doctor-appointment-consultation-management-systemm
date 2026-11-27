// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Select,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Avatar,
  Empty,
} = UI;

const { Home, ArrowLeft, ArrowRight } = Icons;

const PATIENT_EMAIL = "susan.raya@quorq.ai";
const CLINIC_PHONE = "020 7946 0318";

const INITIAL_APPOINTMENTS = [
  {
    id: "apt-3181",
    doctor: "Dr. Priya Menon",
    specialization: "Cardiology",
    dateLabel: "Wed 18 Nov 2026",
    timeLabel: "09:15 – 09:45",
    sortKey: 20261118,
    status: "confirmed",
    group: "upcoming",
    note: "slot held since 29 oct · in-person, fernbrook clinic room 4",
  },
  {
    id: "apt-3204",
    doctor: "Dr. Samuel Okafor",
    specialization: "Dermatology",
    dateLabel: "Tue 01 Dec 2026",
    timeLabel: "16:00 – 16:30",
    sortKey: 20261201,
    status: "confirmed",
    group: "upcoming",
    note: "moved from 24 nov · in-person, fernbrook clinic room 11",
  },
  {
    id: "apt-2988",
    doctor: "Dr. Anita Rao",
    specialization: "Cardiology",
    dateLabel: "Mon 02 Nov 2026",
    timeLabel: "10:30 – 11:00",
    sortKey: 20261102,
    status: "completed",
    group: "past",
    record: {
      diagnosis: "Stable angina.",
      notes: "Chest discomfort on exertion, blood pressure 130/84, ECG unremarkable.",
      prescription: "Aspirin 75 mg once daily; review in six weeks.",
      updatedAt: "filed 02 nov 2026, 11:18",
    },
  },
  {
    id: "apt-2914",
    doctor: "Dr. Leena Fernandes",
    specialization: "Dermatology",
    dateLabel: "Thu 22 Oct 2026",
    timeLabel: "14:45 – 15:15",
    sortKey: 20261022,
    status: "completed",
    group: "past",
    record: {
      diagnosis: "Contact dermatitis, left forearm.",
      notes:
        "Itching for eleven days after a new garden soap. No spread beyond the forearm, skin intact, no infection.",
      prescription:
        "Hydrocortisone 1% cream twice daily for seven days; stop the soap and re-book if the rash returns.",
      updatedAt: "filed 22 oct 2026, 15:40",
    },
  },
  {
    id: "apt-2860",
    doctor: "Dr. Samuel Okafor",
    specialization: "ENT",
    dateLabel: "Fri 09 Oct 2026",
    timeLabel: "11:00 – 11:30",
    sortKey: 20261009,
    status: "no-show",
    group: "past",
    record: null,
    recordState: "no-visit",
  },
  {
    id: "apt-2702",
    doctor: "Dr. Anita Rao",
    specialization: "Cardiology",
    dateLabel: "Tue 15 Sep 2026",
    timeLabel: "10:30 – 11:00",
    sortKey: 20260915,
    status: "completed",
    group: "past",
    record: {
      diagnosis: "Exertional chest pain, cause not yet established.",
      notes:
        "Two episodes while climbing stairs, each settling within five minutes. Referred for a treadmill stress test before the next review.",
      prescription: "None issued at this visit.",
      updatedAt: "filed 15 sep 2026, 12:02",
    },
  },
  {
    id: "apt-2554",
    doctor: "Dr. Marcus Vale",
    specialization: "Orthopaedics",
    dateLabel: "Wed 27 Aug 2026",
    timeLabel: "08:45 – 09:15",
    sortKey: 20260827,
    status: "completed",
    group: "past",
    record: null,
    recordState: "pending",
  },
  {
    id: "apt-2971",
    doctor: "Dr. Priya Menon",
    specialization: "Cardiology",
    dateLabel: "Thu 05 Nov 2026",
    timeLabel: "15:30 – 16:00",
    sortKey: 20261105,
    status: "cancelled",
    group: "cancelled",
    note: "cancelled by you on 29 oct · slot returned to the diary",
  },
];

const STATUS_WORD = {
  confirmed: "Confirmed",
  completed: "Completed",
  "no-show": "No-show",
  cancelled: "Cancelled",
};

export default function Screen() {
  const navigate = useNavigate();
  const P = brand.primaryColor;
  const A = brand.accentColor;
  const N = brand.neutralColor;
  const BG = brand.backgroundColor;

  const rgba = (hex, a) => {
    const h = String(hex).replace("#", "");
    const n = parseInt(
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h,
      16,
    );
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  };

  const ink = P;
  const inkSoft = rgba(P, 0.78);
  const line = rgba(P, 0.12);
  const panel = rgba(P, 0.05);
  const panelDeep = rgba(P, 0.08);

  const ringStyle = {
    ["--tw-ring-color"]: A,
    ["--tw-ring-offset-color"]: BG,
  };
  const focusRing =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition";

  const [tab, setTab] = React.useState("upcoming");
  const [appointments, setAppointments] = React.useState(INITIAL_APPOINTMENTS);
  const [selectedUpcoming, setSelectedUpcoming] = React.useState("apt-3181");
  const [selectedPast, setSelectedPast] = React.useState("apt-2988");
  const [cancelling, setCancelling] = React.useState(false);
  const [banner, setBanner] = React.useState(null);
  const [justChanged, setJustChanged] = React.useState(null);
  const [slotCheck, setSlotCheck] = React.useState("stale");
  const [checkedLabel, setCheckedLabel] = React.useState("4 minutes ago");

  const upcoming = appointments.filter((a) => a.group === "upcoming");
  const past = appointments.filter((a) => a.group === "past");
  const cancelled = appointments.filter((a) => a.group === "cancelled");

  const selectedUpcomingApt = upcoming.find((a) => a.id === selectedUpcoming) || null;
  const selectedPastApt = past.find((a) => a.id === selectedPast) || past[0];

  // keep selection honest when the list changes
  React.useEffect(() => {
    if (upcoming.length && !upcoming.some((a) => a.id === selectedUpcoming)) {
      setSelectedUpcoming(upcoming[0].id);
    }
  }, [appointments]); // eslint-disable-line

  // cancellation "in flight"
  React.useEffect(() => {
    if (!cancelling) return undefined;
    const t = setTimeout(() => {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === cancelling
            ? {
                ...a,
                group: "cancelled",
                status: "cancelled",
                note: "cancelled by you on 16 nov · slot returned to the diary",
              }
            : a,
        ),
      );
      setJustChanged(cancelling);
      setBanner({
        kind: "success",
        title: "appointment cancelled.",
        body:
          "the slot is free for other patients again, and a cancellation email is on its way to " +
          PATIENT_EMAIL +
          ".",
      });
      setCancelling(false);
    }, 700);
    return () => clearTimeout(t);
  }, [cancelling]);

  // slot freshness check
  React.useEffect(() => {
    if (slotCheck !== "checking") return undefined;
    const t = setTimeout(() => {
      setSlotCheck("fresh");
      setCheckedLabel("just now");
    }, 650);
    return () => clearTimeout(t);
  }, [slotCheck]);

  const tabs = [
    { key: "upcoming", label: "Upcoming", count: upcoming.length, wf: "i-1-0-0" },
    { key: "past", label: "Past", count: past.length, wf: "i-1-0-1" },
    { key: "cancelled", label: "Cancelled", count: cancelled.length, wf: "i-1-0-2" },
  ];

  const tabRefs = React.useRef({});
  const onTabKeyDown = (e) => {
    const idx = tabs.findIndex((t) => t.key === tab);
    let next = null;
    if (e.key === "ArrowRight") next = tabs[(idx + 1) % tabs.length];
    if (e.key === "ArrowLeft") next = tabs[(idx - 1 + tabs.length) % tabs.length];
    if (e.key === "Home") next = tabs[0];
    if (e.key === "End") next = tabs[tabs.length - 1];
    if (next) {
      e.preventDefault();
      setTab(next.key);
      const el = tabRefs.current[next.key];
      if (el) el.focus();
    }
  };

  const StatusTag = ({ status }) => {
    const tone =
      status === "confirmed"
        ? { bg: rgba(A, 0.2), icon: Icons.CheckCircle }
        : status === "completed"
          ? { bg: rgba(P, 0.1), icon: Icons.Check }
          : status === "no-show"
            ? { bg: rgba(N, 0.3), icon: Icons.AlertCircle }
            : { bg: "transparent", icon: Icons.X };
    const Ico = tone.icon;
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium whitespace-nowrap"
        style={{
          backgroundColor: tone.bg,
          color: ink,
          boxShadow: status === "cancelled" ? `inset 0 0 0 1px ${line}` : "none",
        }}
      >
        <Ico className="h-3.5 w-3.5" aria-hidden="true" />
        {STATUS_WORD[status]}
      </span>
    );
  };

  const SectionPanel = ({ children, style, className = "", ...rest }) => (
    <section
      className={"overflow-hidden " + className}
      style={{
        backgroundColor: panel,
        borderRadius: brand.radius,
        boxShadow: `0 1px 0 ${line}, 0 18px 40px -36px ${rgba(P, 0.6)}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </section>
  );

  const renderRows = (list, name, selected, onSelect) =>
    list.map((a) => {
      const isSel = selected === a.id;
      return (
        <TR
          key={a.id}
          className={justChanged === a.id ? "atrium-enter" : ""}
          style={{
            backgroundColor: isSel ? rgba(A, 0.14) : "transparent",
            borderBottom: `1px solid ${line}`,
            transition: "background-color 180ms ease",
          }}
        >
          <TD className="py-4 pl-6 pr-0 align-middle" style={{ borderBottom: "none" }}>
            <label className="flex min-h-[44px] items-center gap-2 cursor-pointer pr-2">
              <input
                type="radio"
                name={name}
                checked={isSel}
                onChange={() => onSelect(a.id)}
                className={"h-[18px] w-[18px] cursor-pointer " + focusRing}
                style={{ accentColor: A, ...ringStyle }}
              />
              <span className="sr-only">
                Select appointment with {a.doctor} on {a.dateLabel} at {a.timeLabel}
              </span>
            </label>
          </TD>
          <TD className="py-4 align-middle" style={{ borderBottom: "none" }}>
            <span className="flex items-center gap-3">
              <Avatar name={a.doctor.replace("Dr. ", "")} className="h-9 w-9 shrink-0" />
              <span className="flex flex-col">
                <span className="font-medium" style={{ color: ink }}>
                  {a.doctor}
                </span>
                <span className="text-[12px]" style={{ color: inkSoft }}>
                  ref {a.id}
                </span>
              </span>
            </span>
          </TD>
          <TD className="py-4 align-middle" style={{ borderBottom: "none", color: inkSoft }}>
            {a.specialization}
          </TD>
          <TD
            className="py-4 align-middle"
            style={{ borderBottom: "none", fontVariantNumeric: "tabular-nums" }}
          >
            <span className="flex flex-col">
              <span style={{ color: ink }}>{a.dateLabel}</span>
              <span className="text-[13px]" style={{ color: inkSoft }}>
                {a.timeLabel}
              </span>
            </span>
          </TD>
          <TD className="py-4 pr-6 align-middle" style={{ borderBottom: "none" }}>
            <span className="flex flex-col items-start gap-1.5">
              <StatusTag status={a.status} />
              {a.note ? (
                <span className="text-[12px] leading-snug" style={{ color: inkSoft }}>
                  {a.note}
                </span>
              ) : null}
              {a.recordState === "pending" ? (
                <span className="text-[12px] leading-snug" style={{ color: inkSoft }}>
                  record not filed yet
                </span>
              ) : null}
            </span>
          </TD>
        </TR>
      );
    });

  const colHeadStyle = {
    color: inkSoft,
    borderBottom: `1px solid ${line}`,
    backgroundColor: panelDeep,
  };

  const headingFont = { fontFamily: brand.fontHeading };
  const canAct = tab === "upcoming" && !!selectedUpcomingApt;

  const actionHelp = cancelling
    ? "releasing the slot and emailing the cancellation…"
    : tab === "past"
      ? "past visits can't be moved or cancelled — pick an upcoming one, or book again."
      : tab === "cancelled"
        ? "this visit is already cancelled. book another when you're ready."
        : upcoming.length === 0
          ? "nothing upcoming to change right now."
          : "cancels the appointment selected above and gives the slot back straight away.";

  return (
    <div
      className="min-h-full w-full px-5 py-10 sm:px-8 lg:px-12"
      style={{ backgroundColor: BG, color: ink, fontFamily: brand.fontBody }}
    >
      <style>{`
        @keyframes atriumRise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes atriumArch { from { opacity: 0; transform: scaleY(0.97); } to { opacity: 1; transform: none; } }
        .atrium-enter { animation: atriumRise 420ms ease-out both; }
        .atrium-panel { animation: atriumArch 320ms ease-out both; transform-origin: top center; }
        @media (prefers-reduced-motion: reduce) {
          .atrium-enter, .atrium-panel { animation: none !important; }
          * { transition-duration: 1ms !important; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-5xl">
        {/* Row 1 — page title */}
        <header className="mb-8">
          <p className="mb-3 text-[12px] uppercase tracking-[0.18em]" style={{ color: inkSoft }}>
            fernbrook clinic · patient
          </p>
          <h1
            data-wf="b-0-0"
            className="text-[34px] italic leading-tight sm:text-[40px]"
            style={headingFont}
          >
            My Appointments
          </h1>
          <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed" style={{ color: inkSoft }}>
            every visit you've booked with us, and the notes your doctor wrote afterwards. move or
            cancel an upcoming slot here — no need to call.
          </p>
        </header>

        {banner ? (
          <div
            role="status"
            className="atrium-enter mb-8 flex items-start gap-4 px-6 py-5"
            style={{
              backgroundColor: rgba(A, 0.16),
              borderRadius: brand.radius,
              color: ink,
            }}
          >
            <Icons.CheckCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-[15px] font-medium" style={headingFont}>
                {banner.title}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed" style={{ color: inkSoft }}>
                {banner.body}
              </p>
            </div>
          </div>
        ) : null}

        {/* Row 2 — tabs */}
        <div
          data-wf="b-1-0"
          role="tablist"
          aria-label="Appointment groups"
          onKeyDown={onTabKeyDown}
          className="mb-8 flex flex-wrap gap-2"
        >
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                data-wf={t.wf}
                ref={(el) => (tabRefs.current[t.key] = el)}
                role="tab"
                id={"tab-" + t.key}
                aria-selected={active}
                aria-controls={"panel-" + t.key}
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(t.key)}
                className={
                  "inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-[15px] " +
                  focusRing
                }
                style={{
                  backgroundColor: active ? P : rgba(P, 0.06),
                  color: active ? BG : ink,
                  ...ringStyle,
                }}
              >
                <span>{t.label}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[12px]"
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    backgroundColor: active ? rgba(A, 0.55) : rgba(P, 0.1),
                    color: active ? BG : ink,
                  }}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 3 — primary table (upcoming / cancelled) */}
        {tab !== "past" ? (
          <SectionPanel
            data-wf="b-2-0"
            className="atrium-panel mb-6"
            id={"panel-" + tab}
            role="tabpanel"
            aria-labelledby={"tab-" + tab}
          >
            <div className="flex flex-wrap items-end justify-between gap-4 px-6 pt-7 pb-5">
              <div>
                <h2 className="text-[22px] italic" style={headingFont}>
                  {tab === "upcoming" ? "Upcoming appointments" : "Cancelled appointments"}
                </h2>
                <p className="mt-1 text-[13px]" style={{ color: inkSoft }}>
                  {tab === "upcoming"
                    ? "choose one to move it or give the slot back."
                    : "these slots were released and are bookable by anyone."}
                </p>
              </div>
              {tab === "upcoming" && upcoming.length > 0 ? (
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"
                    style={{ backgroundColor: rgba(P, 0.07), color: inkSoft }}
                  >
                    <Icons.Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {slotCheck === "checking"
                      ? "checking the diary…"
                      : "slots checked " + checkedLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSlotCheck("checking")}
                    disabled={slotCheck === "checking"}
                    className={
                      "min-h-[44px] rounded-full px-4 text-[13px] underline underline-offset-4 disabled:opacity-50 " +
                      focusRing
                    }
                    style={{ color: ink, ...ringStyle }}
                  >
                    check again
                  </button>
                </div>
              ) : null}
            </div>

            {(tab === "upcoming" ? upcoming : cancelled).length === 0 ? (
              <div className="px-6 pb-8">
                <Empty
                  title={tab === "upcoming" ? "nothing on the calendar" : "no cancelled visits"}
                  description={
                    tab === "upcoming"
                      ? "you have no upcoming visits. search by a symptom, a condition or a specialization and we'll show you who's free this week."
                      : "you haven't cancelled anything. if plans change, you can release a slot right up to the day before."
                  }
                  action={
                    tab === "upcoming" ? (
                      <Button
                        onClick={() => navigate("find-a-doctor")}
                        className={"min-h-[44px] rounded-full px-6 " + focusRing}
                        style={{ backgroundColor: P, color: BG, ...ringStyle }}
                      >
                        Find a doctor
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <Table className="w-full" style={{ fontVariantNumeric: "tabular-nums" }}>
                <THead>
                  <TR>
                    <TH
                      className="py-3 pl-6 pr-0 text-left text-[12px] uppercase tracking-[0.14em]"
                      style={colHeadStyle}
                    >
                      <span className="sr-only">Select</span>
                    </TH>
                    <TH
                      data-wf="i-2-0-0"
                      className="py-3 text-left text-[12px] uppercase tracking-[0.14em]"
                      style={colHeadStyle}
                    >
                      Doctor
                    </TH>
                    <TH
                      data-wf="i-2-0-1"
                      className="py-3 text-left text-[12px] uppercase tracking-[0.14em]"
                      style={colHeadStyle}
                    >
                      Specialization
                    </TH>
                    <TH
                      data-wf="i-2-0-2"
                      className="py-3 text-left text-[12px] uppercase tracking-[0.14em]"
                      style={colHeadStyle}
                    >
                      Date &amp; time
                    </TH>
                    <TH
                      data-wf="i-2-0-3"
                      className="py-3 pr-6 text-left text-[12px] uppercase tracking-[0.14em]"
                      style={colHeadStyle}
                    >
                      Status
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {tab === "upcoming"
                    ? renderRows(
                        upcoming,
                        "upcoming-appointment",
                        selectedUpcoming,
                        setSelectedUpcoming,
                      )
                    : renderRows(cancelled, "cancelled-appointment", "", () => {})}
                </TBody>
              </Table>
            )}
          </SectionPanel>
        ) : null}

        {/* Row 4 — actions */}
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Button
              data-wf="b-3-0"
              disabled={!canAct}
              onClick={() => navigate("find-a-doctor")}
              aria-describedby="action-help"
              className={
                "w-full min-h-[52px] rounded-full px-6 text-[16px] font-medium disabled:opacity-45 " +
                focusRing
              }
              style={{
                backgroundColor: A,
                color: P,
                boxShadow: canAct ? `0 14px 28px -20px ${rgba(P, 0.9)}` : "none",
                ...ringStyle,
              }}
            >
              Reschedule
            </Button>
            <span className="px-2 text-[12px]" style={{ color: inkSoft }}>
              pick a new slot — the old one is released only once the new one is held.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              data-wf="b-3-1"
              disabled={!canAct || !!cancelling}
              onClick={() => selectedUpcomingApt && setCancelling(selectedUpcomingApt.id)}
              aria-describedby="action-help"
              className={
                "w-full min-h-[52px] rounded-full px-6 text-[16px] disabled:opacity-45 " + focusRing
              }
              style={{
                backgroundColor: "transparent",
                color: ink,
                boxShadow: `inset 0 0 0 1px ${rgba(P, 0.35)}`,
                ...ringStyle,
              }}
            >
              Cancel appointment
            </Button>
            <span
              id="action-help"
              aria-live="polite"
              className="px-2 text-[12px]"
              style={{ color: inkSoft }}
            >
              {actionHelp}
            </span>
          </div>

          <div className="flex flex-col items-start justify-start gap-2 md:items-end">
            <button
              type="button"
              data-wf="b-3-2"
              onClick={() => navigate("find-a-doctor")}
              className={
                "inline-flex min-h-[52px] items-center gap-2 rounded-full px-4 text-[16px] underline underline-offset-[6px] " +
                focusRing
              }
              style={{ color: ink, textDecorationColor: A, ...ringStyle }}
            >
              Book another appointment
              <Icons.ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="px-4 text-[12px] md:text-right" style={{ color: inkSoft }}>
              search by symptom, condition or specialization.
            </span>
          </div>
        </div>

        {/* Row 5 — past appointments */}
        {tab === "past" ? (
          <SectionPanel
            data-wf="b-4-0"
            className="atrium-panel mb-8"
            id="panel-past"
            role="tabpanel"
            aria-labelledby="tab-past"
          >
            <div className="px-6 pt-7 pb-5">
              <h2 className="text-[22px] italic" style={headingFont}>
                Past appointments
              </h2>
              <p className="mt-1 text-[13px]" style={{ color: inkSoft }}>
                select a visit to read its consultation record below.
              </p>
            </div>
            <Table className="w-full" style={{ fontVariantNumeric: "tabular-nums" }}>
              <THead>
                <TR>
                  <TH
                    className="py-3 pl-6 pr-0 text-left text-[12px] uppercase tracking-[0.14em]"
                    style={colHeadStyle}
                  >
                    <span className="sr-only">Select</span>
                  </TH>
                  <TH
                    data-wf="i-4-0-0"
                    className="py-3 text-left text-[12px] uppercase tracking-[0.14em]"
                    style={colHeadStyle}
                  >
                    Doctor
                  </TH>
                  <TH
                    data-wf="i-4-0-1"
                    className="py-3 text-left text-[12px] uppercase tracking-[0.14em]"
                    style={colHeadStyle}
                  >
                    Specialization
                  </TH>
                  <TH
                    data-wf="i-4-0-2"
                    className="py-3 text-left text-[12px] uppercase tracking-[0.14em]"
                    style={colHeadStyle}
                  >
                    Date &amp; time
                  </TH>
                  <TH
                    data-wf="i-4-0-3"
                    className="py-3 pr-6 text-left text-[12px] uppercase tracking-[0.14em]"
                    style={colHeadStyle}
                  >
                    Status
                  </TH>
                </TR>
              </THead>
              <TBody>{renderRows(past, "past-appointment", selectedPast, setSelectedPast)}</TBody>
            </Table>
          </SectionPanel>
        ) : null}

        {/* Row 6 — consultation record card */}
        {tab === "past" && selectedPastApt ? (
          <Card
            data-wf="b-5-0"
            className="atrium-panel overflow-hidden border-0"
            style={{
              backgroundColor: rgba(P, 0.07),
              borderTopLeftRadius: "220px",
              borderTopRightRadius: "220px",
              borderBottomLeftRadius: brand.radius,
              borderBottomRightRadius: brand.radius,
              boxShadow: "none",
            }}
          >
            <CardHeader className="px-8 pt-12 pb-4 text-center sm:px-14">
              <span
                aria-hidden="true"
                className="mx-auto mb-5 block h-10 w-[1px]"
                style={{ backgroundColor: rgba(P, 0.3) }}
              />
              <CardTitle
                className="text-[22px] italic leading-snug sm:text-[26px]"
                style={headingFont}
              >
                Consultation record — {selectedPastApt.doctor} ·{" "}
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {selectedPastApt.dateLabel.replace(/^\w{3}\s/, "")},{" "}
                  {selectedPastApt.timeLabel.split(" – ")[0]}
                </span>
              </CardTitle>
              <CardDescription className="mt-2 text-[14px]" style={{ color: inkSoft }}>
                {selectedPastApt.specialization} · ref {selectedPastApt.id} ·{" "}
                {selectedPastApt.record ? selectedPastApt.record.updatedAt : "no record on file"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 sm:px-14">
              <p
                className="mx-auto max-w-[58ch] text-center text-[13px] leading-relaxed"
                style={{ color: inkSoft }}
              >
                only you, {selectedPastApt.doctor} and clinic administrators can open this record.
                every time it is viewed, the clinic's audit log notes it.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Row 7 — record body text */}
        {tab === "past" && selectedPastApt ? (
          <div
            data-wf="b-6-0"
            className="atrium-panel mt-4 px-8 py-8 sm:px-14"
            style={{ backgroundColor: panel, borderRadius: brand.radius }}
          >
            {selectedPastApt.record ? (
              <dl className="mx-auto max-w-[70ch] space-y-6">
                {[
                  ["Diagnosis", selectedPastApt.record.diagnosis],
                  ["Notes", selectedPastApt.record.notes],
                  ["Prescription", selectedPastApt.record.prescription],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt
                      className="mb-1.5 text-[12px] uppercase tracking-[0.16em]"
                      style={{ color: inkSoft }}
                    >
                      {k}
                    </dt>
                    <dd
                      className="text-[16px] leading-relaxed"
                      style={{ color: ink, fontVariantNumeric: "tabular-nums" }}
                    >
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : selectedPastApt.recordState === "no-visit" ? (
              <div className="mx-auto max-w-[62ch] text-center">
                <Icons.AlertCircle
                  className="mx-auto mb-3 h-6 w-6"
                  aria-hidden="true"
                  style={{ color: ink }}
                />
                <p className="text-[17px] italic" style={headingFont}>
                  no consultation took place
                </p>
                <p className="mt-2 text-[15px] leading-relaxed" style={{ color: inkSoft }}>
                  the clinic marked this visit as a no-show on 09 oct 2026, so there is nothing to
                  record. you can book again whenever you're ready.
                </p>
              </div>
            ) : (
              <div className="mx-auto max-w-[62ch] text-center">
                <Icons.FileText
                  className="mx-auto mb-3 h-6 w-6"
                  aria-hidden="true"
                  style={{ color: ink }}
                />
                <p className="text-[17px] italic" style={headingFont}>
                  {selectedPastApt.doctor} hasn't filed this record yet
                </p>
                <p className="mt-2 text-[15px] leading-relaxed" style={{ color: inkSoft }}>
                  notes usually appear within two working days of a visit. if it's been longer, call
                  the front desk on {CLINIC_PHONE}.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Row 8 — email notice */}
        <div
          data-wf="b-7-0"
          className="mt-10 flex flex-col gap-4 px-7 py-7 sm:flex-row sm:items-start sm:gap-6"
          style={{ backgroundColor: rgba(N, 0.18), borderRadius: brand.radius }}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: rgba(P, 0.1) }}
          >
            <Icons.Bell className="h-5 w-5" aria-hidden="true" style={{ color: ink }} />
          </span>
          <div className="max-w-[70ch]">
            <p className="text-[15px] leading-relaxed" style={{ color: ink }}>
              Confirmation, reschedule and cancellation emails, plus a reminder 24 hours before your
              visit, are sent to your registered email address.
            </p>
            <ul
              className="mt-4 space-y-2 text-[13px]"
              style={{ color: inkSoft, fontVariantNumeric: "tabular-nums" }}
            >
              <li className="flex items-center gap-2">
                <Icons.Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                confirmation sent to {PATIENT_EMAIL} on 29 oct 2026, 18:02
              </li>
              <li className="flex items-center gap-2">
                <Icons.Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                next reminder: tue 17 nov 2026, 09:15 — before dr. priya menon
              </li>
            </ul>
            <button
              type="button"
              onClick={() => navigate("my-account")}
              className={
                "mt-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-full text-[13px] underline underline-offset-4 " +
                focusRing
              }
              style={{ color: ink, textDecorationColor: A, ...ringStyle }}
            >
              change where these emails go
              <Icons.ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
