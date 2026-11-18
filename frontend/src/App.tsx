import * as React from "react";
import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import { Icons } from "@/lib/icons";
import { AuthProvider, ROLE_HOME, useAuth, type Role } from "@/lib/auth";
import { toPath } from "@/lib/navigate";
import SignIn from "@/screens/SignIn";
import FindADoctor from "@/screens/FindADoctor";
import MyAppointments from "@/screens/MyAppointments";
import MyAccount from "@/screens/MyAccount";
import DoctorWorkspace from "@/screens/DoctorWorkspace";
import AdminConsole from "@/screens/AdminConsole";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center gap-2 rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-[var(--brand-hover)] text-[var(--brand-fg)]" : "text-[var(--brand-fg-muted)]",
  ].join(" ");

// The app's menu, drawn around every screen except the ones routed outside it below.
function AppShellLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice ?? null;
  const [dismissed, setDismissed] = React.useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="border-b"
        style={{
          backgroundColor: "var(--brand-surface)",
          borderColor: "var(--brand-border)",
        }}
      >
        <div className="flex items-center gap-6 px-6 py-2">
          <p
            className="shrink-0 text-sm font-semibold"
            style={{ fontFamily: "var(--brand-font-heading)" }}
          >
            {"MediBook"}
          </p>
          <nav aria-label="App menu" className="flex flex-wrap items-center gap-1">
            {user?.role === "patient" ? (
              <>
                <NavLink to="/find-a-doctor" className={navLinkClass}>
                  <Icons.Search size={16} />
                  {"Find a Doctor"}
                </NavLink>
                <NavLink to="/my-appointments" className={navLinkClass}>
                  {"My Appointments"}
                </NavLink>
              </>
            ) : null}
            {user?.role === "doctor" ? (
              <NavLink to="/doctor-workspace" className={navLinkClass}>
                <Icons.Check size={16} />
                {"Doctor Workspace"}
              </NavLink>
            ) : null}
            {user?.role === "admin" ? (
              <NavLink to="/admin-console" className={navLinkClass}>
                <Icons.Settings size={16} />
                {"Admin Console"}
              </NavLink>
            ) : null}
            {user ? (
              <NavLink to="/my-account" className={navLinkClass}>
                <Icons.User size={16} />
                {"My Account"}
              </NavLink>
            ) : null}
          </nav>
          {user ? (
            <button
              type="button"
              onClick={() => {
                void logout();
              }}
              className="ml-auto rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium text-[var(--brand-fg-muted)] hover:bg-[var(--brand-hover)]"
            >
              {"Sign out"}
            </button>
          ) : null}
        </div>
      </header>
      {notice && !dismissed ? (
        <div
          role="status"
          className="flex items-center justify-between gap-3 bg-amber-50 px-6 py-2 text-sm text-amber-800"
        >
          <span>{notice}</span>
          <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss">
            {"×"}
          </button>
        </div>
      ) : null}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

// Client-side only: a UX convenience that keeps a signed-in user off pages
// their role should not see. The server enforces the real boundary (NFR-004);
// this just avoids rendering a page the API would refuse anyway.
function RequireRole({ allow }: { allow: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm">{"Loading…"}</div>
    );
  }
  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }
  if (!allow.includes(user.role)) {
    return (
      <Navigate
        to={toPath(ROLE_HOME[user.role])}
        replace
        state={{ notice: "not available for your role" }}
      />
    );
  }
  return <Outlet />;
}

function SignInRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={toPath(ROLE_HOME[user.role])} replace />;
  return <SignIn />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShellLayout />}>
        <Route element={<RequireRole allow={["patient"]} />}>
          <Route path="/find-a-doctor" element={<FindADoctor />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
        </Route>
        <Route element={<RequireRole allow={["doctor"]} />}>
          <Route path="/doctor-workspace" element={<DoctorWorkspace />} />
        </Route>
        <Route element={<RequireRole allow={["admin"]} />}>
          <Route path="/admin-console" element={<AdminConsole />} />
        </Route>
        <Route element={<RequireRole allow={["patient", "doctor", "admin"]} />}>
          <Route path="/my-account" element={<MyAccount />} />
        </Route>
      </Route>
      <Route path="/sign-in" element={<SignInRoute />} />
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
