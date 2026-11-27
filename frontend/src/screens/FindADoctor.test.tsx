import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Screen from "./FindADoctor";
import { clearSessionToken, setSessionToken } from "@/lib/api";

function renderScreen() {
  return render(
    <MemoryRouter>
      <Screen />
    </MemoryRouter>,
  );
}

function stubFetch(handler: (url: string, init?: RequestInit) => Promise<Response> | Response) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => handler(String(url), init)),
  );
}

beforeEach(() => {
  setSessionToken("tok-patient");
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearSessionToken();
});

async function openFirstBookingModal(user: ReturnType<typeof userEvent.setup>) {
  const [slotButton] = await screen.findAllByRole("button", { name: "Book this slot" });
  await user.click(slotButton);
  expect(await screen.findByRole("heading", { name: "Confirm booking" })).toBeInTheDocument();
}

describe("FindADoctor", () => {
  it("[AC-016] cannot proceed without checking consent, and never calls the consent endpoint", async () => {
    stubFetch(() => {
      throw new Error("no request should be made before the patient accepts consent");
    });
    const user = userEvent.setup();
    renderScreen();

    await openFirstBookingModal(user);
    await user.click(screen.getByRole("button", { name: "Confirm booking" }));

    expect(
      await screen.findByText("we need your consent before the clinic can hold a slot for you."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm booking" })).toBeInTheDocument();
  });

  it("[AC-016][AC-017] checking consent and confirming calls POST /me/consent, then books the slot", async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    stubFetch((url, init) => {
      if (url.endsWith("/me/consent") && init?.method === "POST") {
        calls.push({ url, body: JSON.parse(String(init.body)) });
        return new Response(
          JSON.stringify({ consented: true, consented_at: "2026-11-27T10:04:00Z" }),
          { status: 201 },
        );
      }
      throw new Error(`unexpected request to ${url}`);
    });
    const user = userEvent.setup();
    renderScreen();

    await openFirstBookingModal(user);
    await user.click(
      screen.getByLabelText("I consent to the clinic storing and processing my health data"),
    );
    await user.click(screen.getByRole("button", { name: "Confirm booking" }));

    expect(await screen.findByText("slot reserved — see you then")).toBeInTheDocument();
    expect(calls).toEqual([{ url: "http://localhost:8000/me/consent", body: { accepted: true } }]);
    expect(
      screen.getByText("consent recorded — thank you, we won't ask again."),
    ).toBeInTheDocument();

    // Closing and booking a second slot must not ask for consent again (AC-016).
    await user.click(screen.getByRole("button", { name: "Close booking confirmation" }));
    const remaining = await screen.findAllByRole("button", { name: "Book this slot" });
    await user.click(remaining[0]);
    await user.click(await screen.findByRole("button", { name: "Confirm booking" }));

    expect(await screen.findByText("slot reserved — see you then")).toBeInTheDocument();
    expect(calls).toHaveLength(1);
  });

  it("[AC-017] a failed POST /me/consent shows an error and the booking does not proceed", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/me/consent") && init?.method === "POST") {
        return new Response(JSON.stringify({ detail: "boom" }), { status: 500 });
      }
      throw new Error(`unexpected request to ${url}`);
    });
    const user = userEvent.setup();
    renderScreen();

    await openFirstBookingModal(user);
    await user.click(
      screen.getByLabelText("I consent to the clinic storing and processing my health data"),
    );
    await user.click(screen.getByRole("button", { name: "Confirm booking" }));

    expect(
      await screen.findByText("we could not record your consent — please try again."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm booking" })).toBeInTheDocument();
    expect(screen.queryByText("slot reserved — see you then")).not.toBeInTheDocument();
  });
});
