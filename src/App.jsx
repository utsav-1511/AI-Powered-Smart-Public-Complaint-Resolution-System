import { Navigate, Outlet, Route, Routes, Link } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import { useApp } from "./context/AppContext";
import { Brand } from "./components/common/UI";
import { LandingPage, LoginPage } from "./pages/PublicPages";
import {
  AdminDashboard,
  AnalyticsPage,
  CitizenDashboard,
  OfficerDashboard,
} from "./pages/DashboardPages";
import {
  AdminComplaintManagementPage,
  ComplaintsListPage,
  OfficerManagementPage,
  SubmitComplaintPage,
  TrackPage,
} from "./pages/ComplaintPages";
import {
  DepartmentsPage,
  OfficersPage,
  ProfilePage,
  UserManagementPage,
} from "./pages/AdminPages";
import { Toast } from "./components/common/UI";

function RoleGate({ role }) {
  const { user } = useApp();
  return !user ? (
    <Navigate to="/login" replace />
  ) : user.role !== role ? (
    <Navigate to={`/${user.role}/dashboard`} replace />
  ) : (
    <Outlet />
  );
}
function PublicTrackLayout() {
  return (
    <div className="public-track-layout">
      <header>
        <Brand />
        <Link to="/" className="text-button">
          Back to home <span>↗</span>
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        © 2026 CivicResolve <span>Public services, moving forward.</span>
      </footer>
    </div>
  );
}
export default function App() {
  const { toast } = useApp();
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/track" element={<PublicTrackLayout />}>
          <Route index element={<TrackPage />} />
          <Route path=":complaintId" element={<TrackPage />} />
        </Route>
        <Route element={<RoleGate role="citizen" />}>
          <Route path="/citizen" element={<AppShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="submit" element={<SubmitComplaintPage />} />
            <Route
              path="complaints"
              element={<ComplaintsListPage role="citizen" />}
            />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route element={<RoleGate role="officer" />}>
          <Route path="/officer" element={<AppShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="complaints" element={<OfficerManagementPage />} />
          </Route>
        </Route>
        <Route element={<RoleGate role="admin" />}>
          <Route path="/admin" element={<AppShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route
              path="complaints"
              element={<AdminComplaintManagementPage />}
            />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="officers" element={<OfficersPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast message={toast} />
    </>
  );
}
