import type { ReactNode } from "react";
import { Heading } from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import brewbloomLogo from "@/assets/market/brewbloom-logo.png";
import glowBlue from "@/assets/market/glow-blue.svg";
import glowCoral from "@/assets/market/glow-coral.svg";
import glowWhite from "@/assets/market/glow-white.svg";
import palette from "@/assets/market/palette.svg";
import facebookLg from "@/assets/market/r-facebook-lg.svg";
import facebookSm from "@/assets/market/r-facebook-sm.svg";
import globe from "@/assets/market/r-globe.svg";
import instagramLg from "@/assets/market/r-instagram-lg.svg";
import instagramSm from "@/assets/market/r-instagram-sm.svg";
import linkedinLg from "@/assets/market/r-linkedin-lg.svg";
import tileBlueTokai from "@/assets/market/r-logo-blue-tokai-tile.svg";
import tileRage from "@/assets/market/r-logo-rage-tile.svg";
import tileSleepyOwl from "@/assets/market/r-logo-sleepy-owl-tile.svg";
import tileThirdWave from "@/assets/market/r-logo-third-wave-tile.svg";
import xIcon from "@/assets/market/r-x.svg";
import youtubeLg from "@/assets/market/r-youtube-lg.svg";
import youtubeSm from "@/assets/market/r-youtube-sm.svg";
import type { StepDefinition, StepProps } from "../flow";
import { useMarket } from "../market/market-store";

/** Figma modal fill (81:9781): brand gradient over white. */
const panelBackground =
    "linear-gradient(147.56deg, rgba(91,140,255,0.55) 14.286%, rgba(182,140,172,0.3) 53.571%, rgba(245,116,137,0.5) 85.714%), linear-gradient(90deg, #fff 0%, #fff 100%)";

/** Orbit tiles around the brand pill — Figma coordinates in the 1120×712 modal. */
const TILES: { left: number; top: number; size: number; icon: string; iconSize: number; blur?: number }[] = [
    { left: 92, top: 243.15, size: 44.4, icon: instagramLg, iconSize: 22.2 },
    { left: 306.6, top: 243.15, size: 44.4, icon: youtubeLg, iconSize: 22.2 },
    { left: 199.3, top: 206.15, size: 44.4, icon: globe, iconSize: 20.35 },
    { left: 92, top: 439.25, size: 44.4, icon: facebookLg, iconSize: 22.2 },
    { left: 199.3, top: 476.25, size: 44.4, icon: tileBlueTokai, iconSize: 25.9 },
    { left: 306.6, top: 439.25, size: 44.4, icon: linkedinLg, iconSize: 22.2 },
    { left: 23.55, top: 326.4, size: 37, icon: tileThirdWave, iconSize: 22.2, blur: 1.85 },
    { left: 382.45, top: 326.4, size: 37, icon: xIcon, iconSize: 18.5, blur: 1.85 },
    { left: 36.5, top: 167.3, size: 33.3, icon: tileSleepyOwl, iconSize: 20.35, blur: 2.775 },
    { left: 373.2, top: 526.2, size: 33.3, icon: tileRage, iconSize: 20.35, blur: 2.775 },
];

/** The Figma logo crop (fill image scaled inside a square frame). */
const BrandLogo = ({ className }: { className?: string }) => (
    <span className={cx("relative block shrink-0 overflow-hidden", className)}>
        <img src={brewbloomLogo} alt="" className="absolute top-[-0.71%] left-[-31.48%] h-[110.38%] w-[168.33%] max-w-none" />
    </span>
);

const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
    <div className={cx("flex h-full min-w-px flex-col items-start justify-between overflow-clip rounded-xl border border-secondary bg-secondary p-4", className)}>
        {children}
    </div>
);

