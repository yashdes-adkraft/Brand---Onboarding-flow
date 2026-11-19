import facebook from "@/assets/review/facebook.svg";
import instagram from "@/assets/review/instagram.svg";
import linkedin from "@/assets/review/linkedin.svg";
import tiktok from "@/assets/review/tiktok.svg";
import xGray from "@/assets/review/x-gray.svg";
import x from "@/assets/review/x.svg";
import youtube from "@/assets/review/youtube.svg";

/** Prototype research results for Aftershoot (copy from the Figma "Review" frames). */
export const BRAND = {
    name: "Aftershoot",
    legalName: "Aftershoot Inc.",
    domain: "aftershoot.com",
    category: "Apps and software",
    market: "India",
    language: "English",
};

export type SocialPlatform = "instagram" | "facebook" | "youtube" | "linkedin" | "x" | "tiktok";

export interface SocialAccount {
    platform: SocialPlatform;
    /** Platform name shown on the Channels list. */
    platformName: string;
    icon: string;
    /** Greyed-out icon used when the account wasn't found. */
    iconMuted?: string;
    /** Handle or page name found by research; absent = not found. */
    found?: { name: string; audience: string };
    /** Handle shown on the Channels list. */
    channelHandle?: string;
}

export const SOCIAL_ACCOUNTS: SocialAccount[] = [
    { platform: "instagram", platformName: "Instagram", icon: instagram, found: { name: "@aftershoot", audience: "12.4K followers" }, channelHandle: "@aftershoot" },
    { platform: "facebook", platformName: "Facebook", icon: facebook, found: { name: "Aftershoot", audience: "3.1K followers" }, channelHandle: "Aftershoot" },
    { platform: "youtube", platformName: "YouTube", icon: youtube, found: { name: "@aftershoot", audience: "860 subscribers" }, channelHandle: "@aftershoot" },
    { platform: "linkedin", platformName: "LinkedIn", icon: linkedin, found: { name: "Aftershoot Technologies", audience: "540 followers" }, channelHandle: "Aftershoot Technologies" },
    { platform: "x", platformName: "X", icon: x, iconMuted: xGray, channelHandle: "@aftershootai" },
    { platform: "tiktok", platformName: "TikTok", icon: tiktok },
];

/** Found list (Figma 72:5421) shows these platforms in order. */
export const FOUND_LIST: SocialPlatform[] = ["instagram", "facebook", "youtube", "linkedin", "x"];
/** Channels list (Figma 72:5618). */
export const CHANNEL_LIST: SocialPlatform[] = ["instagram", "facebook", "youtube", "linkedin", "x", "tiktok"];

export const accountFor = (platform: SocialPlatform) => SOCIAL_ACCOUNTS.find((a) => a.platform === platform)!;
export const FOUND_COUNT = SOCIAL_ACCOUNTS.filter((a) => a.found).length;
