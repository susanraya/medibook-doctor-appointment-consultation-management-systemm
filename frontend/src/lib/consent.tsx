// Reusable consent gate for US-006 (patient consent capture).
//
// A patient must be asked for, and give, consent to the clinic storing and
// processing their health data before they can book an appointment or save
// consultation-related data (AC-016). Accepting calls POST /me/consent, which
// the API stores with an audit timestamp (AC-017).
//
// `useConsentGate` is the shared logic: a screen with its own inline consent
// affordance (Find a Doctor) can read `hasConsented` / `submitting` / `error`
// and call `giveConsentNow` directly; a screen with no affordance of its own
// (My Account) can call `requireConsent(action)` and render `<ConsentDialog>`,
// which blocks `action` until the patient accepts.
import * as React from "react";

import * as UI from "@/lib/ui";
import { giveConsent } from "@/lib/api";

const { Button } = UI;

export interface ConsentGate {
  /** Whether this patient has already given consent in this session. */
  hasConsented: boolean;
  /** The server's audit timestamp for the recorded consent, once given. */
  consentedAt: string | null;
  /** True while POST /me/consent is in flight. */
  submitting: boolean;
  /** Set when POST /me/consent fails; cleared on the next attempt. */
  error: string;
  /** Whether the blocking prompt should be shown (for `ConsentDialog`). */
  promptOpen: boolean;
  /** Calls POST /me/consent and records the result. Throws on failure. */
  giveConsentNow: () => Promise<void>;
  /**
   * Runs `action` now if consent is already given; otherwise opens the
   * prompt and runs `action` only once the patient accepts (AC-016).
   */
  requireConsent: (action: () => void) => void;
  /** Accepts the open prompt: records consent, then runs the pending action. */
  accept: () => void;
  /** Dismisses the open prompt without running the pending action. */
  decline: () => void;
}

export function useConsentGate(initialConsented = false): ConsentGate {
  const [hasConsented, setHasConsented] = React.useState(initialConsented);
  const [consentedAt, setConsentedAt] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [promptOpen, setPromptOpen] = React.useState(false);
  const pendingAction = React.useRef<(() => void) | null>(null);

  const giveConsentNow = React.useCallback(async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await giveConsent();
      setHasConsented(true);
      setConsentedAt(res.consented_at);
    } catch {
      setError("we could not record your consent — please try again.");
      throw new Error("consent not recorded");
    } finally {
      setSubmitting(false);
    }
  }, []);

  const requireConsent = React.useCallback(
    (action: () => void) => {
      if (hasConsented) {
        action();
        return;
      }
      pendingAction.current = action;
      setError("");
      setPromptOpen(true);
    },
    [hasConsented],
  );

  const accept = React.useCallback(() => {
    void giveConsentNow()
      .then(() => {
        setPromptOpen(false);
        const action = pendingAction.current;
        pendingAction.current = null;
        if (action) action();
      })
      .catch(() => {
        // error already recorded by giveConsentNow; keep the prompt open.
      });
  }, [giveConsentNow]);

  const decline = React.useCallback(() => {
    pendingAction.current = null;
    setPromptOpen(false);
    setError("");
  }, []);

  return {
    hasConsented,
    consentedAt,
    submitting,
    error,
    promptOpen,
    giveConsentNow,
    requireConsent,
    accept,
    decline,
  };
}

export function ConsentDialog({ gate }: { gate: ConsentGate }) {
  if (!gate.promptOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) gate.decline();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-dialog-title"
        aria-describedby="consent-dialog-body"
        className="w-full max-w-md rounded-[var(--brand-radius)] bg-white p-6 shadow-lg"
      >
        <h2 id="consent-dialog-title" className="text-base font-semibold text-slate-900">
          We need your consent
        </h2>
        <p id="consent-dialog-body" className="mt-2 text-sm text-slate-600">
          Before you can book an appointment or save consultation-related data, please give your
          consent to the clinic storing and processing your health data. You cannot proceed until
          you accept.
        </p>
        {gate.error ? (
          <p role="alert" className="mt-3 text-sm font-medium text-red-700">
            {gate.error}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={gate.decline}
            disabled={gate.submitting}
          >
            Not now
          </Button>
          <Button type="button" onClick={gate.accept} disabled={gate.submitting}>
            {gate.submitting ? "Recording your consent…" : "I consent"}
          </Button>
        </div>
      </div>
    </div>
  );
}
