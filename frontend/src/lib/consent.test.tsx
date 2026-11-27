import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConsentDialog, useConsentGate } from "./consent";
import { clearSessionToken, setSessionToken } from "@/lib/api";

function stubFetch(handler: (url: string, init?: RequestInit) => Promise<Response> | Response) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => handler(String(url), init)),
  );
}

function Harness({ initialConsented = false }: { initialConsented?: boolean }) {
  const gate = useConsentGate(initialConsented);
  const [ran, setRan] = React.useState(0);
  return (
    <div>
      <button type="button" onClick={() => gate.requireConsent(() => setRan((n) => n + 1))}>
        save health data
      </button>
      <p>ran: {ran}</p>
      <ConsentDialog gate={gate} />
    </div>
  );
}

beforeEach(() => {
  setSessionToken("tok-patient");
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearSessionToken();
});

describe("useConsentGate / ConsentDialog", () => {
  it("[AC-016] asks for consent and does not run the action until it is given", async () => {
    stubFetch(() => {
      throw new Error("POST /me/consent should not be called before the patient accepts");
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "save health data" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/we need your consent/i)).toBeInTheDocument();
    expect(screen.getByText("ran: 0")).toBeInTheDocument();
  });

  it("[AC-016] declining closes the prompt and never runs the blocked action", async () => {
    stubFetch(() => {
      throw new Error("POST /me/consent should not be called when the patient declines");
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "save health data" }));
    await user.click(screen.getByRole("button", { name: "Not now" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("ran: 0")).toBeInTheDocument();
  });

  it("[AC-017] accepting calls POST /me/consent with accepted true, then runs the blocked action", async () => {
    let captured: { url: string; body: unknown } | null = null;
    stubFetch((url, init) => {
      if (url.endsWith("/me/consent") && init?.method === "POST") {
        captured = { url, body: JSON.parse(String(init.body)) };
        return new Response(
          JSON.stringify({ consented: true, consented_at: "2026-11-27T10:04:00Z" }),
          { status: 201 },
        );
      }
      throw new Error(`unexpected request to ${url}`);
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "save health data" }));
    await user.click(screen.getByRole("button", { name: "I consent" }));

    expect(await screen.findByText("ran: 1")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(captured).toEqual({ url: "http://localhost:8000/me/consent", body: { accepted: true } });
  });

  it("[AC-016] once consent is already given, the action runs immediately without asking again", async () => {
    stubFetch(() => {
      throw new Error("POST /me/consent should not be called when consent was already given");
    });
    const user = userEvent.setup();
    render(<Harness initialConsented />);

    await user.click(screen.getByRole("button", { name: "save health data" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("ran: 1")).toBeInTheDocument();
  });

  it("[AC-017] a failed POST /me/consent shows an error and keeps the action blocked", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/me/consent") && init?.method === "POST") {
        return new Response(JSON.stringify({ detail: "boom" }), { status: 500 });
      }
      throw new Error(`unexpected request to ${url}`);
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "save health data" }));
    await user.click(screen.getByRole("button", { name: "I consent" }));

    expect(
      await screen.findByText("we could not record your consent — please try again."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("ran: 0")).toBeInTheDocument();
  });
});
