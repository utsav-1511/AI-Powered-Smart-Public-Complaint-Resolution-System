// Demo-only classifier. Replace this function with an AI service request when a backend is available.
const rules = [
  {
    words: ["pothole", "road", "footpath", "crack"],
    category: "Roads & Infrastructure",
    department: "Public Works Department",
    priority: "High",
  },
  {
    words: ["garbage", "waste", "rubbish", "collection"],
    category: "Waste Management",
    department: "Sanitation Department",
    priority: "Medium",
  },
  {
    words: ["water", "leak", "pipe", "supply"],
    category: "Water Supply",
    department: "Water Supply Department",
    priority: "High",
  },
  {
    words: ["drain", "sewage", "flood", "blocked"],
    category: "Drainage & Sewage",
    department: "Drainage Department",
    priority: "Critical",
  },
  {
    words: ["light", "electricity", "power", "streetlight"],
    category: "Street Lighting",
    department: "Electricity Department",
    priority: "Medium",
  },
];
export function analyzeComplaint(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const match = rules.find((rule) =>
    rule.words.some((word) => text.includes(word)),
  );
  return match
    ? { ...match, confidence: 92 }
    : {
        category: "Other",
        department: "Public Works Department",
        priority: "Medium",
        confidence: 71,
      };
}
