import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type FC, type ReactNode, useState } from "react";
import {
    Announcement01,
    Bell01,
    Calendar,
    Check,
    CheckCircle,
    ChevronRight,
    ArrowRight,
    ChevronSelectorVertical,
    Compass03,
    DotsVertical,
    Edit05,
    File06,
    Flag05,
    Globe02,
    Link03,
    Plus,
    SearchLg,
    Stars02,
    TrendUp01,
    UserPlus01,
    XClose,
} from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { ProgressBarBase } from "@/components/base/progress-indicators/progress-indicators";
import { type SocialPlatform, accountFor } from "@/features/brand-onboarding/review/review-data";
import { useMarket } from "@/features/brand-onboarding/market/market-store";
import { cx } from "@/utils/cx";
import { AddAmbassadorModal, type Ambassador } from "./add-ambassador-modal";
import { BrandIdentity, type IdentityTab } from "./brand-identity";
import { BrandChannels } from "./brand-channels";
import { ImportCharactersModal } from "./import-characters-modal";
import glowAmbassadors from "@/assets/glow-ambassadors.svg";
import type { Brand } from "./brand-card";
import { BrandAmbassadors } from "./brand-ambassadors";

/** Colours read from the Aftershoot logo (blue, orange, green and its cream background). */
/** Brands whose "Next: add an ambassador" banner was skipped. Module-level so it stays gone after leaving and reopening the overview. */
const skippedBanner = new Set<string>();
/** Ambassadors added per brand, kept so they survive leaving and reopening the overview. */
const addedAmbassadors = new Map<string, Ambassador[]>();
/** Connected channels per brand, for the same reason. A new brand starts with none: the user connects them on the Channels page. */
const addedChannels = new Map<string, SocialPlatform[]>();

const PALETTE = [
    { name: "Blue", hex: "#307EC4" },
    { name: "Orange", hex: "#EA712F" },
    { name: "Green", hex: "#27AD5C" },
    { name: "Cream", hex: "#F5F2EB" },
];
const KEYWORDS = ["fast", "AI-edited", "culling", "presets", "delivery"];
const RULES = [
    { ok: true, text: "Show the before and after side by side" },
    { ok: true, text: "Lead with the hours saved" },
    { ok: false, text: "No jargon about models" },
    { ok: false, text: "No “magic” claims" },
];

/* ---------------------------------------------------------------- Sidebar (Figma: brand overview, left panel) */

type SetupItem = { id: string; label: string; done: boolean; n?: number };
type Section = "overview" | "identity" | "ambassadors" | "channels";

