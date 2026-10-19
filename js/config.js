/**
 * @typedef {{ id: string, label: string, c1: string, c2: string }} Role
 * @typedef {{ label: string, w: number, h: number, ratio: string }} Layout
 */

export const C = {
  primary: "#00E5FF",
  secondary: "#7B61FF",
  accent: "#00FF88",
  bg: "#070B14",
  card: "#101827",
  muted: "#94A3B8",
  white: "#FFFFFF",
};

/** @type {Role[]} */
export const ROLES = [
  { id: "developer", label: "Developer", c1: C.primary, c2: C.secondary },
  { id: "ai-engineer", label: "AI Engineer", c1: C.secondary, c2: C.accent },
  { id: "quantum-engineer", label: "Quantum Engineer", c1: C.accent, c2: C.primary },
  { id: "researcher", label: "Researcher", c1: C.primary, c2: C.accent },
  { id: "instructor", label: "Instructor", c1: C.secondary, c2: C.primary },
  { id: "core-team", label: "Core Team", c1: C.accent, c2: C.secondary },
  { id: "community-leader", label: "Community Leader", c1: C.primary, c2: C.secondary },
  { id: "cybersecurity", label: "Cybersecurity Specialist", c1: C.secondary, c2: C.accent },
  { id: "cloud-engineer", label: "Cloud Engineer", c1: C.accent, c2: C.primary },
  { id: "blockchain", label: "Blockchain Developer", c1: C.primary, c2: C.accent },
  { id: "data-scientist", label: "Data Scientist", c1: C.secondary, c2: C.primary },
  { id: "iot-engineer", label: "IoT Engineer", c1: C.accent, c2: C.secondary },
  { id: "software-engineer", label: "Software Engineer", c1: C.primary, c2: C.secondary },
  { id: "mentor", label: "Mentor", c1: C.secondary, c2: C.accent },
  { id: "volunteer", label: "Volunteer", c1: C.accent, c2: C.primary },
  { id: "oss-contributor", label: "Open Source Contributor", c1: C.primary, c2: C.accent },
  { id: "partner", label: "Partner", c1: C.secondary, c2: C.primary },
];

/** @type {Record<string, Layout>} */
export const LAYOUTS = {
  square: { label: "Square", w: 1080, h: 1080, ratio: "1 / 1" },
  story: { label: "Portrait (Story)", w: 1080, h: 1920, ratio: "9 / 16" },
  linkedin: { label: "Landscape (LinkedIn)", w: 1200, h: 630, ratio: "1200 / 630" },
};

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
export const STORAGE_KEY = "zuntenium-badge-form";
export const LOGO_SRC = "assets/zuntenium-logo.jpg";

export const DEFAULTS = {
  roleId: "developer",
  name: "Amara Okafor",
  country: "Nigeria",
  org: "Zuntenium Labs",
  github: "amaraokafor",
  quote: "Building Africa's Deep Tech Future.",
  layout: "square",
};

/**
 * @param {string} str
 * @returns {string}
 */
export function hashId(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return `ZTN-${h.toString(36).toUpperCase().padStart(6, "0").slice(0, 6)}`;
}

/**
 * @param {string} hex
 * @param {number} a
 */
export function hexToRgba(hex, a) {
  const v = hex.replace("#", "");
  const r = parseInt(v.substring(0, 2), 16);
  const g = parseInt(v.substring(2, 4), 16);
  const b = parseInt(v.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * @param {Role} role
 */
export function defaultCaption(role) {
  return `🚀 Proud to be an Official Zuntenium ${role.label}.\n\nTogether we're building Africa's future in AI, Quantum Computing, and Deep Technology.\n\n#Zuntenium #ArtificialIntelligence #QuantumComputing #OpenSource #AfricaTech #Innovation`;
}

/**
 * @param {string} name
 */
export function slugify(name) {
  return (name || "contributor")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}
