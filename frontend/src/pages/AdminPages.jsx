import { useState } from "react";
import { Check, Plus, Search, Trash2, UserRound, Users, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageHeader, SearchBox, EmptyState } from "../components/common/UI";
import { apiErrorMessage } from "../services/apiClient";

export function DepartmentsPage() {
  const { departments, createDepartment, updateDepartment, deleteDepartment, complaints } = useApp();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    const name = modal.name.trim();
    if (!name) {
      setError("Department name is required.");
      return;
    }
    if (
      departments.some(
        (item) =>
          item.name.toLowerCase() === name.toLowerCase() &&
          item.id !== modal.id,
      )
    ) {
      setError("A department with this name already exists.");
      return;
    }
    const item = {
      ...modal,
      name,
      short: modal.short.trim() || name.split(" ")[0],
      color: modal.color || "#2563eb",
      lead: modal.lead.trim() || "Not assigned",
      email: modal.email.trim() || "support@civicresolve.in",
    };
    try {
      if (modal.id) await updateDepartment(modal.id, item);
      else await createDepartment(item);
      setModal(null); setError("");
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
  };
  const remove = async (item) => {
    if (complaints.some((complaint) => complaint.departmentId === item.id)) {
      setError(
        "This department has complaints assigned to it. Reassign those complaints before deleting it.",
      );
      return;
    }
    try { await deleteDepartment(item.id); setError(""); }
    catch (requestError) { setError(apiErrorMessage(requestError)); }
  };
  const rows = departments.filter((item) =>
    `${item.name} ${item.lead} ${item.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="ORGANIZATION SETTINGS"
        title="Departments"
        description="Manage the teams responsible for public services."
        action={
          <button
            className="button button-primary"
            onClick={() => {
              setModal({
                name: "",
                short: "",
                lead: "",
                email: "",
                color: "#2563eb",
              });
              setError("");
            }}
          >
            <Plus size={17} />
            Add department
          </button>
        }
      />
      {error && !modal && (
        <div className="form-error admin-error">
          {error}
          <button onClick={() => setError("")}>
            <X size={14} />
          </button>
        </div>
      )}
      <section className="panel list-panel">
        <div className="management-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search departments..."
          />
          <span>{departments.length} departments</span>
        </div>
        {rows.length ? (
          <div className="department-grid">
            {rows.map((item) => {
              const assigned = complaints.filter(
                (complaint) => complaint.departmentId === item.id,
              ).length;
              return (
                <article className="department-card" key={item.id}>
                  <div className="dept-card-top">
                    <span
                      className="dept-symbol"
                      style={{
                        color: item.color,
                        background: `${item.color}12`,
                      }}
                    >
                      {item.short.slice(0, 2).toUpperCase()}
                    </span>
                    <button
                      className="icon-button delete-button"
                      onClick={() => remove(item)}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h3>{item.name}</h3>
                  <p className="dept-contact">
                    {item.lead} <span>·</span> {item.email}
                  </p>
                  <div className="dept-card-footer">
                    <span>
                      <Users size={14} />
                      {assigned} assigned cases
                    </span>
                    <button
                      className="text-button"
                      onClick={() => {
                        setModal(item);
                        setError("");
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No departments found"
            description="Try another search term."
          />
        )}
      </section>
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setModal(null)
          }
        >
          <section className="detail-modal management-modal">
            <div className="modal-top">
              <div>
                <span className="eyebrow">ORGANIZATION</span>
                <h2>{modal.id ? "Edit department" : "Add a department"}</h2>
              </div>
              <button className="icon-button" onClick={() => setModal(null)}>
                <X size={19} />
              </button>
            </div>
            <form className="officer-update-form" onSubmit={save}>
              <label>
                Department name <b>*</b>
                <input
                  autoFocus
                  value={modal.name}
                  onChange={(e) => setModal({ ...modal, name: e.target.value })}
                  placeholder="e.g. Public Works Department"
                />
              </label>
              <label>
                Short name
                <input
                  value={modal.short}
                  onChange={(e) =>
                    setModal({ ...modal, short: e.target.value })
                  }
                  placeholder="e.g. PWD"
                />
              </label>
              <label>
                Department lead
                <input
                  value={modal.lead}
                  onChange={(e) => setModal({ ...modal, lead: e.target.value })}
                  placeholder="Full name"
                />
              </label>
              <label>
                Contact email
                <input
                  type="email"
                  value={modal.email}
                  onChange={(e) =>
                    setModal({ ...modal, email: e.target.value })
                  }
                  placeholder="department@civicresolve.in"
                />
              </label>
              {error && <div className="form-error">{error}</div>}
              <div className="form-footer">
                <span>Department details appear in case assignment.</span>
                <button className="button button-primary">
                  Save department
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export function OfficersPage() {
  const { officers, createOfficer, updateOfficer, departments, complaints } = useApp();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    if (
      !modal.name.trim() ||
      !modal.email.includes("@") ||
      !modal.departmentId
    ) {
      setError("Enter a name, valid email, and department.");
      return;
    }
    if (
      officers.some(
        (item) =>
          item.email.toLowerCase() === modal.email.toLowerCase() &&
          item.id !== modal.id,
      )
    ) {
      setError("An officer with this email already exists.");
      return;
    }
    try {
      if (modal.id) await updateOfficer(modal.id, { ...modal, departmentId: modal.departmentId });
      else await createOfficer({ ...modal, departmentId: modal.departmentId });
      setModal(null); setError("");
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
  };
  const rows = officers.filter((item) =>
    `${item.name} ${item.email} ${departments.find((d) => d.id === item.departmentId)?.name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="ORGANIZATION SETTINGS"
        title="Officers"
        description="Manage department officers and their availability."
        action={
          <button
            className="button button-primary"
            onClick={() => {
              setModal({
                name: "",
                email: "",
                departmentId: departments[0]?.id || "",
                status: "Available",
                password: "",
              });
              setError("");
            }}
          >
            <Plus size={17} />
            Add officer
          </button>
        }
      />
      {error && !modal && (
        <div className="form-error admin-error">
          {error}
          <button onClick={() => setError("")}>
            <X size={14} />
          </button>
        </div>
      )}
      <section className="panel list-panel">
        <div className="management-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search officers..."
          />
          <span>{officers.length} officers</span>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Department</th>
                  <th>Assigned cases</th>
                  <th>Availability</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((officer) => (
                  <tr key={officer.id}>
                    <td>
                      <div className="officer-name">
                        <span className="avatar officer-avatar">
                          {officer.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <span>
                          <strong>{officer.name}</strong>
                          <small>{officer.email}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      {departments.find(
                        (item) => item.id === officer.departmentId,
                      )?.name || "Unassigned"}
                    </td>
                    <td>
                      <span className="assigned-count">
                        {
                          complaints.filter(
                            (item) => item.assignedOfficer === officer.id,
                          ).length
                        }
                      </span>{" "}
                      cases
                    </td>
                    <td>
                      <span
                        className={`availability ${officer.status.toLowerCase().replaceAll(" ", "-")}`}
                      >
                        <i />
                        {officer.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => {
                          setModal(officer);
                          setError("");
                        }}
                      >
                        Edit profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No officers found"
            description="Try a different search term."
          />
        )}
      </section>
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setModal(null)
          }
        >
          <section className="detail-modal management-modal">
            <div className="modal-top">
              <div>
                <span className="eyebrow">TEAM MEMBER</span>
                <h2>{modal.id ? "Edit officer" : "Add an officer"}</h2>
              </div>
              <button className="icon-button" onClick={() => setModal(null)}>
                <X size={19} />
              </button>
            </div>
            <form className="officer-update-form" onSubmit={save}>
              <label>
                Full name <b>*</b>
                <input
                  autoFocus
                  value={modal.name}
                  onChange={(e) => setModal({ ...modal, name: e.target.value })}
                  placeholder="Officer name"
                />
              </label>
              <label>
                Email address <b>*</b>
                <input
                  type="email"
                  value={modal.email}
                  onChange={(e) =>
                    setModal({ ...modal, email: e.target.value })
                  }
                  placeholder="officer@civicresolve.in"
                />
              </label>
              <label>
                Department <b>*</b>
                <select
                  value={modal.departmentId}
                  onChange={(e) =>
                    setModal({ ...modal, departmentId: e.target.value })
                  }
                >
                  {departments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              {!modal.id && <label>
                Temporary password <span className="optional-label">At least 8 characters</span>
                <input type="password" value={modal.password || ""} minLength={8} onChange={(e) => setModal({ ...modal, password: e.target.value })} placeholder="Set initial password" />
              </label>}
              <label>
                Availability
                <select
                  value={modal.status}
                  onChange={(e) =>
                    setModal({ ...modal, status: e.target.value })
                  }
                >
                  {["Available", "On field", "Unavailable"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              {error && <div className="form-error">{error}</div>}
              <div className="form-footer">
                <span>
                  Officers can be assigned from a complaint's detail view.
                </span>
                <button className="button button-primary">Save officer</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export function UserManagementPage() {
  const { complaints } = useApp();
  const [search, setSearch] = useState("");
  const users = [
    ...new Map(
      complaints.map((item) => [
        item.citizenEmail,
        { name: item.citizen, email: item.citizenEmail },
      ]),
    ).values(),
  ].filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="PLATFORM ACCESS"
        title="Users"
        description="Citizens who have submitted reports through CivicResolve."
      />
      <section className="panel list-panel">
        <div className="management-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search citizens..."
          />
          <span>{users.length} citizens</span>
        </div>
        {users.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Citizen</th>
                  <th>Complaints submitted</th>
                  <th>Open cases</th>
                  <th>Latest activity</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const reports = complaints.filter(
                    (item) => item.citizenEmail === user.email,
                  );
                  const openCount = reports.filter(
                    (item) => !["Resolved", "Rejected"].includes(item.status),
                  ).length;
                  const latest = reports.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                  )[0];
                  return (
                    <tr key={user.email}>
                      <td>
                        <div className="officer-name">
                          <span className="avatar officer-avatar">
                            {user.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                          <span>
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                          </span>
                        </div>
                      </td>
                      <td>{reports.length}</td>
                      <td>{openCount}</td>
                      <td>
                        {latest
                          ? new Date(latest.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                      <td>
                        <span className="availability">
                          <i />
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No citizens found"
            description="Try a different search term."
          />
        )}
      </section>
      <div className="data-note">
        This list is based on citizen accounts with complaint activity.
      </div>
    </>
  );
}

export function ProfilePage() {
  const { user, updateProfile } = useApp();
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (name.trim().length < 2) return;
    try {
      await updateProfile({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (error) { setSaved(false); }
  };
  return (
    <>
      <PageHeader
        eyebrow="YOUR ACCOUNT"
        title="My profile"
        description="Manage the details associated with your citizen account."
      />
      <div className="profile-layout">
        <section className="panel profile-card">
          <div className="profile-cover" />
          <div className="profile-avatar">
            {user?.name
              ?.split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </div>
          <form className="profile-form" onSubmit={submit}>
            <h2>Personal information</h2>
            <p>
              These details help departments identify your submitted reports.
            </p>
            <label>
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              Email address
              <input value={user?.email || ""} disabled />
            </label>
            <label>
              Account type
              <input value="Citizen account" disabled />
            </label>
            <div className="form-footer">
              <span>
                {saved ? (
                  <>
                    <Check size={14} />
                    Changes saved
                  </>
                ) : (
                  "Email is managed by your sign-in provider."
                )}
              </span>
              <button className="button button-primary" type="submit">
                Save changes
              </button>
            </div>
          </form>
        </section>
        <aside className="panel profile-side">
          <span className="profile-side-icon">
            <UserRound size={18} />
          </span>
          <strong>Your account is private.</strong>
          <p>
            Your contact details are only used to manage the civic reports you
            submit and share updates about their status.
          </p>
          <a href="mailto:support@civicresolve.in">
            Need to update your email? Contact support
          </a>
        </aside>
      </div>
    </>
  );
}
