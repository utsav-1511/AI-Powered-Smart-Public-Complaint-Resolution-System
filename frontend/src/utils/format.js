export const dateFormat = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
export const relativeDate = (value) => {
  const days = Math.floor((Date.now() - new Date(value)) / 86400000);
  return days <= 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
};
export const departmentName = (departments, id) =>
  departments.find((department) => department.id === id)?.name || "Unassigned";
