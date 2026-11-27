import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Screen from "./AdminConsole";
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

const staffUser = (overrides: Record<string, unknown> = {}) => ({
  id: "u-1",
  full_name: "Dr. Anita Rao",
  email: "a.rao@clinic.example",
  phone: "+44 20 7946 0204",
  role: "doctor",
  is_active: true,
  password_status: "<set-at-first-login>",
  specialization_id: "SPC-001",
  ...overrides,
});

const SPECS = [
  { id: "SPC-001", name: "Cardiology", is_active: true },
  { id: "SPC-002", name: "Dermatology", is_active: true },
];

function specsResponse() {
  return new Response(JSON.stringify({ specializations: SPECS }), { status: 200 });
}

beforeEach(() => {
  setSessionToken("tok-admin");
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearSessionToken();
});

describe("AdminConsole staff accounts", () => {
  it("[AC-008] lists doctor and admin accounts from GET /admin/users", async () => {
    stubFetch((url) => {
      if (url.endsWith("/admin/users")) {
        return new Response(JSON.stringify({ users: [staffUser()] }), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    renderScreen();
    expect(await screen.findByText("a.rao@clinic.example")).toBeInTheDocument();
    expect(screen.getByText("Dr. Anita Rao", { selector: "div" })).toBeInTheDocument();
  });

  it("[AC-048] a doctor's specialization is shown next to their row", async () => {
    stubFetch((url) => {
      if (url.endsWith("/admin/users")) {
        return new Response(JSON.stringify({ users: [staffUser()] }), { status: 200 });
      }
      if (url.endsWith("/admin/specializations")) {
        return specsResponse();
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    renderScreen();
    expect(await screen.findByText("Cardiology", { selector: "td" })).toBeInTheDocument();
  });

  it("[AC-008] provisioning posts the form and the new account appears with its role", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/admin/users") && (!init || init.method === undefined)) {
        return new Response(JSON.stringify({ users: [] }), { status: 200 });
      }
      if (url.endsWith("/admin/users") && init?.method === "POST") {
        const body = JSON.parse(String(init.body));
        expect(body).toEqual({
          full_name: "Dr. Imogen Hartley",
          email: "i.hartley@meadowlane.health",
          phone: "02079460000",
          role: "admin",
        });
        return new Response(
          JSON.stringify({
            id: "u-2",
            full_name: "Dr. Imogen Hartley",
            email: "i.hartley@meadowlane.health",
            phone: "02079460000",
            role: "admin",
            is_active: true,
            password_status: "<set-at-first-login>",
          }),
          { status: 201 },
        );
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    renderScreen();
    await screen.findByText("no staff accounts yet");
    await user.type(screen.getByLabelText("Full name"), "Dr. Imogen Hartley");
    await user.type(screen.getByLabelText("Email"), "i.hartley@meadowlane.health");
    await user.type(screen.getByLabelText("Phone"), "02079460000");
    await user.selectOptions(screen.getByLabelText("Role"), "admin");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("i.hartley@meadowlane.health")).toBeInTheDocument();
  });

  it("[AC-048] creating a doctor requires a specialization before it posts", async () => {
    stubFetch((url) => {
      if (url.endsWith("/admin/users")) {
        return new Response(JSON.stringify({ users: [] }), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    renderScreen();
    await screen.findByText("no staff accounts yet");
    await user.type(screen.getByLabelText("Full name"), "Dr. Imogen Hartley");
    await user.type(screen.getByLabelText("Email"), "i.hartley@meadowlane.health");
    await user.type(screen.getByLabelText("Phone"), "02079460000");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(
      await screen.findByText("a specialization is needed so they appear in patient search."),
    ).toBeInTheDocument();
  });

  it("[AC-048] creating a doctor sends the chosen specialization_id and the new row shows its name", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/admin/specializations")) {
        return specsResponse();
      }
      if (url.endsWith("/admin/users") && (!init || init.method === undefined)) {
        return new Response(JSON.stringify({ users: [] }), { status: 200 });
      }
      if (url.endsWith("/admin/users") && init?.method === "POST") {
        const body = JSON.parse(String(init.body));
        expect(body).toEqual({
          full_name: "Dr. Imogen Hartley",
          email: "i.hartley@meadowlane.health",
          phone: "02079460000",
          role: "doctor",
          specialization_id: "SPC-002",
        });
        return new Response(
          JSON.stringify({
            id: "u-3",
            full_name: "Dr. Imogen Hartley",
            email: "i.hartley@meadowlane.health",
            phone: "02079460000",
            role: "doctor",
            is_active: true,
            password_status: "<set-at-first-login>",
            specialization_id: "SPC-002",
          }),
          { status: 201 },
        );
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    renderScreen();
    await screen.findByText("no staff accounts yet");
    await user.type(screen.getByLabelText("Full name"), "Dr. Imogen Hartley");
    await user.type(screen.getByLabelText("Email"), "i.hartley@meadowlane.health");
    await user.type(screen.getByLabelText("Phone"), "02079460000");
    await user.selectOptions(screen.getByLabelText("Specialization"), "SPC-002");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("i.hartley@meadowlane.health")).toBeInTheDocument();
    expect(await screen.findByText("Dermatology", { selector: "td" })).toBeInTheDocument();
  });

  it("[AC-009] a 403 renders 'not available for your role' rather than data", async () => {
    stubFetch(() => new Response(JSON.stringify({ detail: "Forbidden" }), { status: 403 }));
    renderScreen();
    expect(await screen.findByText("not available for your role")).toBeInTheDocument();
    expect(screen.queryByText("Dr. Anita Rao")).not.toBeInTheDocument();
  });

  it("[AC-010] shows '<set-at-first-login>' for accounts not yet activated and no password field in the form", async () => {
    stubFetch((url) => {
      if (url.endsWith("/admin/users")) {
        return new Response(JSON.stringify({ users: [staffUser()] }), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    renderScreen();
    expect(await screen.findAllByText("<set-at-first-login>")).toHaveLength(1);
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  it("409 on provisioning shows an inline 'email already in use' error", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/admin/specializations")) {
        return specsResponse();
      }
      if (url.endsWith("/admin/users") && init?.method === "POST") {
        return new Response(JSON.stringify({ detail: "That email is already in use" }), {
          status: 409,
        });
      }
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    });
    const user = userEvent.setup();
    renderScreen();
    await screen.findByText("no staff accounts yet");
    await user.type(screen.getByLabelText("Full name"), "Dr. Imogen Hartley");
    await user.type(screen.getByLabelText("Email"), "taken@meadowlane.health");
    await user.type(screen.getByLabelText("Phone"), "02079460000");
    await user.selectOptions(screen.getByLabelText("Specialization"), "SPC-001");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("that email is already in use.")).toBeInTheDocument();
  });

  it("422 maps {field, message} onto the matching input", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/admin/specializations")) {
        return specsResponse();
      }
      if (url.endsWith("/admin/users") && init?.method === "POST") {
        return new Response(
          JSON.stringify({
            detail: [{ field: "phone", message: "that phone number looks invalid" }],
          }),
          { status: 422 },
        );
      }
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    });
    const user = userEvent.setup();
    renderScreen();
    await screen.findByText("no staff accounts yet");
    await user.type(screen.getByLabelText("Full name"), "Dr. Imogen Hartley");
    await user.type(screen.getByLabelText("Email"), "i.hartley@meadowlane.health");
    await user.type(screen.getByLabelText("Phone"), "bad-phone");
    await user.selectOptions(screen.getByLabelText("Specialization"), "SPC-001");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("that phone number looks invalid")).toBeInTheDocument();
  });

  it("[AC-049] deactivating a doctor calls PUT /admin/doctors/{id}/status and flags their appointments for reassignment", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/admin/users") && (!init || init.method === undefined)) {
        return new Response(JSON.stringify({ users: [staffUser()] }), { status: 200 });
      }
      if (url.endsWith("/admin/doctors/u-1/status") && init?.method === "PUT") {
        expect(JSON.parse(String(init.body))).toEqual({ is_active: false });
        return new Response(
          JSON.stringify({
            id: "u-1",
            is_active: false,
            flagged_appointment_ids: ["apt-1", "apt-2"],
          }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    renderScreen();
    await screen.findByText("a.rao@clinic.example");
    await user.click(screen.getByRole("button", { name: /Deactivate/ }));
    expect(await screen.findByRole("button", { name: /Reactivate/ })).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Dr. Anita Rao is hidden from patient search and can no longer sign in. 2 appointments are flagged for reassignment.",
      ),
    ).toBeInTheDocument();
  });

  it("[AC-049] reactivating a doctor calls PUT /admin/doctors/{id}/status with is_active true", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/admin/users") && (!init || init.method === undefined)) {
        return new Response(JSON.stringify({ users: [staffUser({ is_active: false })] }), {
          status: 200,
        });
      }
      if (url.endsWith("/admin/doctors/u-1/status") && init?.method === "PUT") {
        expect(JSON.parse(String(init.body))).toEqual({ is_active: true });
        return new Response(
          JSON.stringify({ id: "u-1", is_active: true, flagged_appointment_ids: [] }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });
    const user = userEvent.setup();
    renderScreen();
    await screen.findByText("a.rao@clinic.example");
    await user.click(screen.getByRole("button", { name: /Reactivate/ }));
    expect(await screen.findByRole("button", { name: /Deactivate/ })).toBeInTheDocument();
    expect(
      await screen.findByText("Dr. Anita Rao is back in patient search and can sign in again."),
    ).toBeInTheDocument();
  });

  it("shows a loading state while fetching and an empty state with none provisioned", async () => {
    let resolveAccounts: (value: Response) => void = () => {};
    let resolveSpecs: (value: Response) => void = () => {};
    stubFetch((url) => {
      if (url.endsWith("/admin/specializations")) {
        return new Promise<Response>((resolve) => {
          resolveSpecs = resolve;
        });
      }
      return new Promise<Response>((resolve) => {
        resolveAccounts = resolve;
      });
    });
    renderScreen();
    expect(screen.getByText("loading…")).toBeInTheDocument();
    resolveAccounts(new Response(JSON.stringify({ users: [] }), { status: 200 }));
    resolveSpecs(new Response(JSON.stringify({ specializations: [] }), { status: 200 }));
    expect(await screen.findByText("no staff accounts yet")).toBeInTheDocument();
  });
});

async function openSpecializationsTab(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("tab", { name: "Specializations" }));
}