const BrandSidebar = ({ brand, items, section, onSection, onSoon }: { brand: Brand; items: SetupItem[]; section: Section; onSection: (s: Section) => void; onSoon: (what: string) => void }) => {
    const done = items.filter((i) => i.done).length;
    const next = items.find((i) => !i.done);
    return (
        <aside className="flex h-full w-[248px] shrink-0 flex-col gap-0.5 border-r border-secondary bg-primary px-3 py-3.5">
            <button type="button" className="mb-1 flex w-full items-center gap-2.5 rounded-xl border border-secondary bg-primary p-2.5 text-left shadow-xs outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2">
                <Avatar size="sm" src={brand.logo} alt="" contrastBorder />
                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-primary">{brand.name}</span>
                    <span className="truncate text-xs text-tertiary">{brand.category}</span>
                </span>
                <ChevronSelectorVertical aria-hidden className="size-4 text-fg-quaternary" />
            </button>

            <a
                href="#"
                aria-current={section === "overview" ? "page" : undefined}
                onClick={(e) => {
                    e.preventDefault();
                    onSection("overview");
                }}
                className={cx("relative flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-active", section === "overview" ? "bg-active text-primary" : "text-secondary")}
            >
                <Compass03 aria-hidden className="size-4 text-fg-secondary" />
                Overview
                {section === "overview" && <span aria-hidden className="absolute top-[9px] left-0 h-4 w-0.5 rounded-[1px] bg-indicator" />}
            </a>

            <div className="flex w-full items-center justify-between px-2.5 pt-3.5 pb-1.5 text-xs font-semibold tracking-[0.48px] text-tertiary">
                <span>SET UP</span>
                <span className="font-medium tracking-normal">
                    {done} of {items.length}
                </span>
            </div>
            {items.map((i, idx) => (
                <a
                    key={i.id}
                    href="#"
                    aria-current={section === i.id ? "page" : undefined}
                    onClick={(e) => {
                        e.preventDefault();
                        if (i.id === "identity" || i.id === "ambassadors" || i.id === "channels") onSection(i.id);
                        else onSoon(i.label);
                    }}
                    className={cx("relative flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-active", section === i.id ? "bg-active text-primary" : "text-secondary")}
                >
                    {i.done ? (
                        <CheckCircle aria-hidden className="size-4 text-fg-success-secondary" />
                    ) : (
                        <span aria-hidden className="flex size-4 items-center justify-center rounded-full border border-secondary bg-secondary text-[10px] text-tertiary">
                            {idx + 1}
                        </span>
                    )}
                    <span className="flex-1">{i.label}</span>
                    {i.done && i.id !== "ambassadors" && i.id !== "channels" && <ChevronRight aria-hidden className="size-4 text-fg-quaternary" />}
                    {section === i.id && <span aria-hidden className="absolute top-[10px] left-0 h-4 w-0.5 rounded-[1px] bg-indicator" />}
                </a>
            ))}

            <div className="flex-1" />
            <div className="flex w-full flex-col gap-2 rounded-xl border border-secondary bg-secondary p-3 text-xs">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">Brand setup</span>
                    <span className="font-semibold text-primary">
                        {done} of {items.length}
                    </span>
                </div>
                <ProgressBarBase value={(done / items.length) * 100} className="h-1" progressClassName="bg-linear-to-r from-adkraft-blue to-adkraft-pink" />
                {next && (
                    <button
                        type="button"
                        onClick={() => (next.id === "identity" || next.id === "ambassadors" || next.id === "channels" ? onSection(next.id) : onSoon(next.label))}
                        className="mt-1 flex items-center justify-between gap-2 text-left font-medium text-tertiary outline-focus-ring hover:text-secondary focus-visible:outline-2"
                    >
                        Next: {next.label.toLowerCase()}
                        <ArrowRight aria-hidden className="size-4" />
                    </button>
                )}
            </div>
        </aside>
    );
};

/* ---------------------------------------------------------------- Page sections */

