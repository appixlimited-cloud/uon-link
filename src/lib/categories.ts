export const EVENT_CATEGORIES = [
  "Academic",
  "Career",
  "Tech",
  "Sports",
  "Entertainment",
  "Culture",
  "Uni Vibe",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const CATEGORY_COLOR: Record<string, string> = {
  Academic: "bg-cat-academic text-white",
  Career: "bg-cat-career text-white",
  Tech: "bg-cat-tech text-white",
  Sports: "bg-cat-sports text-white",
  Entertainment: "bg-cat-entertainment text-white",
  Culture: "bg-cat-culture text-white",
  "Uni Vibe": "bg-cat-univibe text-white",
};

export const CATEGORY_DOT: Record<string, string> = {
  Academic: "bg-cat-academic",
  Career: "bg-cat-career",
  Tech: "bg-cat-tech",
  Sports: "bg-cat-sports",
  Entertainment: "bg-cat-entertainment",
  Culture: "bg-cat-culture",
  "Uni Vibe": "bg-cat-univibe",
};

export const FACULTIES = ["Arts", "Science", "Engineering", "Medicine", "Law", "Commerce", "Education", "Other"] as const;
export const YEARS = ["First Year", "Second Year", "Third Year", "Fourth Year", "Postgraduate"] as const;
export const INTERESTS = ["Academic", "Career", "Tech", "Sports", "Entertainment", "Culture", "Uni Vibe"] as const;

export const OPPORTUNITY_TYPES = ["Internship", "Scholarship", "Competition", "Volunteer", "Job", "Workshop"] as const;
export const OPPORTUNITY_TYPE_COLOR: Record<string, string> = {
  Internship: "bg-success text-success-foreground",
  Scholarship: "bg-cat-tech text-white",
  Competition: "bg-cat-entertainment text-white",
  Volunteer: "bg-cat-sports text-white",
  Job: "bg-primary text-primary-foreground",
  Workshop: "bg-cat-culture text-white",
};

export const NOTICE_CATEGORIES = ["Academic", "Lost and Found", "Accommodation", "Items for Sale", "Study Groups", "General"] as const;
