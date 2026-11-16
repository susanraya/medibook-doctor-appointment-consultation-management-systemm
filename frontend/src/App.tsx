import { NavLink, Navigate, Outlet, Route, Routes } from "react-router-dom";

import { Icons } from "@/lib/icons";
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
            <NavLink to="/find-a-doctor" className={navLinkClass}>
              <Icons.Search size={16} />
              {"Find a Doctor"}
            </NavLink>
            <NavLink to="/my-appointments" className={navLinkClass}>
              {"My Appointments"}
            </NavLink>
            <NavLink to="/doctor-workspace" className={navLinkClass}>
              <Icons.Check size={16} />
              {"Doctor Workspace"}
            </NavLink>
            <NavLink to="/admin-console" className={navLinkClass}>
              <Icons.Settings size={16} />
              {"Admin Console"}
            </NavLink>
            <NavLink to="/my-account" className={navLinkClass}>
              <Icons.User size={16} />
              {"My Account"}
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShellLayout />}>
        <Route path="/find-a-doctor" element={<FindADoctor />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/doctor-workspace" element={<DoctorWorkspace />} />
        <Route path="/admin-console" element={<AdminConsole />} />
      </Route>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}
