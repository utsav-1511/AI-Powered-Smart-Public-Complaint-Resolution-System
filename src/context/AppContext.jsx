import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  departments as seedDepartments,
  initialComplaints,
  officers as seedOfficers,
} from "../data/mockData";

const AppContext = createContext(null);
const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export function AppProvider({ children }) {
  const [complaints, setComplaints] = useState(() =>
    read("civicresolve.complaints", initialComplaints),
  );
  const [departments, setDepartments] = useState(() =>
    read("civicresolve.departments", seedDepartments),
  );
  const [officers, setOfficers] = useState(() =>
    read("civicresolve.officers", seedOfficers),
  );
  const [user, setUser] = useState(() => read("civicresolve.user", null));
  const [toast, setToast] = useState("");

  useEffect(
    () =>
      localStorage.setItem(
        "civicresolve.complaints",
        JSON.stringify(complaints),
      ),
    [complaints],
  );
  useEffect(
    () =>
      localStorage.setItem(
        "civicresolve.departments",
        JSON.stringify(departments),
      ),
    [departments],
  );
  useEffect(
    () =>
      localStorage.setItem("civicresolve.officers", JSON.stringify(officers)),
    [officers],
  );
  useEffect(() => {
    if (user) localStorage.setItem("civicresolve.user", JSON.stringify(user));
    else localStorage.removeItem("civicresolve.user");
  }, [user]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const login = (role) => {
    const profile = {
      role,
      name:
        role === "citizen"
          ? "Ananya Sharma"
          : role === "officer"
            ? "Arvind Kumar"
            : "Admin User",
      email:
        role === "citizen"
          ? "ananya@example.com"
          : role === "officer"
            ? "arvind.k@civicresolve.in"
            : "admin@civicresolve.in",
    };
    setUser(profile);
    setToast(`Welcome back, ${profile.name.split(" ")[0]}`);
  };
  const updateProfile = (changes) => {
    setUser((current) => ({ ...current, ...changes }));
    setToast("Profile updated successfully");
  };
  const logout = () => {
    setUser(null);
    setToast("You have been signed out");
  };
  const addComplaint = (input) => {
    const nextNumber =
      Math.max(
        6,
        ...complaints.map((item) => Number(item.id.split("-").at(-1)) || 0),
      ) + 1;
    const item = {
      ...input,
      id: `CMP-2026-${String(nextNumber).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      status: "Submitted",
      assignedOfficer: "",
      notes: "",
      timeline: [{ status: "Submitted", at: new Date().toISOString() }],
    };
    setComplaints((current) => [item, ...current]);
    setToast("Your complaint has been submitted");
    return item;
  };
  const updateComplaint = (id, changes) => {
    setComplaints((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const statusChanged = changes.status && changes.status !== item.status;
        return {
          ...item,
          ...changes,
          timeline: statusChanged
            ? [
                ...(item.timeline || []),
                { status: changes.status, at: new Date().toISOString() },
              ]
            : item.timeline,
        };
      }),
    );
    setToast("Complaint updated successfully");
  };
  const value = useMemo(
    () => ({
      complaints,
      departments,
      officers,
      user,
      toast,
      login,
      logout,
      addComplaint,
      updateComplaint,
      updateProfile,
      setDepartments,
      setOfficers,
      setToast,
    }),
    [complaints, departments, officers, user, toast],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
