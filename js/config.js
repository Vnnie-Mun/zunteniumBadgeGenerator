/**
 * @typedef {{ id: string, label: string, c1: string, c2: string }} Role
 * @typedef {{ label: string, w: number, h: number, ratio: string }} Layout
 */

export const C = {
  primary: "#D4AF37",
  secondary: "#F3E2A8",
  accent: "#E8C547",
  gold: "#D4AF37",
  goldSoft: "#E8D5A3",
  goldDeep: "#8C6A1A",
  bg: "#050505",
  card: "#0B0B0B",
  muted: "#A8A29A",
  white: "#F8F5EF",
};

/** @type {Role[]} */
export const ROLES = [
  { id: "developer", label: "Developer", c1: "#D4AF37", c2: "#F3E2A8" },
  { id: "ai-engineer", label: "AI Engineer", c1: "#E0B080", c2: "#F6E6C8" },
  { id: "quantum-engineer", label: "Quantum Engineer", c1: "#F0D060", c2: "#FFF6D8" },
  { id: "researcher", label: "Researcher", c1: "#C9A227", c2: "#E8D5A3" },
  { id: "instructor", label: "Instructor", c1: "#B8860B", c2: "#F3E2A8" },
  { id: "core-team", label: "Core Team", c1: "#F5D76E", c2: "#FFF8E7" },
  { id: "community-leader", label: "Community Leader", c1: "#D4AF37", c2: "#C9A66B" },
  { id: "cybersecurity", label: "Cybersecurity Specialist", c1: "#C4A35A", c2: "#F3E2A8" },
  { id: "cloud-engineer", label: "Cloud Engineer", c1: "#E6C35C", c2: "#FFF1C2" },
  { id: "blockchain", label: "Blockchain Developer", c1: "#DAA520", c2: "#F6E7B4" },
  { id: "data-scientist", label: "Data Scientist", c1: "#D4AF37", c2: "#E8C547" },
  { id: "iot-engineer", label: "IoT Engineer", c1: "#C9A227", c2: "#F3E2A8" },
  { id: "software-engineer", label: "Software Engineer", c1: "#D4AF37", c2: "#F8EDC8" },
  { id: "mentor", label: "Mentor", c1: "#E0B080", c2: "#F3E2A8" },
  { id: "volunteer", label: "Volunteer", c1: "#C9A66B", c2: "#F5E6C8" },
  { id: "oss-contributor", label: "Open Source Contributor", c1: "#D4AF37", c2: "#FFF6D8" },
  { id: "partner", label: "Partner", c1: "#F5D76E", c2: "#D4AF37" },
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
