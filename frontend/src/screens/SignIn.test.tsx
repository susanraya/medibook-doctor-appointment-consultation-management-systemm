import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SignIn from "./SignIn";
import { AuthProvider } from "@/lib/auth";
import { clearSessionToken, getSessionToken } from "@/lib/api";

function renderSignIn() {
  return render(
    <MemoryRouter initialEntries={["/sign-in"]}>
      <AuthProvider>
        <SignIn />
      </AuthProvider>
    </MemoryRouter>,
  );
}

function stubFetch(handler: (url: string, init?: RequestInit) => Promise<Response> | Response) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url).endsWith("/auth/me")) {
        return new Response(JSON.stringify({ detail: "Not authenticated" }), { status: 401 });
      }
      return handler(String(url), init);
    }),
  );
}

function field(container: HTMLElement, id: string): HTMLInputElement {
  const el = container.querySelector(`#${id}`);
  if (!el) throw new Error(`missing field #${id}`);
  return el as HTMLInputElement;
}

describe("SignIn", () => {
  beforeEach(() => {
    clearSessionToken();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    clearSessionToken();
  });

  it("[AC-001] submitting the register tab with valid data registers and stores the token", async () => {
    stubFetch((url) => {
      if (url.endsWith("/auth/register")) {
        return new Response(
          JSON.stringify({
            token: "tok-register",
            user: {
              id: "u1",
              full_name: "Jane Doe",
              email: "jane@example.com",
              phone: "01234567",
              role: "patient",
              is_active: true,
            },
          }),
          { status: 201 },
        );
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    const { container } = renderSignIn();
    await user.click(screen.getByRole("tab", { name: "Register as a patient" }));
    await user.type(field(container, "reg-full-name"), "Jane Doe");
    await user.type(field(container, "reg-email"), "jane@example.com");
    await user.type(field(container, "reg-phone"), "01234567");
    await user.type(field(container, "reg-password"), "password123");
    await user.type(field(container, "reg-confirm"), "password123");
    await user.click(screen.getByRole("button", { name: "Register" }));
    await waitFor(() => expect(getSessionToken()).toBe("tok-register"));
  });

  it("[AC-002] a 409 on register shows the duplicate-email message on the email field and keeps form data", async () => {
    stubFetch((url) => {
      if (url.endsWith("/auth/register")) {
        return new Response(JSON.stringify({ detail: "That email is already in use" }), {
          status: 409,
        });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    const { container } = renderSignIn();
    await user.click(screen.getByRole("tab", { name: "Register as a patient" }));
    await user.type(field(container, "reg-full-name"), "Jane Doe");
    await user.type(field(container, "reg-email"), "jane@example.com");
    await user.type(field(container, "reg-phone"), "01234567");
    await user.type(field(container, "reg-password"), "password123");
    await user.type(field(container, "reg-confirm"), "password123");
    await user.click(screen.getByRole("button", { name: "Register" }));
    await waitFor(() =>
      expect(screen.getByText("that email is already in use")).toBeInTheDocument(),
    );
    expect(field(container, "reg-email")).toHaveValue("jane@example.com");
  });

  it("[AC-003] client-side validation blocks an empty register submission", async () => {
    stubFetch(() => new Response(JSON.stringify({}), { status: 404 }));
    const user = userEvent.setup();
    renderSignIn();
    await user.click(screen.getByRole("tab", { name: "Register as a patient" }));
    await user.click(screen.getByRole("button", { name: "Register" }));
    expect(
      await screen.findByText("we need a name to put on your appointments"),
    ).toBeInTheDocument();
    expect(getSessionToken()).toBeNull();
  });

  it("[AC-003] a 422 on register maps each field, message onto the matching input", async () => {
    stubFetch((url) => {
      if (url.endsWith("/auth/register")) {
        return new Response(
          JSON.stringify({
            detail: [{ field: "phone", message: "that phone number looks invalid" }],
          }),
          { status: 422 },
        );
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    const { container } = renderSignIn();
    await user.click(screen.getByRole("tab", { name: "Register as a patient" }));
    await user.type(field(container, "reg-full-name"), "Jane Doe");
    await user.type(field(container, "reg-email"), "jane@example.com");
    await user.type(field(container, "reg-phone"), "01234567");
    await user.type(field(container, "reg-password"), "password123");
    await user.type(field(container, "reg-confirm"), "password123");
    await user.click(screen.getByRole("button", { name: "Register" }));
    await waitFor(() =>
      expect(screen.getByText("that phone number looks invalid")).toBeInTheDocument(),
    );
  });

  it("the first-login flow stores the token and routes to the role dashboard on 200", async () => {
    stubFetch((url) => {
      if (url.endsWith("/auth/first-login-password")) {
        return new Response(
          JSON.stringify({
            token: "tok-first-login-set",
            user: {
              id: "u9",
              full_name: "Dr. Imogen Hartley",
              email: "i.hartley@meadowlane.health",
              phone: "01234567",
              role: "doctor",
              is_active: true,
            },
          }),
          { status: 200 },
        );
      }
      if (url.endsWith("/auth/login")) {
        return new Response(
          JSON.stringify({
            token: "tok-signed-in",
            user: {
              id: "u9",
              full_name: "Dr. Imogen Hartley",
              email: "i.hartley@meadowlane.health",
              phone: "01234567",
              role: "doctor",
              is_active: true,
            },
          }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    const { container } = renderSignIn();
    await user.click(screen.getByRole("tab", { name: "Set your password" }));
    await user.type(field(container, "fl-email"), "i.hartley@meadowlane.health");
    await user.type(field(container, "fl-password"), "brandnewpass1");
    await user.click(screen.getByRole("button", { name: "Set password and sign in" }));
    await waitFor(() => expect(getSessionToken()).toBe("tok-signed-in"));
  });

  it("a 400 on the first-login flow shows 'password is already set - sign in instead'", async () => {
    stubFetch((url) => {
      if (url.endsWith("/auth/first-login-password")) {
        return new Response(JSON.stringify({ detail: "Password is already set" }), {
          status: 400,
        });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    const { container } = renderSignIn();
    await user.click(screen.getByRole("tab", { name: "Set your password" }));
    await user.type(field(container, "fl-email"), "i.hartley@meadowlane.health");
    await user.type(field(container, "fl-password"), "brandnewpass1");
    await user.click(screen.getByRole("button", { name: "Set password and sign in" }));
    expect(
      await screen.findByText("password is already set - sign in instead"),
    ).toBeInTheDocument();
    expect(getSessionToken()).toBeNull();
  });

  it("[AC-005] a 401 on sign-in shows exactly one generic message and no field hint", async () => {
    stubFetch((url) => {
      if (url.endsWith("/auth/login")) {
        return new Response(JSON.stringify({ detail: "Email or password is incorrect." }), {
          status: 401,
        });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    const { container } = renderSignIn();
    await user.type(field(container, "signin-email"), "jane@example.com");
    await user.type(field(container, "signin-password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Email or password is incorrect.");
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });
});
