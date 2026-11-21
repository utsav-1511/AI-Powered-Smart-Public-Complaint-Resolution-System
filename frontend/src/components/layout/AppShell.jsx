import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Building2,
  ChevronLeft,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  MapPin,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Brand, MobileMenuButton, UserMenu } from "../common/UI";
import { useApp } from "../../context/AppContext";

const navByRole = {
  citizen: [
    { label: "Overview", to: "/citizen/dashboard", icon: LayoutDashboard },
    { label: "Submit a complaint", to: "/citizen/submit", icon: FilePlus2 },
    { label: "My complaints", to: "/citizen/complaints", icon: ClipboardList },
    { label: "My profile", to: "/citizen/profile", icon: UserRound },
  ],
  officer: [
    { label: "Overview", to: "/officer/dashboard", icon: LayoutDashboard },
    {
      label: "Assigned complaints",
      to: "/officer/complaints",
      icon: ClipboardList,
    },
  ],
  admin: [
    { label: "Overview", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "All complaints", to: "/admin/complaints", icon: ClipboardList },
    { label: "Departments", to: "/admin/departments", icon: Building2 },
    { label: "Officers", to: "/admin/officers", icon: Users },
    { label: "Users", to: "/admin/users", icon: UserRound },
    { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  ],
};
export default function AppShell() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = navByRole[user?.role] || navByRole.citizen;
  const roleTitle =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "officer"
        ? "Department officer"
        : "Citizen services";
  const signOut = () => {
    logout();
    navigate("/");
  };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="close-sidebar"
            onClick={() => setMobileOpen(false)}
          >
            <X size={19} />
          </button>
        </div>
        <div className="workspace">
          <span className="workspace-mark">CR</span>
          <div>
            <strong>Public Services</strong>
            <small>{roleTitle}</small>
          </div>
          <ChevronLeft size={15} />
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav">
          {links.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          {user?.role === "citizen" && (
            <NavLink
              to="/track"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <MapPin size={18} />
              <span>Track a complaint</span>
            </NavLink>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">
              <Activity size={16} />
            </span>
            <strong>Need assistance?</strong>
            <p>We're here to help you navigate the platform.</p>
            <a href="mailto:support@civicresolve.in">
              Contact support <span>↗</span>
            </a>
          </div>
          <button className="sidebar-signout" onClick={signOut}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="sidebar-scrim"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <MobileMenuButton onClick={() => setMobileOpen(true)} />
          <div className="breadcrumb">
            <span>Workspace</span>
            <b>/</b>
            <strong>
              {links.find((item) => location.pathname === item.to)?.label ||
                "Services"}
            </strong>
          </div>
          <div className="topbar-actions">
            <div className="environment-pill">
              <i /> CivicResolve workspace
            </div>
            <UserMenu user={user} onLogout={signOut} />
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
