import { SOCIAL_ACCOUNTS, type SocialPlatform } from "./review-data";

/** Options for the "Platform" select in the Add handle popover (Figma 8933:12625). */
export const PLATFORM_OPTIONS = SOCIAL_ACCOUNTS.map((a) => ({ id: a.platform, label: a.platformName }));

/** Audience shown once a handle the user added has been verified (Figma Socials · Found · 05). */
export const VERIFIED_AUDIENCE: Record<SocialPlatform, string> = {
    instagram: "12.4K followers",
    facebook: "3.1K followers",
    youtube: "860 subscribers",
    linkedin: "540 followers",
    x: "1.2K followers",
    tiktok: "2.3K followers",
};

/** Facebook Pages offered when connecting Facebook (Figma Socials · Channels · 03). */
export const FACEBOOK_PAGES = [
    { id: "brewbloom-coffee", name: "Brewbloom Coffee", audience: "3.1K followers" },
    { id: "brewbloom-mumbai", name: "Brewbloom Mumbai", audience: "420 followers" },
];

/** Prototype: these platforms fail their first connect attempt so the "Couldn't connect" + Retry state is reachable (Figma Channels · 05). */
export const FAILS_FIRST_ATTEMPT: SocialPlatform[] = ["youtube"];

/** Simulated network delays. */
export const VERIFY_MS = 1400;
export const CONNECT_MS = 1400;
