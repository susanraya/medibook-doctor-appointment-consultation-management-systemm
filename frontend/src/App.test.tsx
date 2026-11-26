import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { clearSessionToken, setSessionToken } from "@/lib/api";

function stubMe(user: {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: "patient" | "doctor" | "admin";
  is_active: boolean;
}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url).endsWith("/auth/me")) {
        return new Response(JSON.stringify(user), { status: 200 });
      }
      if (String(url).endsWith("/auth/logout")) {
        return new Response(null, { status: 204 });
      }
      void init;
      return new Response(JSON.stringify({}), { status: 404 });
    }),
  );
}

describe("App", () => {
  beforeEach(() => {
    setSessionToken("test-token");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearSessionToken();
  });

  it("renders a screen inside the app shell and shows its menu", async () => {
    stubMe({
      id: "u1",
      full_name: "Pat Patient",
      email: "pat@example.com",
      phone: "12345678",
      role: "patient",
      is_active: true,
    });
    render(
      <MemoryRouter initialEntries={["/find-a-doctor"]}>
        <App />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getAllByText("Find a Doctor").length).toBeGreaterThan(0));
  });

  it("[AC-011][AC-012] redirects a patient opening a doctor route and shows the role notice", async () => {
    stubMe({
      id: "u1",
      full_name: "Pat Patient",
      email: "pat@example.com",
      phone: "12345678",
      role: "patient",
      is_active: true,
    });
    render(
      <MemoryRouter initialEntries={["/doctor-workspace"]}>
        <App />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("not available for your role"),
    );
    expect(screen.getAllByText("Find a Doctor").length).toBeGreaterThan(0);
  });

  it("[AC-006] sign-out clears the token and returns to sign-in", async () => {
    stubMe({
      id: "u1",
      full_name: "Pat Patient",
      email: "pat@example.com",
      phone: "12345678",
      role: "patient",
      is_active: true,
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/find-a-doctor"]}>
        <App />
      </MemoryRouter>,
    );
    const signOut = await screen.findByRole("button", { name: "Sign out" });
    await user.click(signOut);
    await waitFor(() =>
      expect(screen.getByRole("tablist", { name: "Sign in or register" })).toBeInTheDocument(),
    );
    const { getSessionToken } = await import("@/lib/api");
    expect(getSessionToken()).toBeNull();
  });
});
