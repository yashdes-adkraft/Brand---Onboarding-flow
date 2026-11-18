import type { FC, SVGProps } from "react";
import { Camera03, File06, Flag05, Globe02, Image03, Palette, TrendUp01, Users01 } from "@untitledui/icons";
import { AssetsGraphic, AudienceGraphic, BrandKitGraphic, BriefGraphic, CompetitorsGraphic, SocialsGraphic } from "./graphics";

export interface ResearchItem {
    id: string;
    title: string;
    icon: FC<SVGProps<SVGSVGElement>>;
    /** Researched cards only: chip on the right of the expanded header. */
    handle?: string;
    /** Researched cards only: "Kraftly <verb>..." status under the carousel. */
    verb?: string;
    /** Researched cards only: second status line. */
    detail?: string;
    Graphic?: FC;
}

/**
 * The research carousel, top to bottom. "Website" (already done in the client phase) and "Trends"
 * (next phase) only ever appear as the peeking pills above the first / below the last card.
 * Copy per Figma AB-05 v8/v9 frames.
 */
export const RESEARCH_ITEMS: ResearchItem[] = [
    { id: "website", title: "Website", icon: Globe02 },
    { id: "brand-kit", title: "Brand kit", icon: Palette, handle: "brewbloom.in", verb: "creating", detail: "Brand kit", Graphic: BrandKitGraphic },
    { id: "socials", title: "Socials", icon: Camera03, handle: "@brewbloom.coffee", verb: "finding", detail: "Social accounts", Graphic: SocialsGraphic },
    { id: "audience", title: "Audience", icon: Users01, handle: "India", verb: "searching", detail: "Audience", Graphic: AudienceGraphic },
    { id: "assets", title: "Assets", icon: Image03, handle: "24 found", verb: "finding", detail: "Assets", Graphic: AssetsGraphic },
    { id: "brief", title: "Brief", icon: File06, handle: "Draft 1", verb: "writing", detail: "Brief", Graphic: BriefGraphic },
    { id: "competitors", title: "Competitors", icon: Flag05, handle: "4 found", verb: "finding", detail: "Competitors", Graphic: CompetitorsGraphic },
    { id: "trends", title: "Trends", icon: TrendUp01 },
];

/** Number of researched cards (everything between the two bookend pills). */
export const RESEARCH_CARD_COUNT = RESEARCH_ITEMS.length - 2;
