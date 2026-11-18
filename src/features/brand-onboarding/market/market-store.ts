import { useSyncExternalStore } from "react";
import logoBlueTokai from "@/assets/market/logo-blue-tokai.svg";
import logoRage from "@/assets/market/logo-rage.svg";
import logoSleepyOwl from "@/assets/market/logo-sleepy-owl.svg";
import logoThirdWave from "@/assets/market/logo-third-wave.svg";
import logoBlueTokaiSm from "@/assets/market/r-logo-blue-tokai-sm.svg";
import logoSleepyOwlSm from "@/assets/market/r-logo-sleepy-owl-sm.svg";
import logoThirdWaveSm from "@/assets/market/r-logo-third-wave-sm.svg";
import logoSubko from "@/assets/market/c-logo-subko.svg";

export type SocialPlatform = "instagram" | "facebook" | "youtube";

export interface Competitor {
    id: string;
    name: string;
    website: string;
    /** 40px list logo (Figma export). Missing for competitors the user adds — they get initials. */
    logo?: string;
    /** 32px logo used in the "ready" summary stack. */
    logoSm?: string;
    socials: SocialPlatform[];
    /** Handles shown in the Edit competitor dialog (Figma 8940:14034). */
    instagram?: string;
    facebook?: string;
    /** True while the simulated website lookup runs (Figma "Competitors · 04 · Finding"). */
    finding?: boolean;
    kept: boolean;
}

export type TrendIcon = "trend-up" | "sunrise" | "sun" | "heart";

export interface Trend {
    id: string;
    title: string;
    meta: string;
    /** Short label for the summary card, e.g. "cold brew". */
    short: string;
    icon: TrendIcon;
    kept: boolean;
}

interface MarketState {
    competitors: Competitor[];
    trends: Trend[];
}

/** Seed data — copy from Figma 72:5680 / 72:5871. */
let state: MarketState = {
    competitors: [
        {
            id: "blue-tokai",
            name: "Blue Tokai Coffee Roasters",
            website: "bluetokaicoffee.com",
            logo: logoBlueTokai,
            logoSm: logoBlueTokaiSm,
            socials: ["instagram", "facebook", "youtube"],
            instagram: "@bluetokaicoffee",
            facebook: "bluetokaicoffee",
            kept: true,
        },
        {
            id: "third-wave",
            name: "Third Wave Coffee",
            website: "thirdwavecoffeeroasters.com",
            logo: logoThirdWave,
            logoSm: logoThirdWaveSm,
            socials: ["instagram", "facebook"],
            instagram: "@thirdwavecoffeeroasters",
            facebook: "thirdwavecoffeeroasters",
            kept: true,
        },
        {
            id: "sleepy-owl",
            name: "Sleepy Owl Coffee",
            website: "sleepyowl.co",
            logo: logoSleepyOwl,
            logoSm: logoSleepyOwlSm,
            socials: ["instagram", "facebook", "youtube"],
            instagram: "@sleepyowlcoffee",
            facebook: "sleepyowlcoffee",
            kept: true,
        },
        { id: "rage", name: "Rage Coffee", website: "ragecoffee.com", logo: logoRage, socials: ["instagram"], instagram: "@ragecoffee", kept: false },
    ],
    trends: [
        { id: "cold-brew", title: "Cold brew at home", meta: "Rising · searches up 38% in 90 days", short: "cold brew", icon: "trend-up", kept: false },
        { id: "slow-morning", title: "Slow-morning rituals", meta: "Rising · 2.1M Reels this month", short: "slow mornings", icon: "sunrise", kept: false },
        { id: "filter-coffee", title: "Filter coffee revival", meta: "Steady · strongest in Bengaluru and Chennai", short: "filter coffee", icon: "sun", kept: false },
        { id: "wellness", title: "Coffee for wellness", meta: "Peaking · mushroom and adaptogen blends", short: "wellness", icon: "heart", kept: false },
    ],
};

const listeners = new Set<() => void>();

const set = (patch: Partial<MarketState>) => {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
};