describe("AdminConsole specializations", () => {
  it("[AC-050] shows a loading state while fetching and an empty state with none defined", async () => {
    let resolveSpecs: (value: Response) => void = () => {};
    stubFetch((url) => {
      if (url.endsWith("/admin/specializations")) {
        return new Promise<Response>((resolve) => {
          resolveSpecs = resolve;
        });
      }
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    });
    const user = userEvent.setup();
    renderScreen();
    await openSpecializationsTab(user);
    expect(screen.getByText("loading specializations…")).toBeInTheDocument();
    resolveSpecs(new Response(JSON.stringify({ specializations: [] }), { status: 200 }));
    expect(await screen.findByText("no specializations yet")).toBeInTheDocument();
  });

  it("[AC-009] a 403 fetching specializations renders 'not available for your role'", async () => {
    stubFetch((url) => {
      if (url.endsWith("/admin/specializations")) {
        return new Response(JSON.stringify({ detail: "Forbidden" }), { status: 403 });
      }
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    });
    const user = userEvent.setup();
    renderScreen();
    await openSpecializationsTab(user);
    expect(await screen.findByText("not available for your role")).toBeInTheDocument();
  });

  it("[AC-050] lists specializations from GET /admin/specializations", async () => {
    stubFetch((url) => {
      if (url.endsWith("/admin/specializations")) {
        return specsResponse();
      }
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    });
    const user = userEvent.setup();
    renderScreen();
    await openSpecializationsTab(user);
    expect(
      await screen.findByText("Cardiology", { selector: "span.font-medium" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Dermatology", { selector: "span.font-medium" })).toBeInTheDocument();
  });

  it("[AC-050] adding a specialization posts the name and the new entry appears, offered wherever a specialization is chosen", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/admin/specializations") && init?.method === "POST") {
        expect(JSON.parse(String(init.body))).toEqual({ name: "Rheumatology" });
        return new Response(
          JSON.stringify({ id: "SPC-003", name: "Rheumatology", is_active: true }),
          { status: 201 },
        );
      }
      if (url.endsWith("/admin/specializations")) {
        return specsResponse();
      }
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    });
    const user = userEvent.setup();
    renderScreen();
    await openSpecializationsTab(user);
    await screen.findByText("Cardiology", { selector: "span.font-medium" });
    await user.type(screen.getByLabelText("Specialization name"), "Rheumatology");
    await user.click(screen.getByRole("button", { name: "Add specialization" }));
    expect(
      await screen.findByText(
        "Rheumatology added. it is now offered wherever a specialization is chosen.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Rheumatology", { selector: "span.font-medium" })).toBeInTheDocument();
  });

  it("[AC-050] a 409 on add shows the name-taken message inline and does not add a row", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/admin/specializations") && init?.method === "POST") {
        return new Response(
          JSON.stringify({ detail: "A specialization with that name already exists" }),
          { status: 409 },
        );
      }
      if (url.endsWith("/admin/specializations")) {
        return specsResponse();
      }
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    });
    const user = userEvent.setup();
    renderScreen();
    await openSpecializationsTab(user);
    await screen.findByText("Cardiology", { selector: "span.font-medium" });
    await user.type(screen.getByLabelText("Specialization name"), "Cardiology");
    await user.click(screen.getByRole("button", { name: "Add specialization" }));
    expect(
      await screen.findByText("A specialization with that name already exists"),
    ).toBeInTheDocument();
  });

  it("[AC-050] renaming a specialization puts the new name through PUT and the row updates", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/admin/specializations") && init?.method === "PUT") {
        expect(JSON.parse(String(init.body))).toEqual({ id: "SPC-001", name: "Heart Medicine" });
        return new Response(
          JSON.stringify({ id: "SPC-001", name: "Heart Medicine", is_active: true }),
          { status: 200 },
        );
      }
      if (url.endsWith("/admin/specializations")) {
        return specsResponse();
      }
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    });
    const user = userEvent.setup();
    renderScreen();
    await openSpecializationsTab(user);
    await screen.findByText("Cardiology", { selector: "span.font-medium" });
    await user.click(screen.getByRole("button", { name: "Rename Cardiology" }));
    const input = screen.getByDisplayValue("Cardiology");
    await user.clear(input);
    await user.type(input, "Heart Medicine");
    await user.click(screen.getByRole("button", { name: "Save Cardiology" }));
    expect(
      await screen.findByText("Heart Medicine", { selector: "span.font-medium" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Cardiology", { selector: "span.font-medium" }),
    ).not.toBeInTheDocument();
  });

  it("[AC-051] deleting a specialization in use is blocked and the dependency warning is shown", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/admin/specializations?id=SPC-001") && init?.method === "DELETE") {
        return new Response(
          JSON.stringify({
            detail:
              "This specialization is assigned to doctors or used in the mapping table and cannot be deleted",
          }),
          { status: 409 },
        );
      }
      if (url.endsWith("/admin/specializations")) {
        return specsResponse();
      }
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    });
    const user = userEvent.setup();
    renderScreen();
    await openSpecializationsTab(user);
    await screen.findByText("Cardiology", { selector: "span.font-medium" });
    await user.click(screen.getByRole("button", { name: "Remove Cardiology" }));
    expect(
      await screen.findByText(
        "This specialization is assigned to doctors or used in the mapping table and cannot be deleted",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Cardiology", { selector: "span.font-medium" })).toBeInTheDocument();
  });

  it("[AC-050][AC-051] deleting a specialization with no dependencies removes it", async () => {
    stubFetch((url, init) => {
      if (url.endsWith("/admin/specializations?id=SPC-001") && init?.method === "DELETE") {
        return new Response(null, { status: 204 });
      }
      if (url.endsWith("/admin/specializations")) {
        return specsResponse();
      }
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    });
    const user = userEvent.setup();
    renderScreen();
    await openSpecializationsTab(user);
    await screen.findByText("Cardiology", { selector: "span.font-medium" });
    await user.click(screen.getByRole("button", { name: "Remove Cardiology" }));
    expect(
      await screen.findByText(
        "Cardiology removed. it no longer appears wherever a specialization is chosen.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Cardiology", { selector: "span.font-medium" }),
    ).not.toBeInTheDocument();
  });
});
