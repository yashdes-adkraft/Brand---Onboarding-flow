import { useSyncExternalStore } from "react";
import type { SocialPlatform } from "./review-data";
import { FACEBOOK_PAGES, FAILS_FIRST_ATTEMPT, VERIFIED_AUDIENCE, VERIFY_MS } from "./socials-data";

/**
 * Session store for the Social accounts section: survives Back/Continue and section switches
 * (the connected channels themselves live in draft.channels).
 */
export interface AddedHandle {
    handle: string;
    /** "verifying" shows the spinner row (Found · 04); "found" shows the audience + checkbox (Found · 05). */
    status: "verifying" | "found";
    audience?: string;
}

interface SocialsState {
    selected: ReadonlySet<SocialPlatform>;
    added: Partial<Record<SocialPlatform, AddedHandle>>;
    facebookPageId: string;
    /** Platforms whose first (simulated) connect attempt has already failed. */
    failedOnce: ReadonlySet<SocialPlatform>;
}

let state: SocialsState = {
    selected: new Set<SocialPlatform>(["instagram", "facebook", "youtube"]),
    added: {},
    facebookPageId: FACEBOOK_PAGES[0].id,
    failedOnce: new Set(),
};

const listeners = new Set<() => void>();
const set = (patch: Partial<SocialsState>) => {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
};

export const socialsStore = {
    toggleSelected(platform: SocialPlatform, isSelected: boolean) {
        const selected = new Set(state.selected);
        if (isSelected) selected.add(platform);
        else selected.delete(platform);
        set({ selected });
    },
    /** Add a handle, show it as verifying, then mark it found and selected. */
    addHandle(platform: SocialPlatform, handle: string) {
        set({ added: { ...state.added, [platform]: { handle, status: "verifying" } } });
        window.setTimeout(() => {
            const current = state.added[platform];
            if (!current || current.handle !== handle) return;
            const selected = new Set(state.selected).add(platform);
            set({ added: { ...state.added, [platform]: { handle, status: "found", audience: VERIFIED_AUDIENCE[platform] } }, selected });
        }, VERIFY_MS);
    },
    setFacebookPage(id: string) {
        set({ facebookPageId: id });
    },
    /** Returns true when this attempt should fail (first attempt for FAILS_FIRST_ATTEMPT platforms). */
    consumeFailure(platform: SocialPlatform) {
        if (!FAILS_FIRST_ATTEMPT.includes(platform) || state.failedOnce.has(platform)) return false;
        set({ failedOnce: new Set(state.failedOnce).add(platform) });
        return true;
    },
};

const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
};

export const useSocialsStore = () => useSyncExternalStore(subscribe, () => state);