const CardText = ({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) => (
    <div className="flex w-full flex-col gap-0.5 whitespace-nowrap">
        <p className="text-xs font-medium text-tertiary">{label}</p>
        <p className={cx("text-sm leading-6 font-semibold text-primary", valueClassName)}>{value}</p>
    </div>
);

const initials = (name: string) =>
    name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");

/** Figma "Add client · Happy path v2" (81:9781) — final summary, full-bleed without the shared header. */
const ReadyStep = ({ draft, next, back, notify }: StepProps) => {
    const { competitors, trends } = useMarket();
    const keptCompetitors = competitors.filter((c) => c.kept);
    const keptTrends = trends.filter((t) => t.kept);

    return (
        <div className="absolute inset-0" style={{ backgroundImage: panelBackground }}>
            {/* Left panel: brand pill orbited by channel tiles — Figma coordinates in the 1120×712 modal. */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <img src={glowBlue} alt="" className="absolute top-[-162px] left-[-241px] size-[610.5px] max-w-none" />
                <img src={glowCoral} alt="" className="absolute top-[300.5px] left-[110.5px] size-[573.5px] max-w-none" />
                <img src={glowWhite} alt="" className="absolute top-[171px] left-[-19px] h-[370px] w-[481px] max-w-none" />

                {TILES.map((t) => (
                    <span
                        key={`${t.left}-${t.top}`}
                        className="absolute flex items-center justify-center overflow-clip rounded-[11.1px] bg-white shadow-[0px_3.7px_11.1px_-1.85px_rgba(10,13,26,0.08)]"
                        style={{ left: t.left, top: t.top, width: t.size, height: t.size, filter: t.blur ? `blur(${t.blur}px)` : undefined }}
                    >
                        <img src={t.icon} alt="" style={{ width: t.iconSize, height: t.iconSize }} className="max-w-none" />
                    </span>
                ))}

                <span className="absolute top-[328px] left-[105px] flex items-center gap-3 rounded-full bg-white py-2.5 pr-3 pl-2.5 shadow-[0px_2px_4px_0px_rgba(10,13,26,0.04),0px_12px_24px_-4px_rgba(10,13,26,0.1)]">
                    <BrandLogo className="size-9 rounded-full" />
                    <span className="text-lg font-semibold whitespace-nowrap text-primary">Brewbloom Coffee</span>
                </span>
            </div>

            {/* Right summary card (Figma "Content" 81:9820). */}
            <div className="absolute top-5 right-5 flex h-[672px] w-[605px] flex-col items-center justify-between overflow-clip rounded-2xl bg-primary py-8 pr-8 pl-10">
                <div className="flex w-full flex-col items-start gap-5">
                    <div className="flex w-full flex-col gap-2 whitespace-nowrap">
                        <Heading slot="title" className="text-[30px] leading-[38px] font-semibold tracking-[-0.6px] text-primary">
                            Brewbloom Coffee is ready
                        </Heading>
                        <p className="text-sm text-tertiary">brewbloom.in · Specialty coffee · Bengaluru</p>
                    </div>

                    <div className="flex w-full flex-col gap-3">
                        <div className="flex h-33 w-full gap-3">
                            <Card className="w-[336px] shrink-0">
                                <div className="flex items-center gap-2">
                                    <BrandLogo className="size-8 rounded-[4.571px]" />
                                    <img src={palette} alt="Brand colours" className="h-7 w-[102px]" />
                                </div>
                                <CardText label="Brand kit" value="Logo, 4 colours, type" />
                            </Card>
                            <Card className="flex-1">
                                <p className="text-[28px] leading-9 font-semibold text-primary">22–35</p>
                                <CardText label="Audience" value="Young professionals" />
                            </Card>
                        </div>

                        <div className="flex h-33 w-full gap-3">
                            <Card className="flex-1">
                                <p className="text-xs leading-6 font-medium whitespace-nowrap text-primary">“Slow mornings, properly good coffee.”</p>
                                <CardText label="Voice" value="Warm, crafted" />
                            </Card>
                            <Card className="flex-1">
                                <div className="flex items-center gap-2">
                                    {[
                                        { id: "instagram", src: instagramSm, label: "Instagram" },
                                        { id: "youtube", src: youtubeSm, label: "YouTube" },
                                        { id: "facebook", src: facebookSm, label: "Facebook" },
                                    ]
                                        .filter((s) => draft.channels.includes(s.id))
                                        .map((s) => (
                                        <span key={s.label} className="flex size-8 items-center justify-center rounded-lg border border-secondary bg-primary">
                                            <img src={s.src} alt={s.label} className="size-[18px]" />
                                        </span>
                                    ))}
                                </div>
                                <CardText label="Channels" value={draft.channels.length ? `${draft.channels.length} connected` : "None connected"} valueClassName="text-md" />
                            </Card>
                        </div>

                        <div className="flex h-33 w-full gap-3">
                            <Card className="flex-1">
                                <div className="isolate flex h-8 items-start">
                                    {keptCompetitors.slice(0, 3).map((c, i) => (
                                        <span
                                            key={c.id}
                                            className="relative -mr-1.5 size-8 shrink-0 last:mr-0"
                                            style={{ zIndex: 3 - i }}
                                        >
                                            {c.logoSm || c.logo ? (
                                                <img src={c.logoSm ?? c.logo} alt={c.name} className="size-8 max-w-none" />
                                            ) : (
                                                <Avatar size="sm" initials={initials(c.name)} className="rounded-lg" />
                                            )}
                                        </span>
                                    ))}
                                </div>
                                <CardText label="Competitors" value={`${keptCompetitors.length} tracked`} />
                            </Card>
                            <Card className="flex-1">
                                <p className="text-[28px] leading-9 font-semibold text-primary">+38%</p>
                                <div className="flex flex-col gap-0.5 text-xs whitespace-nowrap text-tertiary">
                                    <p className="font-medium">Trends</p>
                                    <p>
                                        {keptTrends.length} watching{keptTrends[0] ? ` · ${keptTrends[0].short} leads` : ""}
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button color="secondary" size="lg" onClick={back}>
                        Edit
                    </Button>
                    <Button
                        size="lg"
                        onClick={() => {
                            notify("Brewbloom Coffee added.");
                            next();
                        }}
                    >
                        Add client
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const readyStep: StepDefinition = {
    id: "ready",
    ariaLabel: "New brand: brand ready",
    phase: 2,
    phaseFill: 1,
    glow: "none",
    chrome: false,
    modalClassName: "h-[712px] w-[1120px] rounded-[20px] sm:rounded-[20px]",
    Component: ReadyStep,
};
