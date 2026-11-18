import type { FC } from "react";
import type { OnboardingGlow } from "./onboarding-modal";

/** Everything the user has told us so far. Steps read and patch this. */
export interface OnboardingDraft {
    website: string;
    category: string | null;
    oneLiner: string;
    audience: string | null;
    goals: string[];
    assets: { name: string; size: number; type: string }[];
    /** Social platforms connected on the review step, e.g. "instagram". */
    channels: string[];
}

export const initialDraft: OnboardingDraft = {
    website: "",
    category: null,
    oneLiner: "",
    audience: null,
    goals: [],
    assets: [],
    channels: ["instagram", "facebook", "youtube"],
};

export interface StepProps {
    draft: OnboardingDraft;
    update: (patch: Partial<OnboardingDraft>) => void;
    /** Go to the next step in STEP_ORDER. */
    next: () => void;
    /** Go to the previous step in STEP_ORDER. */
    back: () => void;
    goTo: (id: StepId) => void;
    /** Show a transient toast (prototype-only feedback for unbuilt actions). */
    notify: (message: string) => void;
}

export interface StepDefinition {
    id: StepId;
    /** Accessible dialog name, e.g. "New brand: business category". */
    ariaLabel: string;
    /** 0 Client · 1 Brand & social · 2 Competitors & trends */
    phase: number;
    /** 0–1 fill of the active phase bar, read from the Figma "Fill" width / 192. */
    phaseFill: number;
    glow: OnboardingGlow;
    topFade?: boolean;
    /** Set false for screens that render their own full-bleed layout without the shared header (e.g. the final "ready" screen). */
    chrome?: boolean;
    /** Override the modal box size/radius, e.g. "h-[712px] w-[1120px] rounded-[20px] sm:rounded-[20px]" for the final screen. */
    modalClassName?: string;
    /** Top-right button label. Defaults to "Save and exit"; research shows "Run in background". */
    saveLabel?: string;
    Component: FC<StepProps>;
}

export const STEP_ORDER = [
    "website",
    "category",
    "audience",
    "goals",
    "assets",
    "research",
    "review",
    "competitors",
    "trends",
    "ready",
] as const;

export type StepId = (typeof STEP_ORDER)[number];
