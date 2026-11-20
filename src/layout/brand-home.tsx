import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { FC, ReactNode } from "react";
import { ArrowRight, Calendar, Check, CheckCircle, ChevronRight, DotsVertical, Edit05, File06, Flag05, Globe02, Link03, Plus, Stars02, TrendUp01, UserPlus01, XClose } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { useMarket } from "@/features/brand-onboarding/market/market-store";
import { type SocialPlatform, accountFor } from "@/features/brand-onboarding/review/review-data";
import glowTop from "@/assets/glow-top.svg";
import { cx } from "@/utils/cx";
import type { Brand } from "./brand-card";
import { DEFAULT_DONTS, DEFAULT_DOS, DEFAULT_KEYWORDS, DEFAULT_VOICE, coloursFor } from "./identity-data";
import { KraftyIcon } from "./krafty-icon";

export type HomeGo = (section: "identity" | "ambassadors" | "channels", tab?: "voice" | "palette") => void;

interface Step {
    id: "identity" | "assets" | "research" | "ambassadors" | "channels" | "campaigns";
    label: string;
    done: boolean;
}

interface BrandHomeProps {
    brand: Brand;
    channels: SocialPlatform[];
    ambassadorCount: number;
    /** The user chose "Skip for now" on the ambassador step. */
    ambassadorSkipped: boolean;
    onSkipAmbassador: () => void;
    go: HomeGo;
    onImport: () => void;
    notify: (message: string) => void;
}

/** Page backdrop: the onboarding's soft glow, fading to white. */
export const HomeBackdrop = () => (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img src={glowTop} alt="" className="absolute top-[-560px] left-1/2 h-[880px] w-[1460px] max-w-none -translate-x-1/2" />
        <div className="absolute top-0 left-1/2 h-[760px] w-[1440px] -translate-x-1/2 bg-linear-to-b from-white/0 via-white/60 via-55% to-white" />
    </div>
);

const SectionHead = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => (
    <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold text-primary">{title}</h2>
            {sub && <p className="text-sm text-tertiary">{sub}</p>}
        </div>
        {action}
    </div>
);

const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cx("flex flex-col gap-4 rounded-2xl border border-secondary bg-primary p-5 shadow-xs", className)}>{children}</div>
);

