import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  FileText,
  Menu,
  Search,
  X,
} from "lucide-react";
import { dateFormat, departmentName } from "../../utils/format";

export function Brand({ light = false }) {
  return (
    <Link to="/" className={`brand ${light ? "brand-light" : ""}`}>
      <span className="brand-mark">
        <Check size={17} strokeWidth={3} />
      </span>
      <span>
        Civic<span>Resolve</span>
      </span>
    </Link>
  );
}
export function StatusBadge({ status }) {
  const cls = status?.toLowerCase().replaceAll(" ", "-") || "submitted";
  return (
    <span className={`badge status-${cls}`}>
      <i />
      {status || "Submitted"}
    </span>
  );
}
export function PriorityBadge({ priority }) {
  return (
    <span className={`priority priority-${priority?.toLowerCase()}`}>
      {priority || "Medium"}
    </span>
  );
}
export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue",
  change,
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      <div className="stat-detail">
        {change && <b>{change}</b>}
        {detail}
      </div>
    </article>
  );
}
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title = "Nothing to show yet",
  description = "New activity will appear here.",
  action,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <FileText size={22} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function ComplaintTable({
  complaints,
  departments,
  actionLabel = "View",
  onSelect,
}) {
  if (!complaints.length)
    return (
      <EmptyState
        title="No complaints found"
        description="Try changing your search or filters."
      />
    );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Complaint</th>
            <th>Category</th>
            <th>Location</th>
            <th>Submitted</th>
            <th>Priority</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {complaints.map((item) => (
            <tr key={item.id}>
              <td>
                <button
                  className="complaint-link"
                  onClick={() => onSelect(item)}
                >
                  <span>{item.title}</span>
                  <small>{item.id}</small>
                </button>
              </td>
              <td>{item.category}</td>
              <td>{item.city}</td>
              <td>{dateFormat(item.createdAt)}</td>
              <td>
                <PriorityBadge priority={item.priority} />
              </td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              <td>
                <button className="text-button" onClick={() => onSelect(item)}>
                  {actionLabel}
                  <ArrowRight size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search complaints...",
}) {
  return (
    <label className="searchbox">
      <Search size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function ComplaintTimeline({ complaint }) {
  return (
    <div className="timeline">
      {(complaint.timeline || []).map((step, index) => (
        <div
          className={`timeline-item ${index === complaint.timeline.length - 1 ? "current" : ""}`}
          key={`${step.status}-${step.at}`}
        >
          <span className="timeline-dot" />
          <div>
            <strong>{step.status}</strong>
            <small>
              {dateFormat(step.at)} ·{" "}
              {new Intl.DateTimeFormat("en-IN", {
                hour: "numeric",
                minute: "2-digit",
              }).format(new Date(step.at))}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}
export function ComplaintDetails({ complaint, departments, onClose }) {
  if (!complaint) return null;
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="detail-modal">
        <div className="modal-top">
          <div>
            <span className="eyebrow">{complaint.id}</span>
            <h2>{complaint.title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>
        <div className="detail-badges">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          <span className="subtle-text">
            Submitted {dateFormat(complaint.createdAt)}
          </span>
        </div>
        <p className="detail-description">{complaint.description}</p>
        <div className="detail-facts">
          <div>
            <span>Category</span>
            <strong>{complaint.category}</strong>
          </div>
          <div>
            <span>Department</span>
            <strong>
              {departmentName(departments, complaint.departmentId)}
            </strong>
          </div>
          <div>
            <span>Location</span>
            <strong>
              {complaint.location}, {complaint.city}
            </strong>
          </div>
          <div>
            <span>Citizen</span>
            <strong>{complaint.citizen}</strong>
          </div>
        </div>
        {complaint.image && (
          <img
            className="complaint-image"
            src={complaint.image}
            alt="Complaint evidence"
          />
        )}
        <h3 className="section-mini-title">Activity timeline</h3>
        <ComplaintTimeline complaint={complaint} />
        {complaint.notes && (
          <div className="notes-box">
            <strong>Resolution notes</strong>
            <p>{complaint.notes}</p>
          </div>
        )}
      </section>
    </div>
  );
}
export function Toast({ message }) {
  return message ? (
    <div className="toast">
      <span>
        <Check size={16} />
      </span>
      {message}
    </div>
  ) : null;
}
export function FilterBar({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  categories,
}) {
  return (
    <div className="filter-bar">
      <SearchBox value={search} onChange={setSearch} />
      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <option value="">All statuses</option>
        {[
          "Submitted",
          "Under Review",
          "Assigned",
          "In Progress",
          "Resolved",
          "Rejected",
        ].map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}
export function MobileMenuButton({ onClick }) {
  return (
    <button
      className="mobile-menu-button"
      onClick={onClick}
      aria-label="Open navigation"
    >
      <Menu size={20} />
    </button>
  );
}
export function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="user-menu">
      <button
        onClick={() => setOpen((value) => !value)}
        className="user-button"
      >
        <span className="avatar">
          {user?.name
            ?.split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </span>
        <span className="user-name">
          {user?.name}
          <small>{user?.role}</small>
        </span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="user-dropdown">
          <button onClick={onLogout}>Sign out</button>
        </div>
      )}
    </div>
  );
}
export function AlertsButton() {
  return (
    <button className="icon-button notification" aria-label="Notifications">
      <Bell size={18} />
      <i />
    </button>
  );
}
export function Callout({ icon: Icon = CircleAlert, title, children }) {
  return (
    <div className="callout">
      <Icon size={18} />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
export function LoadingCard() {
  return (
    <div className="loading-state">
      <Clock3 size={17} />
      Loading your dashboard…
    </div>
  );
}