/**
 * Competitors & trends picked in this flow. Kept outside OnboardingDraft (flow.ts is shared) so the
 * selection survives Back/Continue and the final "ready" summary can read it.
 */
export const useMarket = () => useSyncExternalStore(subscribe, () => state);

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);

/** Accepts "subko.coffee", "www.subko.coffee", "https://subko.coffee/shop" — anything with a host and a TLD. */
const WEBSITE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;

export const isValidWebsite = (input: string) => WEBSITE.test(input.trim());

/** "https://www.Subko.coffee/shop" → "subko.coffee" */
export const normalizeWebsite = (input: string) =>
    input
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, "");

/**
 * Stand-in for the competitor lookup service. Known brands resolve to a full profile (Figma "Competitors · 05 · Added");
 * any other valid website resolves to a bare entry named after its domain.
 */
const DIRECTORY: Omit<Competitor, "id" | "kept">[] = [
    { name: "Subko", website: "subko.coffee", logo: logoSubko, socials: ["instagram"], instagram: "@subko.coffee" },
];

/** Directory entries matching what the user is typing, minus ones already in the list. */
export const suggestCompetitors = (query: string) => {
    const q = query.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");
    if (q.length < 2) return [];
    return DIRECTORY.filter(
        (d) => (d.name.toLowerCase().startsWith(q) || d.website.startsWith(q)) && !state.competitors.some((c) => c.website === d.website),
    );
};

/** Simulated lookup latency for the "Finding" row. */
const LOOKUP_MS = 1400;

const patchCompetitor = (id: string, patch: Partial<Competitor>) =>
    set({ competitors: state.competitors.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

export const marketActions = {
    toggleCompetitor: (id: string, kept: boolean) => patchCompetitor(id, { kept }),
    /**
     * Add flow: Add → Finding → Added. Call only with a valid website (see `isValidWebsite`). Adding a website that is
     * already listed just re-selects that row.
     */
    lookupCompetitor: (input: string) => {
        const website = normalizeWebsite(input);
        const existing = state.competitors.find((c) => c.website === website);
        if (existing) {
            if (!existing.finding) patchCompetitor(existing.id, { kept: true });
            return;
        }
        const id = slug(website);
        // While finding, the row is not kept so the "ready" summary and the Continue count ignore it.
        set({ competitors: [...state.competitors, { id, name: website, website, socials: [], finding: true, kept: false }] });
        setTimeout(() => {
            const found = DIRECTORY.find((d) => d.website === website);
            const stem = website.split(".")[0];
            const fallback = { name: stem.replace(/(^|-)\w/g, (m) => m.toUpperCase()).replace(/-/g, " "), website, socials: [] };
            patchCompetitor(id, { ...(found ?? fallback), finding: false, kept: true });
        }, LOOKUP_MS);
    },
    /** Edit competitor dialog → Save. Socials follow the handles; YouTube (not editable here) is preserved. */
    updateCompetitor: (id: string, patch: Pick<Competitor, "name" | "website" | "instagram" | "facebook"> & { logo?: string }) => {
        const current = state.competitors.find((c) => c.id === id);
        if (!current) return;
        const socials: SocialPlatform[] = [];
        if (patch.instagram?.trim()) socials.push("instagram");
        if (patch.facebook?.trim()) socials.push("facebook");
        if (current.socials.includes("youtube")) socials.push("youtube");
        patchCompetitor(id, {
            name: patch.name.trim(),
            website: normalizeWebsite(patch.website),
            instagram: patch.instagram?.trim() || undefined,
            facebook: patch.facebook?.trim() || undefined,
            socials,
            // A replaced logo is used everywhere, including the 32px "ready" stack.
            ...(patch.logo && patch.logo !== current.logo ? { logo: patch.logo, logoSm: undefined } : {}),
        });
    },
    toggleTrend: (id: string, kept: boolean) => set({ trends: state.trends.map((t) => (t.id === id ? { ...t, kept } : t)) }),
    addTrend: (input: string) => {
        const title = input.trim();
        set({ trends: [...state.trends, { id: slug(title), title, meta: "Added by you", short: title.toLowerCase(), icon: "trend-up", kept: true }] });
    },
};
