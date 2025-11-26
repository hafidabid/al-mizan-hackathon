import React from "react";

export interface MaqasidInfo {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

// Maqasid Objectives with Educational Descriptions
export const MAQASID: Record<string, MaqasidInfo> = {
  DIN: {
    id: "din",
    label: "Hifz al-Din (Agama)",
    desc: "Memelihara kebebasan beragama dan nilai-nilai spiritual masyarakat.",
    icon: null, // will be instantiated in component or we need a way to store icon reference
  },
  NAFS: {
    id: "nafs",
    label: "Hifz al-Nafs (Jiwa)",
    desc: "Menjamin hak dasar untuk hidup, kesehatan, dan keselamatan fisik.",
    icon: null,
  },
  AQL: {
    id: "aql",
    label: "Hifz al-Aql (Akal)",
    desc: "Mendukung pengembangan intelektual dan akses pendidikan berkualitas.",
    icon: null,
  },
  NASL: {
    id: "nasl",
    label: "Hifz al-Nasl (Keturunan)",
    desc: "Menjaga keberlangsungan generasi masa depan yang sehat dan produktif.",
    icon: null,
  },
  MAL: {
    id: "mal",
    label: "Hifz al-Mal (Harta)",
    desc: "Mendorong perputaran ekonomi yang adil dan pengentasan kemiskinan.",
    icon: null,
  },
  BIAH: {
    id: "biah",
    label: "Hifz al-Bi'ah (Lingkungan)",
    desc: "Menjaga kelestarian alam sebagai amanah untuk generasi mendatang.",
    icon: null,
  },
};

// SDG Educational Dictionary
export const SDG_DETAILS: Record<number, { title: string; desc: string }> = {
  1: {
    title: "Tanpa Kemiskinan",
    desc: "Mengakhiri kemiskinan dalam segala bentuk dimanapun.",
  },
  2: {
    title: "Tanpa Kelaparan",
    desc: "Menghilangkan kelaparan, mencapai ketahanan pangan dan gizi yang baik.",
  },
  4: {
    title: "Pendidikan Berkualitas",
    desc: "Menjamin kualitas pendidikan yang inklusif dan merata serta kesempatan belajar.",
  },
  7: {
    title: "Energi Bersih",
    desc: "Menjamin akses energi yang terjangkau, andal, berkelanjutan, dan modern.",
  },
  9: {
    title: "Industri & Inovasi",
    desc: "Membangun infrastruktur tangguh dan mempromosikan industrialisasi berkelanjutan.",
  },
  13: {
    title: "Penanganan Perubahan Iklim",
    desc: "Mengambil tindakan cepat untuk memerangi perubahan iklim dan dampaknya.",
  },
};

// Available SDGs for Filter
export const AVAILABLE_SDGS = [1, 2, 4, 7, 9, 13];

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface Project {
  id: string; // Changed to string to match PocketBase ID
  title: string;
  location: Location;
  sdgs: number[];
  maqasid: string[];
  type: string;
  verified: boolean;
  image?: string;
  quickMetrics: {
    needed: number;
    allocation: string;
    beneficiaries: number;
    timeline: string;
  };
  metrics: {
    co2Yearly: number;
    energyMWh: number;
    trees: number;
    jobs: { construction: number; ops: number };
    sroi: number;
    irr: number;
    multiplier: number;
  };
}

export const projectsData: Project[] = []; // Replaced by API call
// Old mock data removed for clarity, interfaces kept for type safety

// View 2: Live Tracking Data
export const liveImpactData = [
  { time: "08:00", energy: 120, co2: 50 },
  { time: "10:00", energy: 280, co2: 110 },
  { time: "12:00", energy: 450, co2: 190 },
  { time: "14:00", energy: 390, co2: 160 },
  { time: "16:00", energy: 200, co2: 85 },
];

export const allocationSplit = [
  // { name: "Waqf (Endowment)", value: 60, color: "#10B981" }, // Green-500
  // { name: "Zakat (Direct)", value: 40, color: "#F59E0B" }, // Amber-500
];

// Live Updates Data
export interface ProjectUpdate {
  id: number;
  time: string;
  title: string;
  desc: string;
  iconName: "Sun" | "Droplets" | "Sprout";
  color: string;
}

export const projectUpdates: ProjectUpdate[] = [
  {
    id: 1,
    time: "10m ago",
    title: "Solar Panel NTB",
    desc: "Generated 45kWh today. Efficiency 98%.",
    iconName: "Sun",
    color: "green",
  },
  {
    id: 2,
    time: "2h ago",
    title: "Gunung Kidul Well",
    desc: "Sensor confirms 500L pumped.",
    iconName: "Droplets",
    color: "blue",
  },
  {
    id: 3,
    time: "5h ago",
    title: "Cianjur Paddy Field",
    desc: "Soil moisture optimal (65%).",
    iconName: "Sprout",
    color: "amber",
  },
];

// Verification Data
export const verificationMetrics = {
  reportedArea: 10,
  verifiedArea: 9.8,
  matchPercentage: 98,
  co2Reduction: 2000,
};
