import { useSyncExternalStore } from "react";
import { BRAND } from "./review-data";

/**
 * Saved values for the Review step's Brand / Audience / Voice panels.
 * Module-level so edits survive Back / Continue within the session (the onboarding draft has no brand fields).
 */

export interface BrandValues {
    name: string;
    domain: string;
    /** Logo image URL; null = removed / not found. "default" = the researched logo. */
    logo: string | null;
    colours: string[];
    category: string;
    market: string;
    language: string;
}

export interface AudienceValues {
    whoBuys: string[];
    ageFrom: string;
    ageTo: string;
    gender: string;
    locations: string[];
    interests: string[];
}

export interface VoiceValues {
    tone: string[];
    line: string;
    use: string[];
    avoid: string[];
}

export type EditableSection = "brand" | "audience" | "voice";

export const DEFAULT_LOGO = "default";

export const INITIAL_BRAND: BrandValues = {
    name: BRAND.legalName,
    domain: BRAND.domain,
    logo: DEFAULT_LOGO,
    colours: ["#307EC4", "#F5F2EB", "#27AD5C", "#EA712F"],
    category: BRAND.category,
    market: BRAND.market,
    language: BRAND.language,
};

export const INITIAL_AUDIENCE: AudienceValues = {
    whoBuys: ["Young professionals", "Home brewers", "Students"],
    ageFrom: "22",
    ageTo: "35",
    gender: "All",
    locations: ["Mumbai", "Bengaluru", "Delhi"],
    interests: ["Specialty coffee", "Café hopping", "Wellness"],
};

export const INITIAL_VOICE: VoiceValues = {
    tone: ["Warm", "Crafted", "Unhurried"],
    line: "Slow mornings, properly good coffee.",
    use: ["slow", "small-batch", "ritual"],
    avoid: ["cheap", "instant", "hustle"],
};

interface ReviewEdits {
    brand: BrandValues;
    audience: AudienceValues;
    voice: VoiceValues;
    /** Sections the user has saved at least once ("Edited by you"). */
    edited: Record<EditableSection, boolean>;
}

let state: ReviewEdits = {
    brand: INITIAL_BRAND,
    audience: INITIAL_AUDIENCE,
    voice: INITIAL_VOICE,
    edited: { brand: false, audience: false, voice: false },
};
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const useReviewEdits = () => useSyncExternalStore(subscribe, () => state);

export function saveSection<S extends EditableSection>(section: S, values: ReviewEdits[S]) {
    state = { ...state, [section]: values, edited: { ...state.edited, [section]: true } };
    listeners.forEach((l) => l());
}

/** Options for the edit-mode selects and "add" menus (copy from the Figma edit states where shown). */
export const OPTIONS = {
    category: ["Apps and software", "Beverages", "Food and drink", "Cafés and restaurants", "Packaged food", "Retail"],
    market: ["India", "United States", "United Kingdom", "United Arab Emirates", "Singapore"],
    language: ["English", "Hindi", "Marathi", "Kannada", "Tamil"],
    ageFrom: ["18", "22", "25", "30", "35"],
    ageTo: ["30", "35", "40", "45", "50+"],
    gender: ["All", "Women", "Men"],
    whoBuys: ["Remote workers", "Remote-first teams", "Work-from-café crowd", "Young professionals", "Home brewers", "Students", "Gift buyers"],
    locations: ["Mumbai", "Bengaluru", "Delhi", "Pune", "Hyderabad", "Chennai", "Kolkata"],
    interests: ["Specialty coffee", "Café hopping", "Wellness", "Home brewing", "Sustainability", "Books", "Remote work"],
    tone: ["Playful", "Plainspoken", "Placid", "Warm", "Crafted", "Unhurried", "Bold", "Friendly", "Confident"],
    words: ["slow", "small-batch", "ritual", "fresh", "crafted", "origin", "roast"],
    avoidWords: ["cheap", "instant", "hustle", "fast", "discount", "basic"],
} as const;

export const BRAND_LINE_MAX = 120;

/** Figma "Colour tray" (utility-*-500 tokens). */
export const COLOUR_TRAY = ["#F04438", "#EF6820", "#F79009", "#EAAA08", "#16B364", "#2E90FA", "#6172F3", "#7A5AF8", "#D444F1", "#EE46BC", "#717680", "#181D27"];
/** Figma "From aftershoot.com" suggestions in the colour picker. */
export const WEBSITE_COLOURS = ["#EA712F", "#F5F2EB", "#2B2B2B"];

export const isValidWebsite = (value: string) => /^([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "www."));

export const sameValues = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