const SectionCard = ({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) => (
    <section className={cx("flex flex-col gap-5 rounded-xl border border-secondary bg-secondary p-5", className)}>
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-md font-semibold text-primary">{title}</h2>
            {action}
        </div>
        {children}
    </section>
);

const Label = ({ children }: { children: ReactNode }) => <p className="text-xs font-semibold tracking-[0.48px] text-tertiary uppercase">{children}</p>;

const StatTile = ({ icon: Icon, label, value, hint, onClick }: { icon: FC<{ className?: string }>; label: string; value: string; hint: string; onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-xl border border-secondary bg-secondary p-4 text-left outline-focus-ring transition hover:bg-active focus-visible:outline-2 focus-visible:outline-offset-2"
    >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-fg-secondary ring-1 ring-secondary">
            <Icon className="size-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs text-tertiary">{label}</span>
            <span className="truncate text-sm font-semibold text-primary">{value}</span>
            <span className="truncate text-xs text-tertiary">{hint}</span>
        </span>
        <ChevronRight aria-hidden className="size-4 shrink-0 text-fg-quaternary" />
    </button>
);

interface BrandOverviewProps {
    brand: Brand;
    onBrands: () => void;
    notify: (message: string) => void;
}

/**
 * Brand overview (Figma "0.9 · Brand overview — ready"): the brand's own sidebar (set-up checklist), then the header with
 * its logo, site and connected channels, the next-step banner, Voice and Palette as two separate cards in a grid, the
 * perception / competitors / trends tiles, the research summary, and the campaigns empty state.
 * Sample copy is for Aftershoot; the logo, channels, competitors and trends come from what the user set up.
 */
export const BrandOverview = ({ brand, onBrands, notify }: BrandOverviewProps) => {
    const { competitors, trends } = useMarket();
    const tracked = competitors.filter((c) => c.kept);
    const watching = trends.filter((t) => t.kept);
    
    const [section, setSection] = useState<Section>("overview");
    const [identityTab, setIdentityTab] = useState<IdentityTab>("presence");
    const [channels, setChannels] = useState<SocialPlatform[]>(addedChannels.get(brand.id) ?? []);
    const saveChannels = (next: SocialPlatform[]) => {
        addedChannels.set(brand.id, next);
        setChannels(next);
    };
    const reduce = useReducedMotion();
    const [ambassadors, setAmbassadors] = useState<Ambassador[]>(addedAmbassadors.get(brand.id) ?? []);
    const [adding, setAdding] = useState(false);
    const [importing, setImporting] = useState(false);
    const saveAmbassadors = (next: Ambassador[]) => {
        addedAmbassadors.set(brand.id, next);
        setAmbassadors(next);
    };
    const [bannerSkipped, setBannerSkipped] = useState(skippedBanner.has(brand.id));
    const soon = (what: string) => () => notify(`${what} is the next screen to build.`);

    const items: SetupItem[] = [
        { id: "identity", label: "Identity", done: true },
        { id: "assets", label: "Assets", done: true },
        { id: "research", label: "Research", done: true },
        { id: "ambassadors", label: "Ambassadors", done: ambassadors.length > 0 },
        { id: "channels", label: "Channels", done: channels.length > 0 },
        { id: "campaigns", label: "Campaigns", done: false },
    ];

    return (
        <div className="flex h-full min-w-0 flex-1">
            <BrandSidebar brand={brand} items={items} section={section} onSection={setSection} onSoon={(w) => soon(w)()} />

            <div className="relative isolate flex h-full min-w-0 flex-1 flex-col">
                {/* Figma "Glow" (9105:40089): a 1100×520 blurred ellipse, 21% opacity, centred on the bottom edge of the page. */}
                {(section === "ambassadors" || section === "channels") && (
                    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                        <img src={glowAmbassadors} alt="" className="absolute bottom-0 left-1/2 h-[880px] w-[1460px] max-w-none -translate-x-1/2 translate-y-1/2" />
                    </div>
                )}
                <header className="flex h-14 w-full shrink-0 items-center gap-3 border-b border-secondary px-7">
                    <nav aria-label="Breadcrumb" className="flex flex-1 items-center gap-2 text-sm whitespace-nowrap">
                        <button type="button" onClick={onBrands} className="font-medium text-tertiary outline-focus-ring hover:text-secondary focus-visible:outline-2">
                            Brands
                        </button>
                        <span className="text-placeholder">/</span>
                        <span className="font-medium text-tertiary">{brand.name}</span>
                        <span className="text-placeholder">/</span>
                        {section === "identity" ? (
                            <span className="font-semibold text-primary">Identity</span>
                        ) : (
                            <span className="font-semibold text-primary">{section === "overview" ? "Overview" : section === "ambassadors" ? "Ambassadors" : "Channels"}</span>
                        )}
                    </nav>
                    <Input aria-label="Search" placeholder="Search" icon={SearchLg} shortcut="⌘K" size="md" className="w-[265px]" />
                    <button aria-label="Notifications" className="flex size-[34px] items-center justify-center rounded-lg text-fg-quaternary">
                        <Bell01 className="size-[18px]" />
                    </button>
                </header>

                <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-8 pt-7 pb-8">
                    {section === "identity" ? (
                        <BrandIdentity brandName={brand.name} domain={brand.domain} logo={brand.logo} tab={identityTab} onTab={setIdentityTab} notify={notify} />
                    ) : section === "channels" ? (
                        <BrandChannels brandName={brand.name} channels={channels} onChannels={saveChannels} onSkip={() => setSection("overview")} notify={notify} />
                    ) : section === "ambassadors" ? (
                        <BrandAmbassadors
                            ambassadors={ambassadors}
                            onImport={() => setImporting(true)}
                            onAdd={() => setAdding(true)}
                            onRemove={(a) => {
                                saveAmbassadors(ambassadors.filter((x) => x.id !== a.id));
                                notify(`${a.name} removed.`);
                            }}
                            onAddAgreement={() => setAdding(true)}
                        />
                    ) : (
                    <>
                    {/* Header */}
                    <div className="flex w-full flex-wrap items-start gap-4">
                        <Avatar size="2xl" src={brand.logo} alt={`${brand.name} logo`} contrastBorder rounded={false} contentClassName="rounded-xl" className="rounded-xl" />
                        <div className="flex min-w-[260px] flex-1 flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl font-semibold text-primary">{brand.name}</h1>
                                <BadgeWithDot color="success" size="sm">
                                    Researched
                                </BadgeWithDot>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-tertiary">
                                <span className="flex items-center gap-1.5">
                                    <Globe02 aria-hidden className="size-4 text-fg-quaternary" />
                                    {brand.domain}
                                </span>
                                {channels.includes("instagram") && (
                                    <span className="flex items-center gap-1.5">
                                        <Link03 aria-hidden className="size-4 text-fg-quaternary" />
                                        {accountFor("instagram").channelHandle}
                                    </span>
                                )}
                                <span>{brand.category}</span>
                            </div>
                            {channels.length > 0 && (
                                <div className="flex items-center gap-2" aria-label="Connected channels">
                                    {channels.map((p) => (
                                        <span key={p} title={accountFor(p).platformName} className="flex size-7 items-center justify-center rounded-lg border border-secondary bg-white p-1">
                                            <img src={accountFor(p).icon} alt={accountFor(p).platformName} className="size-full object-contain" />
                                        </span>
                                    ))}
                                    <span className="text-xs font-medium text-tertiary">{channels.length} connected</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button color="secondary" size="md" iconLeading={Announcement01} onClick={() => setSection("channels")}>
                                {channels.length ? "Manage channels" : "Connect a channel"}
                            </Button>
                            <Button color="secondary" size="md" iconLeading={DotsVertical} aria-label="More" onClick={soon("Brand options")} />
                        </div>
                    </div>

                    {/* Next step */}
                    <AnimatePresence initial={false}>
                    {!bannerSkipped && ambassadors.length === 0 && (
                    // Leaves with an ease-in-out: it fades and drifts back while the height closes, and the negative margin takes the 20px page gap with it so the cards below glide up instead of jumping.
                    <motion.div
                        key="ambassador-banner"
                        exit={{ opacity: 0, y: -10, scale: 0.98, height: 0, marginBottom: -20 }}
                        transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
                        className="shrink-0 overflow-hidden"
                    >
                    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-secondary bg-linear-to-r from-[rgba(91,140,255,0.14)] to-[rgba(255,122,168,0.1)] p-5">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-fg-secondary shadow-xs">
                            <UserPlus01 className="size-5" />
                        </span>
                        <div className="flex min-w-[260px] flex-1 flex-col gap-0.5">
                            <h2 className="text-md font-semibold text-primary">Next: add an ambassador</h2>
                            <p className="text-sm text-tertiary">
                                Without one, video days are narrated over a generic person. Use a character you own or a real person you have an agreement with.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                color="secondary"
                                size="md"
                                onClick={() => {
                                    skippedBanner.add(brand.id);
                                    setBannerSkipped(true);
                                }}
                            >
                                Skip for now
                            </Button>
                            <Button
                                color="secondary"
                                size="md"
                                iconLeading={Plus}
                                onClick={() => {
                                    setSection("ambassadors");
                                    setImporting(true);
                                }}
                            >
                                Import from Characters
                            </Button>
                        </div>
                    </div>
                    </motion.div>
                    )}
                    </AnimatePresence>

                    {/* Voice and Palette: two separate cards in a grid */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <SectionCard
                            title="Voice"
                            action={
                                <Button color="secondary" size="sm" iconLeading={Edit05} onClick={soon("Redrafting the voice")}>
                                    Redraft
                                </Button>
                            }
                        >
                            <p className="text-md text-primary">
                                “Plain, confident talk from a photographer who has lived in the edit: fast results, no jargon, no hype.”
                            </p>
                            <div className="flex flex-col gap-2.5">
                                <Label>Key words</Label>
                                <div className="flex flex-wrap gap-2">
                                    {KEYWORDS.map((k) => (
                                        <Badge key={k} color="gray" size="lg">
                                            {k}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <Label>Top rules</Label>
                                <ul className="flex flex-col gap-2">
                                    {RULES.map((r) => (
                                        <li key={r.text} className="flex items-center gap-2 text-sm text-secondary">
                                            {r.ok ? <Check aria-label="Do" className="size-4 text-fg-success-secondary" /> : <XClose aria-label="Don’t" className="size-4 text-fg-error-secondary" />}
                                            {r.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Palette"
                            action={
                                <Button color="secondary" size="sm" iconLeading={Edit05} onClick={soon("Editing the palette")}>
                                    Edit
                                </Button>
                            }
                        >
                            <p className="text-sm text-tertiary">Colours taken from the {brand.name} logo.</p>
                            <ul className="grid grid-cols-2 gap-4">
                                {PALETTE.map((c) => (
                                    <li key={c.hex} className="flex items-center gap-3">
                                        <span className="size-12 shrink-0 rounded-lg ring-1 ring-black/10 ring-inset" style={{ backgroundColor: c.hex }} />
                                        <span className="flex flex-col">
                                            <span className="text-sm font-semibold text-primary">{c.name}</span>
                                            <span className="text-xs text-tertiary">{c.hex}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </SectionCard>
                    </div>

                    {/* Perception / competitors / trends */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <StatTile icon={TrendUp01} label="Perception" value="Low voice" hint="Instagram · 25 posts read" onClick={soon("Perception")} />
                        <StatTile
                            icon={Flag05}
                            label="Competitors"
                            value={tracked.length ? `${tracked.length} tracked` : "None tracked"}
                            hint={tracked.length ? tracked.map((c) => c.name).join(", ") : "Add competitors to compare"}
                            onClick={soon("Competitors")}
                        />
                        <StatTile
                            icon={Calendar}
                            label="Trends"
                            value={watching.length ? `${watching.length} watching` : "Not watching"}
                            hint={watching.length ? watching.map((t) => t.title).join(", ") : "Choose markets to start"}
                            onClick={soon("Trends")}
                        />
                    </div>

                    {/* Research summary */}
                    <section className="flex flex-col gap-3 rounded-xl border border-secondary bg-secondary p-5">
                        <div className="flex items-center gap-2.5">
                            <File06 aria-hidden className="size-5 text-fg-quaternary" />
                            <h2 className="flex-1 text-md font-semibold text-primary">Deep research · executive summary</h2>
                            <span className="text-xs text-tertiary">Just now</span>
                        </div>
                        <p className="text-sm text-tertiary">
                            Your best post was a short before-and-after, and the hours-saved story you tell in demos never reaches your feed. Photographers search for faster culling, and your site answers it only on the pricing page.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button color="secondary" size="md" onClick={soon("The full report")}>
                                Read full report
                            </Button>
                            <Button color="secondary" size="md" iconLeading={Stars02} onClick={soon("Ask the researcher")}>
                                Ask the researcher
                            </Button>
                        </div>
                    </section>

                    {/* Campaigns */}
                    <section className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-primary p-5">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-fg-secondary ring-1 ring-secondary">
                            <Calendar className="size-5" />
                        </span>
                        <div className="flex min-w-[240px] flex-1 flex-col gap-0.5">
                            <h2 className="text-sm font-semibold text-primary">No campaigns yet</h2>
                            <p className="text-sm text-tertiary">Start a 14-day campaign: pick a research-grounded theme and AdKraft builds the plan.</p>
                        </div>
                        <button
                            type="button"
                            onClick={soon("Campaigns")}
                            className="flex items-center gap-2 rounded-lg bg-linear-to-r from-adkraft-blue to-adkraft-pink px-4 py-2.5 text-sm font-semibold text-white shadow-xs outline-focus-ring hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            <Stars02 aria-hidden className="size-4" />
                            New campaign
                        </button>
                    </section>
                    </>
                    )}
                </main>
            </div>
            <AddAmbassadorModal
                isOpen={adding}
                onClose={() => setAdding(false)}
                onAdd={(a) => {
                    saveAmbassadors([...ambassadors, a]);
                    notify(`${a.name} added as an ambassador.`);
                }}
            />
            <ImportCharactersModal
                isOpen={importing}
                onClose={() => setImporting(false)}
                takenNames={ambassadors.map((a) => a.name)}
                onImport={(chars) => {
                    saveAmbassadors([
                        ...ambassadors,
                        ...chars.map((c): Ambassador => ({ id: crypto.randomUUID(), name: c.name, kind: "ai", description: c.bio, likenessUrl: "", agreementWith: "", initials: c.initials, gradient: c.gradient, usedIn: c.usedIn })),
                    ]);
                    notify(chars.length === 1 ? `${chars[0].name} imported.` : `${chars.length} characters imported.`);
                }}
            />
        </div>
    );
};