const StatCard = ({ icon, label, value, hint, onClick }: { icon: FC<{ className?: string }>; label: string; value: string; hint: string; onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className="group flex w-full flex-col gap-4 rounded-2xl border border-secondary bg-primary p-5 text-left shadow-xs outline-focus-ring transition duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
        <div className="flex items-center justify-between">
            <FeaturedIcon icon={icon} theme="modern" color="gray" size="md" />
            <ChevronRight aria-hidden className="size-4 text-fg-quaternary transition group-hover:translate-x-0.5 group-hover:text-fg-quaternary_hover" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm text-tertiary">{label}</span>
            <span className="truncate text-xl font-semibold text-primary">{value}</span>
            <span className="truncate text-sm text-tertiary">{hint}</span>
        </div>
    </button>
);

/**
 * The brand overview, rebuilt to read top to bottom: who the brand is, what to do next, the brand itself (voice and palette
 * as two cards), the market, the research and campaigns. It sits on the same soft glow as the onboarding and uses white
 * cards, one black primary action per area, and plain section headings.
 */
export const BrandHome = ({ brand, channels, ambassadorCount, ambassadorSkipped, onSkipAmbassador, go, onImport, notify }: BrandHomeProps) => {
    const reduce = useReducedMotion();
    const { competitors, trends } = useMarket();
    const tracked = competitors.filter((c) => c.kept);
    const watching = trends.filter((t) => t.kept);
    const soon = (what: string) => () => notify(`${what} is the next screen to build.`);

    const steps: Step[] = [
        { id: "identity", label: "Identity", done: true },
        { id: "assets", label: "Assets", done: true },
        { id: "research", label: "Research", done: true },
        { id: "ambassadors", label: "Ambassadors", done: ambassadorCount > 0 },
        { id: "channels", label: "Channels", done: channels.length > 0 },
        { id: "campaigns", label: "Campaigns", done: false },
    ];
    const doneCount = steps.filter((s) => s.done).length;
    // The step to push next: ambassadors unless skipped, then channels, then the first campaign.
    const next = steps.find((s) => !s.done && !(s.id === "ambassadors" && ambassadorSkipped));

    const callout = (() => {
        switch (next?.id) {
            case "ambassadors":
                return {
                    icon: UserPlus01,
                    title: "Add an ambassador",
                    text: "Without one, video days are narrated over a generic person. Use a character you own or a real person you have an agreement with.",
                    primary: { label: "Import from Characters", icon: Plus, run: onImport },
                    skip: onSkipAmbassador,
                };
            case "channels":
                return {
                    icon: Link03,
                    title: "Connect a channel",
                    text: "Connect where your ads get published. You sign in on the platform; AdKraft never sees your password.",
                    primary: { label: "Connect a channel", icon: Plus, run: () => go("channels") },
                };
            default:
                return {
                    icon: Calendar,
                    title: "Plan your first campaign",
                    text: "Pick a research-grounded theme and AdKraft builds a 14-day plan.",
                    primary: { label: "New campaign", icon: Plus, run: soon("Campaigns") },
                };
        }
    })();

    return (
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-8">
            {/* Who the brand is */}
            <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-4">
                {/* Logo and text stay side by side, with the logo centred on the whole block */}
                <div className="flex min-w-0 flex-1 basis-[420px] items-center gap-5">
                    <Avatar size="2xl" src={brand.logo} alt={`${brand.name} logo`} contrastBorder rounded={false} contentClassName="rounded-2xl" className="shrink-0 rounded-2xl shadow-md ring-4 ring-white" />
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-display-xs font-semibold text-primary">{brand.name}</h1>
                            <BadgeWithDot color="success" size="md">
                                Researched
                            </BadgeWithDot>
                        </div>
                        {/* Website, category and channels on one line */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-md text-tertiary">
                            {brand.domain && (
                                <span className="flex items-center gap-1.5">
                                    <Globe02 aria-hidden className="size-4 text-fg-quaternary" />
                                    {brand.domain}
                                </span>
                            )}
                            <span>{brand.category}</span>
                            <span className="flex items-center gap-2" aria-label="Channels">
                                {channels.length > 0 ? (
                                    <>
                                        {channels.map((p) => (
                                            <span key={p} title={accountFor(p).platformName} className="flex size-6 items-center justify-center rounded-md border border-secondary bg-white p-0.5 shadow-xs">
                                                <img src={accountFor(p).icon} alt={accountFor(p).platformName} className="size-full object-contain" />
                                            </span>
                                        ))}
                                        <span className="text-sm">{channels.length} connected</span>
                                    </>
                                ) : (
                                    <span className="text-sm">No channels connected</span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button color="secondary" size="md" iconLeading={Link03} onClick={() => go("channels")}>
                        {channels.length ? "Manage channels" : "Connect a channel"}
                    </Button>
                    <Dropdown.Root>
                        <Button color="secondary" size="md" iconLeading={DotsVertical} aria-label="More" />
                        <Dropdown.Popover className="w-48">
                            <Dropdown.Menu>
                                <Dropdown.Item icon={Edit05} onAction={() => go("identity")}>
                                    Edit identity
                                </Dropdown.Item>
                                <Dropdown.Item icon={File06} onAction={soon("The full report")}>
                                    Read the report
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown.Root>
                </div>
            </header>

            {/* Set up: where things stand and the one thing to do next */}
            <section aria-label="Set up" className="flex flex-col gap-5 rounded-2xl border border-secondary bg-primary p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-lg font-semibold text-primary">
                            {doneCount} of {steps.length} set up
                        </h2>
                        <p className="text-sm text-tertiary">{doneCount === steps.length ? "Everything is ready." : "A few steps left before your first campaign."}</p>
                    </div>
                </div>

                <ol className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
                    {steps.map((s, i) => (
                        <li key={s.id} className="flex items-center gap-2 text-sm">
                            {s.done ? (
                                <CheckCircle aria-hidden className="size-5 shrink-0 text-fg-success-secondary" />
                            ) : (
                                <span aria-hidden className={cx("flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium", s.id === next?.id ? "border-utility-blue-500 bg-utility-blue-50 text-utility-blue-700" : "border-secondary bg-secondary text-tertiary")}>
                                    {i + 1}
                                </span>
                            )}
                            <span className={cx("truncate", s.done ? "text-secondary" : s.id === next?.id ? "font-semibold text-primary" : "text-tertiary")}>{s.label}</span>
                        </li>
                    ))}
                </ol>

                <AnimatePresence initial={false} mode="popLayout">
                    {next && (
                        <motion.div
                            key={callout.title}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            // Leaves with an ease-in-out, fading and drifting back while its height closes.
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
                            className="flex flex-wrap items-center gap-4 rounded-xl border border-secondary bg-linear-to-r from-[rgba(91,140,255,0.12)] to-[rgba(255,122,168,0.1)] p-4"
                        >
                            <FeaturedIcon icon={callout.icon} theme="modern" color="gray" size="md" />
                            <div className="flex min-w-[240px] flex-1 flex-col gap-0.5">
                                <p className="text-xs font-semibold tracking-[0.48px] text-tertiary uppercase">Next</p>
                                <h3 className="text-md font-semibold text-primary">{callout.title}</h3>
                                <p className="text-sm text-tertiary">{callout.text}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {callout.skip && (
                                    <Button color="tertiary" size="md" onClick={callout.skip}>
                                        Skip for now
                                    </Button>
                                )}
                                <Button size="md" iconLeading={callout.primary.icon} onClick={callout.primary.run}>
                                    {callout.primary.label}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* The brand itself: voice and palette */}
            <section className="flex flex-col gap-4">
                <SectionHead title="Your brand" sub="How it sounds and looks in every ad." action={<Button color="link-color" size="md" iconTrailing={ArrowRight} onClick={() => go("identity")}>Open identity</Button>} />
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <Card>
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-md font-semibold text-primary">Voice</h3>
                            <Button color="secondary" size="sm" iconLeading={Edit05} onClick={() => go("identity", "voice")}>
                                Edit
                            </Button>
                        </div>
                        <p className="text-lg leading-7 text-primary">“{DEFAULT_VOICE.brand}”</p>
                        <div className="flex flex-wrap gap-2">
                            {DEFAULT_KEYWORDS.slice(0, 5).map((k) => (
                                <Badge key={k} color="gray" size="lg">
                                    {k}
                                </Badge>
                            ))}
                        </div>
                        <ul className="flex flex-col gap-2 border-t border-secondary pt-4">
                            {[...DEFAULT_DOS.slice(0, 2).map((t) => [t, true] as const), ...DEFAULT_DONTS.slice(0, 2).map((t) => [t, false] as const)].map(([t, ok]) => (
                                <li key={t} className="flex items-center gap-2 text-sm text-secondary">
                                    {ok ? <Check aria-label="Do" className="size-4 text-fg-success-secondary" /> : <XClose aria-label="Don’t" className="size-4 text-fg-error-secondary" />}
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-md font-semibold text-primary">Palette</h3>
                            <Button color="secondary" size="sm" iconLeading={Edit05} onClick={() => go("identity", "palette")}>
                                Edit
                            </Button>
                        </div>
                        <p className="text-sm text-tertiary">Colours taken from the {brand.name} logo.</p>
                        <ul className="grid grid-cols-2 gap-3">
                            {coloursFor(brand.colours).map((c) => (
                                <li key={c.id} className="flex flex-col overflow-clip rounded-xl border border-secondary">
                                    <span className="h-16" style={{ backgroundColor: c.hex }} />
                                    <span className="flex items-center justify-between gap-2 px-3 py-2.5">
                                        <span className="flex min-w-0 flex-col">
                                            <span className="truncate text-sm font-semibold text-primary">{c.name}</span>
                                            <span className="text-xs text-tertiary">{c.hex}</span>
                                        </span>
                                        <Badge color={c.role === "Primary" ? "success" : "gray"} size="sm">
                                            {c.role}
                                        </Badge>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </section>

            {/* The market */}
            <section className="flex flex-col gap-4">
                <SectionHead title="Market" sub="What people say, who you compete with and what is trending." />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <StatCard icon={TrendUp01} label="Perception" value="Low voice" hint="Instagram · 25 posts read" onClick={soon("Perception")} />
                    <StatCard
                        icon={Flag05}
                        label="Competitors"
                        value={tracked.length ? `${tracked.length} tracked` : "None tracked"}
                        hint={tracked.length ? tracked.map((c) => c.name).join(", ") : "Add competitors to compare"}
                        onClick={soon("Competitors")}
                    />
                    <StatCard
                        icon={Calendar}
                        label="Trends"
                        value={watching.length ? `${watching.length} watching` : "Not watching"}
                        hint={watching.length ? watching.map((t) => t.title).join(", ") : "Choose markets to start"}
                        onClick={soon("Trends")}
                    />
                </div>
            </section>

            {/* Research */}
            <section className="flex flex-col gap-4">
                <SectionHead title="Research" sub="Deep research · executive summary" action={<span className="text-sm text-tertiary">Just now</span>} />
                <Card className="gap-5">
                    <div className="flex items-start gap-4">
                        <FeaturedIcon icon={File06} theme="modern" color="gray" size="md" />
                        <div className="flex flex-col gap-1.5">
                            <p className="text-xs font-semibold tracking-[0.48px] text-tertiary uppercase">Key finding</p>
                            <p className="text-md text-primary">
                                Your best post was a short before-and-after, and the hours-saved story you tell in demos never reaches your feed. Photographers search for faster culling, and your site answers it only on the pricing page.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button color="secondary" size="md" onClick={soon("The full report")}>
                            Read full report
                        </Button>
                        <Button color="secondary" size="md" iconLeading={() => <KraftyIcon />} onClick={soon("Ask the researcher")}>
                            Ask the researcher
                        </Button>
                    </div>
                </Card>
            </section>

            {/* Campaigns */}
            <section className="flex flex-wrap items-center gap-5 rounded-2xl border border-dashed border-primary bg-primary/60 p-6">
                <FeaturedIcon icon={Calendar} theme="modern" color="gray" size="lg" />
                <div className="flex min-w-[240px] flex-1 flex-col gap-0.5">
                    <h2 className="text-md font-semibold text-primary">No campaigns yet</h2>
                    <p className="text-sm text-tertiary">Start a 14-day campaign: pick a research-grounded theme and AdKraft builds the plan.</p>
                </div>
                <Button size="lg" iconLeading={Stars02} onClick={soon("Campaigns")}>
                    New campaign
                </Button>
            </section>
        </div>
    );
};
