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

  it("[AC-014] saving valid name, email and phone calls PUT /me/profile and shows the save confirmation", async () => {
    stubFetch((url, init) => {
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
      await screen.findByText(/saved\. your profile is live for patients/),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Pat T. Patient")).toBeInTheDocument();
  });

  it("[AC-015] a 409 on save shows the taken-email message, keeps the typed email and saves nothing", async () => {
    stubFetch((url, init) => {
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
    expect(
      await screen.findByText("That email is already in use by another account."),
    ).toBeInTheDocument();
    expect(email).toHaveValue("taken@example.com");
  });

  it("[AC-015] a 422 on save maps the email message onto the email field", async () => {
    stubFetch((url, init) => {
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
    expect(await screen.findByText("that email looks invalid")).toBeInTheDocument();
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
