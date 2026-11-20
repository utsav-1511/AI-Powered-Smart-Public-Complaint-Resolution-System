import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Plus,
  Siren,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "../context/AppContext";
import {
  ComplaintDetails,
  ComplaintTable,
  PageHeader,
  PriorityBadge,
  StatCard,
  StatusBadge,
} from "../components/common/UI";
import { departmentName, relativeDate } from "../utils/format";

const monthData = [
  { name: "Jun", filed: 42, resolved: 31 },
  { name: "Jul", filed: 56, resolved: 40 },
  { name: "Aug", filed: 48, resolved: 42 },
  { name: "Sep", filed: 69, resolved: 52 },
  { name: "Oct", filed: 62, resolved: 58 },
  { name: "Nov", filed: 74, resolved: 61 },
];
const chartColors = [
  "#2563eb",
  "#16a34a",
  "#0891b2",
  "#d97706",
  "#7c3aed",
  "#e11d48",
];

function recentForRole(complaints, user, role) {
  return role === "citizen"
    ? complaints
        .filter((item) => item.citizenEmail === user?.email)
        .concat(complaints.filter((item) => item.citizenEmail !== user?.email))
        .slice(0, 5)
    : role === "officer"
      ? complaints
          .filter(
            (item) => item.assignedOfficer === "off-1" || !item.assignedOfficer,
          )
          .slice(0, 5)
      : complaints.slice(0, 5);
}
export function CitizenDashboard() {
  const { complaints, user, departments } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const mine = complaints.filter((item) => item.citizenEmail === user?.email);
  const counts = {
    total: mine.length || 4,
    pending:
      mine.filter((item) => !["Resolved", "Rejected"].includes(item.status))
        .length || 2,
    progress: mine.filter((item) => item.status === "In Progress").length || 1,
    resolved: mine.filter((item) => item.status === "Resolved").length || 1,
  };
  const rows = recentForRole(complaints, user, "citizen");
  return (
    <>
      <PageHeader
        eyebrow="YOUR CIVIC SPACE"
        title={`Good morning, ${user?.name?.split(" ")[0] || "there"}.`}
        description="Here's a look at the issues you've brought to our attention."
        action={
          <Link className="button button-primary" to="/citizen/submit">
            <Plus size={17} />
            New complaint
          </Link>
        }
      />
      <div className="stat-grid four">
        <StatCard
          label="Total complaints"
          value={counts.total}
          detail="All time"
          icon={FileText}
          tone="blue"
        />
        <StatCard
          label="Awaiting action"
          value={counts.pending}
          detail="Needs attention"
          icon={Clock3}
          tone="orange"
        />
        <StatCard
          label="In progress"
          value={counts.progress}
          detail="Being worked on"
          icon={Siren}
          tone="purple"
        />
        <StatCard
          label="Resolved"
          value={counts.resolved}
          detail="Closed successfully"
          icon={CheckCircle2}
          tone="green"
        />
      </div>
      <section className="panel recent-panel">
        <div className="panel-header">
          <div>
            <h2>Recent complaints</h2>
            <p>Keep track of the latest activity on your reports.</p>
          </div>
          <Link className="inline-link" to="/citizen/complaints">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <ComplaintTable
          complaints={rows}
          departments={departments}
          onSelect={setSelected}
        />
      </section>
      <div className="dashboard-bottom">
        <div className="panel next-steps">
          <div className="panel-header">
            <div>
              <h2>What would you like to do?</h2>
              <p>Access the services you need, quickly.</p>
            </div>
          </div>
          <div className="quick-action-list">
            <Link to="/citizen/submit">
              <span className="quick-icon blue">
                <Plus size={17} />
              </span>
              <span>
                <strong>Report a new issue</strong>
                <small>Let us know what's happening in your area</small>
              </span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/track">
              <span className="quick-icon purple">
                <ArrowUpRight size={17} />
              </span>
              <span>
                <strong>Track a complaint</strong>
                <small>Get the latest update on a report</small>
              </span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="panel response-card">
          <span className="response-mark">
            <CheckCircle2 size={21} />
          </span>
          <span className="eyebrow">OUR COMMITMENT</span>
          <h3>Every report gets a response.</h3>
          <p>
            Your concerns matter. We'll keep you informed at every step, from
            the first review to resolution.
          </p>
          <span className="response-foot">
            CivicResolve service pledge <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
      {selected && (
        <ComplaintDetails
          complaint={selected}
          departments={departments}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

export function OfficerDashboard() {
  const { complaints, departments } = useApp();
  const navigate = useNavigate();
  const assigned = complaints.filter(
    (item) => item.assignedOfficer === "off-1" || !item.assignedOfficer,
  );
  const priorityData = ["Critical", "High", "Medium", "Low"].map(
    (priority) => ({
      priority,
      count: assigned.filter((item) => item.priority === priority).length,
    }),
  );
  return (
    <>
      <PageHeader
        eyebrow="DEPARTMENT WORKSPACE"
        title="Good morning, Arvind."
        description="Your assigned cases and department activity at a glance."
        action={
          <Link to="/officer/complaints" className="button button-outline">
            Open case queue <ArrowRight size={16} />
          </Link>
        }
      />
      <div className="stat-grid four">
        <StatCard
          label="Assigned to me"
          value={assigned.length}
          detail="Across all statuses"
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Pending review"
          value={
            assigned.filter((item) =>
              ["Submitted", "Under Review", "Assigned"].includes(item.status),
            ).length
          }
          detail="Requires your attention"
          icon={Clock3}
          tone="orange"
        />
        <StatCard
          label="In progress"
          value={
            assigned.filter((item) => item.status === "In Progress").length
          }
          detail="Currently underway"
          icon={Siren}
          tone="purple"
        />
        <StatCard
          label="Resolved"
          value={assigned.filter((item) => item.status === "Resolved").length}
          detail="Successfully closed"
          icon={CheckCircle2}
          tone="green"
        />
      </div>
      <div className="dashboard-split">
        <section className="panel recent-panel">
          <div className="panel-header">
            <div>
              <h2>Recent assigned cases</h2>
              <p>Cases waiting for an update from you.</p>
            </div>
            <Link to="/officer/complaints" className="inline-link">
              View case queue <ArrowRight size={15} />
            </Link>
          </div>
          <ComplaintTable
            complaints={assigned.slice(0, 4)}
            departments={departments}
            onSelect={(item) =>
              navigate("/officer/complaints", {
                state: { complaintId: item.id },
              })
            }
            actionLabel="Manage"
          />
        </section>
        <section className="panel priority-panel">
          <div className="panel-header">
            <div>
              <h2>Priority distribution</h2>
              <p>Your current workload by priority.</p>
            </div>
          </div>
          <div className="priority-bars">
            {priorityData.map(({ priority, count }) => (
              <div className="priority-bar-row" key={priority}>
                <div>
                  <PriorityBadge priority={priority} />
                  <span>{count} cases</span>
                </div>
                <div className="bar-track">
                  <i
                    className={`bar-${priority.toLowerCase()}`}
                    style={{ width: `${Math.max(count * 25, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="priority-note">
            <span className="live-dot" />
            Queue updated just now
          </div>
        </section>
      </div>
      <section className="panel officer-tip">
        <div className="tip-icon">
          <FileCheck2 size={20} />
        </div>
        <div>
          <strong>Clear notes help everyone.</strong>
          <p>
            When updating a case, include what was done and what residents
            should expect next.
          </p>
        </div>
        <Link to="/officer/complaints" className="text-button">
          Go to cases <ArrowRight size={15} />
        </Link>
      </section>
    </>
  );
}

export function AdminDashboard() {
  const { complaints, departments } = useApp();
  const [selected, setSelected] = useState(null);
  const categories = useMemo(
    () =>
      departments.map((dept, index) => ({
        name: dept.short,
        value: complaints.filter((item) => item.departmentId === dept.id)
          .length,
        fill: chartColors[index % chartColors.length],
      })),
    [complaints, departments],
  );
  return (
    <>
      <PageHeader
        eyebrow="SYSTEM OVERVIEW"
        title="Good morning, Admin."
        description="Here's what's happening across your civic services today."
        action={
          <Link to="/admin/analytics" className="button button-outline">
            View reports <ArrowUpRight size={16} />
          </Link>
        }
      />
      <div className="stat-grid four">
        <StatCard
          label="Total complaints"
          value={complaints.length + 1240}
          detail="Across all departments"
          icon={FileText}
          tone="blue"
          change="↑ 12%"
        />
        <StatCard
          label="Open complaints"
          value={
            complaints.filter(
              (item) => !["Resolved", "Rejected"].includes(item.status),
            ).length + 87
          }
          detail="Awaiting resolution"
          icon={Clock3}
          tone="orange"
          change="↑ 8%"
        />
        <StatCard
          label="Resolved this month"
          value={
            complaints.filter((item) => item.status === "Resolved").length + 164
          }
          detail="Across all departments"
          icon={CheckCircle2}
          tone="green"
          change="↑ 18%"
        />
        <StatCard
          label="Avg. resolution time"
          value="2.4 days"
          detail="Mock data · last 30 days"
          icon={Siren}
          tone="purple"
          change="↓ 0.6d"
        />
      </div>
      <div className="chart-grid admin-charts">
        <section className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h2>Complaints over time</h2>
              <p>Monthly submissions and resolutions</p>
            </div>
            <span className="chart-period">
              Last 6 months <span>⌄</span>
            </span>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthData}
                margin={{ top: 15, right: 10, bottom: 0, left: -18 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#edf0f4"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8b95a7", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8b95a7", fontSize: 11 }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="filed"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-blue" />
              Submitted
            </span>
            <span>
              <i className="legend-green" />
              Resolved
            </span>
          </div>
        </section>
        <section className="panel chart-panel distribution-panel">
          <div className="panel-header">
            <div>
              <h2>By department</h2>
              <p>Open cases by service area</p>
            </div>
            <Link to="/admin/analytics" className="icon-link">
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="value"
                  innerRadius={57}
                  outerRadius={78}
                  paddingAngle={4}
                  stroke="none"
                >
                  {categories.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-label">
              <strong>{complaints.length + 87}</strong>
              <span>open cases</span>
            </div>
          </div>
          <div className="department-legend">
            {categories.slice(0, 4).map((item) => (
              <span key={item.name}>
                <i style={{ background: item.fill }} />
                {item.name}
                <b>{item.value}</b>
              </span>
            ))}
          </div>
        </section>
      </div>
      <div className="dashboard-bottom">
        <section className="panel recent-panel">
          <div className="panel-header">
            <div>
              <h2>Latest complaints</h2>
              <p>Most recently submitted reports across all areas.</p>
            </div>
            <Link to="/admin/complaints" className="inline-link">
              All complaints <ArrowRight size={15} />
            </Link>
          </div>
          <ComplaintTable
            complaints={complaints.slice(0, 4)}
            departments={departments}
            onSelect={setSelected}
          />
        </section>
        <section className="panel performance-panel">
          <div className="panel-header">
            <div>
              <h2>Department performance</h2>
              <p>Resolution rate this month</p>
            </div>
          </div>
          {departments.slice(0, 4).map((dept, index) => (
            <div className="performance-row" key={dept.id}>
              <div>
                <span
                  className="department-dot"
                  style={{ background: chartColors[index] }}
                />
                <strong>{dept.short}</strong>
                <span>{[92, 84, 78, 67][index]}%</span>
              </div>
              <div className="bar-track">
                <i
                  style={{
                    width: `${[92, 84, 78, 67][index]}%`,
                    background: chartColors[index],
                  }}
                />
              </div>
            </div>
          ))}
          <Link className="inline-link performance-link" to="/admin/analytics">
            Full performance report <ArrowRight size={14} />
          </Link>
        </section>
      </div>
      {selected && (
        <ComplaintDetails
          complaint={selected}
          departments={departments}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

export function AnalyticsPage() {
  const { complaints, departments } = useApp();
  const grouped = departments.map((dept, index) => ({
    name: dept.short,
    submitted:
      complaints.filter((item) => item.departmentId === dept.id).length +
      [6, 8, 5, 7, 4][index % 5],
    resolved:
      complaints.filter(
        (item) => item.departmentId === dept.id && item.status === "Resolved",
      ).length + 4,
  }));
  const priority = ["Critical", "High", "Medium", "Low"].map((name) => ({
    name,
    count:
      complaints.filter((item) => item.priority === name).length +
      { Critical: 14, High: 22, Medium: 31, Low: 9 }[name],
  }));
  const resolution = [
    { name: "Resolved", value: 164, fill: "#16a34a" },
    { name: "Pending", value: 87, fill: "#f59e0b" },
    { name: "In progress", value: 48, fill: "#2563eb" },
  ];
  return (
    <>
      <PageHeader
        eyebrow="INSIGHTS & REPORTING"
        title="Analytics"
        description="A clearer picture of how public services are performing."
        action={
          <button
            className="button button-outline"
            onClick={() => window.print()}
          >
            Export report <ArrowUpRight size={16} />
          </button>
        }
      />
      <div className="stat-grid four">
        <StatCard
          label="Reports received"
          value="1,240"
          detail="This month"
          icon={FileText}
          tone="blue"
          change="↑ 12%"
        />
        <StatCard
          label="Resolution rate"
          value="78.4%"
          detail="Last 30 days"
          icon={CheckCircle2}
          tone="green"
          change="↑ 5.2%"
        />
        <StatCard
          label="Average response"
          value="4.2 hrs"
          detail="Time to first review"
          icon={Clock3}
          tone="purple"
          change="↓ 18%"
        />
        <StatCard
          label="Active officers"
          value="38"
          detail="Across 5 departments"
          icon={Users}
          tone="orange"
        />
      </div>
      <div className="chart-grid analytics-grid">
        <section className="panel chart-panel wide-chart">
          <div className="panel-header">
            <div>
              <h2>Complaint trends</h2>
              <p>Submitted and resolved reports · last six months</p>
            </div>
          </div>
          <div className="chart-area tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData} barGap={7}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#edf0f4"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8b95a7", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8b95a7", fontSize: 11 }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="filed"
                  name="Submitted"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="resolved"
                  name="Resolved"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h2>Resolution status</h2>
              <p>Current case distribution</p>
            </div>
          </div>
          <div className="donut-wrap analytic-donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolution}
                  dataKey="value"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={4}
                  stroke="none"
                >
                  {resolution.map((item) => (
                    <Cell key={item.name} fill={item.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-label">
              <strong>299</strong>
              <span>total cases</span>
            </div>
          </div>
          <div className="department-legend">
            {resolution.map((item) => (
              <span key={item.name}>
                <i style={{ background: item.fill }} />
                {item.name}
                <b>{item.value}</b>
              </span>
            ))}
          </div>
        </section>
        <section className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h2>By department</h2>
              <p>Submitted and resolved</p>
            </div>
          </div>
          <div className="chart-area tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grouped} layout="vertical" barGap={2}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#edf0f4"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8b95a7", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#687386", fontSize: 11 }}
                  width={76}
                />
                <Tooltip />
                <Bar
                  dataKey="submitted"
                  name="Submitted"
                  fill="#93c5fd"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="resolved"
                  name="Resolved"
                  fill="#2563eb"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h2>Priority levels</h2>
              <p>Current reports by urgency</p>
            </div>
          </div>
          <div className="chart-area tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priority} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#edf0f4"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8b95a7", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#687386", fontSize: 11 }}
                  width={68}
                />
                <Tooltip />
                <Bar dataKey="count" name="Complaints" radius={[0, 4, 4, 0]}>
                  {priority.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={["#dc2626", "#f97316", "#eab308", "#22c55e"][index]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <div className="data-note">
        Report figures include sample demonstration data for interface preview.
      </div>
    </>
  );
}
