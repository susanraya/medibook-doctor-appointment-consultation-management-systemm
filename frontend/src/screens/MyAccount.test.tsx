import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Screen from "./MyAccount";
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

function consentOk(url: string, init?: RequestInit): Response | null {
  if (url.endsWith("/me/consent") && init?.method === "POST") {
    return new Response(JSON.stringify({ consented: true, consented_at: "2026-11-27T10:04:00Z" }), {
      status: 201,
    });
  }
  return null;
}

async function acceptConsentPrompt(user: ReturnType<typeof userEvent.setup>) {
  expect(await screen.findByRole("dialog")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "I consent" }));
}

const patientProfile = (overrides: Record<string, unknown> = {}) => ({
  id: "u-9",
  full_name: "Pat Patient",
  email: "pat@example.com",
  phone: "+44 7700 900123",
  role: "patient",
  ...overrides,
});

beforeEach(() => {
  setSessionToken("tok-patient");
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearSessionToken();
});

describe("MyAccount", () => {
  it("[AC-014] shows a loading state then the signed-in patient's name, email and phone from GET /me/profile", async () => {
    stubFetch((url) => {
      if (url.endsWith("/me/profile")) {
        return new Response(JSON.stringify(patientProfile()), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    renderScreen();
    expect(screen.getByText("Loading your profile…")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Pat Patient")).toBeInTheDocument();
    expect(screen.getByDisplayValue("pat@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+44 7700 900123")).toBeInTheDocument();
  });

  it("[AC-014] client-side validation blocks submitting an empty name without calling the API", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/me/profile") && (!init || init.method === undefined)) {
        return new Response(JSON.stringify(patientProfile()), { status: 200 });
      }
      throw new Error("PUT /me/profile should not be called when the form is invalid");
    });
    const user = userEvent.setup();
    renderScreen();
    const name = await screen.findByLabelText("full name");
    await user.clear(name);
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("tell us the name the clinic should use.")).toBeInTheDocument();
  });

  it("[AC-016][AC-017] saving valid details asks for consent first, then calls POST /me/consent and PUT /me/profile", async () => {
    stubFetch((url, init) => {
      const consent = consentOk(url, init);
      if (consent) return consent;
      if (url.endsWith("/me/profile") && (!init || init.method === undefined)) {
        return new Response(JSON.stringify(patientProfile()), { status: 200 });
      }
      if (url.endsWith("/me/profile") && init?.method === "PUT") {
        const body = JSON.parse(String(init.body));
        expect(body).toEqual({
          full_name: "Pat T. Patient",
          email: "pat@example.com",
          phone: "+44 7700 900123",
        });
        return new Response(JSON.stringify(patientProfile({ full_name: "Pat T. Patient" })), {
          status: 200,
        });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    renderScreen();
    const name = await screen.findByLabelText("full name");
    await user.clear(name);
    await user.type(name, "Pat T. Patient");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText(/please give your consent to the clinic storing/),
    ).toBeInTheDocument();
    await acceptConsentPrompt(user);

    expect(
      await screen.findByText(/saved\. your profile is live for patients/),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Pat T. Patient")).toBeInTheDocument();
  });

  it("[AC-016] declining the consent prompt cancels the save: nothing is sent to PUT /me/profile", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/me/profile") && (!init || init.method === undefined)) {
        return new Response(JSON.stringify(patientProfile()), { status: 200 });
      }
      throw new Error("no other request should be made when the patient declines consent");
    });
    const user = userEvent.setup();
    renderScreen();
    const name = await screen.findByLabelText("full name");
    await user.clear(name);
    await user.type(name, "Pat T. Patient");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Not now" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText(/saved\. your profile is live for patients/)).not.toBeInTheDocument();
  });

  it("[AC-015] a 409 on save (after accepting consent) shows the taken-email message, keeps the typed email and saves nothing", async () => {
    stubFetch((url, init) => {
      const consent = consentOk(url, init);
      if (consent) return consent;
      if (url.endsWith("/me/profile") && (!init || init.method === undefined)) {
        return new Response(JSON.stringify(patientProfile()), { status: 200 });
      }
      if (url.endsWith("/me/profile") && init?.method === "PUT") {
        return new Response(JSON.stringify({ detail: "That email is already in use" }), {
          status: 409,
        });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    renderScreen();
    const email = await screen.findByLabelText("email");
    await user.clear(email);
    await user.type(email, "taken@example.com");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await acceptConsentPrompt(user);

    expect(
      await screen.findByText("That email is already in use by another account."),
    ).toBeInTheDocument();
    expect(email).toHaveValue("taken@example.com");
  });

  it("[AC-015] a 422 on save (after accepting consent) maps the email message onto the email field", async () => {
    stubFetch((url, init) => {
      const consent = consentOk(url, init);
      if (consent) return consent;
      if (url.endsWith("/me/profile") && (!init || init.method === undefined)) {
        return new Response(JSON.stringify(patientProfile()), { status: 200 });
      }
      if (url.endsWith("/me/profile") && init?.method === "PUT") {
        return new Response(
          JSON.stringify({ detail: [{ field: "email", message: "that email looks invalid" }] }),
          { status: 422 },
        );
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    renderScreen();
    const email = await screen.findByLabelText("email");
    await user.clear(email);
    await user.type(email, "weird@example.com");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await acceptConsentPrompt(user);

    expect(await screen.findByText("that email looks invalid")).toBeInTheDocument();
  });

  it("[AC-016] once consent is given, saving again does not ask a second time", async () => {
    const consentCalls: string[] = [];
    stubFetch((url, init) => {
      if (url.endsWith("/me/consent") && init?.method === "POST") {
        consentCalls.push(url);
        return new Response(
          JSON.stringify({ consented: true, consented_at: "2026-11-27T10:04:00Z" }),
          { status: 201 },
        );
      }
      if (url.endsWith("/me/profile") && (!init || init.method === undefined)) {
        return new Response(JSON.stringify(patientProfile()), { status: 200 });
      }
      if (url.endsWith("/me/profile") && init?.method === "PUT") {
        return new Response(JSON.stringify(patientProfile()), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    renderScreen();
    const phone = await screen.findByLabelText("phone");

    await user.clear(phone);
    await user.type(phone, "+44 7700 900999");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await acceptConsentPrompt(user);
    await screen.findByText(/saved\. your profile is live for patients/);

    await user.clear(phone);
    await user.type(phone, "+44 7700 900111");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await screen.findByText(/saved\. your profile is live for patients/);
    expect(consentCalls).toHaveLength(1);
  });

  it("shows an error state when the profile fails to load", async () => {
    stubFetch((url) => {
      if (url.endsWith("/me/profile")) {
        return new Response(JSON.stringify({ detail: "boom" }), { status: 500 });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    renderScreen();
    expect(
      await screen.findByText("We could not load your profile. Please try again."),
    ).toBeInTheDocument();
  });
});
