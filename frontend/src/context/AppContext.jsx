import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient, apiErrorMessage } from "../services/apiClient";

const AppContext = createContext(null);
const cachedUser = () => {
  try { return JSON.parse(localStorage.getItem("civicresolve.user") || "null"); }
  catch { return null; }
};

export function AppProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [user, setUser] = useState(cachedUser);
  const [token, setToken] = useState(() => localStorage.getItem("civicresolve.token"));
  const [authReady, setAuthReady] = useState(false);
  const [toast, setToast] = useState("");

  const notify = (message) => setToast(message);
  const loadDepartments = async () => {
    const { data } = await apiClient.get("/departments");
    setDepartments(data.departments || []);
  };
  const loadWorkspace = async (role = user?.role) => {
    await loadDepartments();
    if (!role) { setComplaints([]); setOfficers([]); return; }
    const requests = [apiClient.get(role === "citizen" ? "/complaints/my" : "/complaints")];
    if (role === "admin") requests.push(apiClient.get("/officers"));
    const results = await Promise.all(requests);
    setComplaints(results[0].data.complaints || []);
    setOfficers(results[1]?.data.officers || []);
  };

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        if (token) {
          const { data } = await apiClient.get("/auth/me");
          if (!active) return;
          setUser(data.user);
          localStorage.setItem("civicresolve.user", JSON.stringify(data.user));
          await loadWorkspace(data.user.role);
        } else {
          setUser(null);
          await loadDepartments();
        }
      } catch (error) {
        if (active) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("civicresolve.token");
          localStorage.removeItem("civicresolve.user");
          try { await loadDepartments(); } catch { /* API unavailable until backend is started. */ }
        }
      } finally { if (active) setAuthReady(true); }
    };
    initialize();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const authenticate = async (endpoint, credentials) => {
    const { data } = await apiClient.post(`/auth/${endpoint}`, credentials);
    localStorage.setItem("civicresolve.token", data.token);
    localStorage.setItem("civicresolve.user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    await loadWorkspace(data.user.role);
    notify(`Welcome${data.user.name ? `, ${data.user.name.split(" ")[0]}` : ""}`);
    return data.user;
  };
  const login = (credentials) => authenticate("login", credentials);
  const register = (details) => authenticate("register", details);
  const logout = () => {
    localStorage.removeItem("civicresolve.token");
    localStorage.removeItem("civicresolve.user");
    setToken(null);
    setUser(null);
    setComplaints([]);
    setOfficers([]);
    notify("You have been signed out");
  };
  const addComplaint = async (input) => {
    const payload = { ...input, pincode: input.pincode || input.pin };
    const { data } = await apiClient.post("/complaints", payload);
    const item = data.complaint;
    setComplaints((current) => [item, ...current.filter((c) => c.id !== item.id)]);
    notify("Your complaint has been submitted");
    return item;
  };
  const updateComplaint = async (id, changes) => {
    const original = complaints.find((complaint) => complaint.id === id);
    let item = original;
    if (changes.departmentId !== undefined || changes.assignedOfficer !== undefined || changes.priority !== undefined) {
      const { data } = await apiClient.patch(`/complaints/${encodeURIComponent(id)}/assign`, {
        departmentId: changes.departmentId,
        assignedOfficer: changes.assignedOfficer,
        priority: changes.priority,
      });
      item = data.complaint;
    }
    if ((changes.status !== undefined && changes.status !== original?.status) || (changes.notes !== undefined && changes.notes !== original?.notes)) {
      const { data } = await apiClient.patch(`/complaints/${encodeURIComponent(id)}/status`, {
        status: changes.status || item?.status || "Under Review",
        remarks: changes.notes || "",
      });
      item = data.complaint;
    }
    if (item) setComplaints((current) => current.map((c) => c.id === id ? item : c));
    notify("Complaint updated successfully");
    return item;
  };
  const refreshWorkspace = () => loadWorkspace();

  const createDepartment = async (department) => {
    const { data } = await apiClient.post("/departments", department);
    setDepartments((current) => [...current, data.department]);
    return data.department;
  };
  const updateDepartment = async (id, changes) => {
    const { data } = await apiClient.put(`/departments/${id}`, changes);
    setDepartments((current) => current.map((d) => d.id === id ? data.department : d));
    return data.department;
  };
  const deleteDepartment = async (id) => {
    await apiClient.delete(`/departments/${id}`);
    setDepartments((current) => current.filter((d) => d.id !== id));
  };
  const createOfficer = async (officer) => {
    const payload = { ...officer };
    if (!payload.password) delete payload.password;
    const { data } = await apiClient.post("/officers", payload);
    setOfficers((current) => [...current, data.officer]);
    return data;
  };
  const updateOfficer = async (id, changes) => {
    const { data } = await apiClient.put(`/officers/${id}`, changes);
    setOfficers((current) => current.map((o) => o.id === id ? data.officer : o));
    return data.officer;
  };
  const updateProfile = async (changes) => {
    const { data } = await apiClient.patch("/auth/me", changes);
    setUser(data.user);
    localStorage.setItem("civicresolve.user", JSON.stringify(data.user));
    notify("Profile updated successfully");
  };

  const value = useMemo(() => ({
    complaints, departments, officers, user, token, authReady, toast,
    login, register, logout, addComplaint, updateComplaint, updateProfile,
    createDepartment, updateDepartment, deleteDepartment, createOfficer, updateOfficer,
    refreshWorkspace, loadDepartments, setToast: notify,
  }), [complaints, departments, officers, user, token, authReady, toast]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
export { apiErrorMessage };
