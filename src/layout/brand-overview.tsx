import { useState } from "react";
import { ArrowRight, Bell01, CheckCircle, ChevronRight, ChevronSelectorVertical, Compass03, SearchLg } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Input } from "@/components/base/input/input";
import { ProgressBarBase } from "@/components/base/progress-indicators/progress-indicators";
import type { SocialPlatform } from "@/features/brand-onboarding/review/review-data";
import { cx } from "@/utils/cx";
import { AddAmbassadorModal, type Ambassador } from "./add-ambassador-modal";
import { BrandIdentity, type IdentityTab } from "./brand-identity";
import { BrandHome, HomeBackdrop } from "./brand-home";
import { BrandChannels } from "./brand-channels";
import { ImportCharactersModal } from "./import-characters-modal";
import glowAmbassadors from "@/assets/glow-ambassadors.svg";
import type { Brand } from "./brand-card";
import { BrandAmbassadors } from "./brand-ambassadors";

/** Brands whose "Next: add an ambassador" banner was skipped. Module-level so it stays gone after leaving and reopening the overview. */
const skippedBanner = new Set<string>();
/** Ambassadors added per brand, kept so they survive leaving and reopening the overview. */
const addedAmbassadors = new Map<string, Ambassador[]>();
/** Connected channels per brand, for the same reason. A new brand starts with none: the user connects them on the Channels page. */
const addedChannels = new Map<string, SocialPlatform[]>();

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

interface BrandOverviewProps {
    brand: Brand;
    onBrands: () => void;
    notify: (message: string) => void;
}

/**
 * Brand overview shell: the brand's own sidebar (set-up checklist) and the page that follows the chosen section: the
 * redesigned home (BrandHome), Identity, Ambassadors or Channels. It keeps what the user did per brand (channels, ambassadors,
 * the skipped ambassador step) so it survives leaving and coming back.
 */
export const BrandOverview = ({ brand, onBrands, notify }: BrandOverviewProps) => {
    const [section, setSection] = useState<Section>("overview");
    const [identityTab, setIdentityTab] = useState<IdentityTab>("presence");
    const [channels, setChannels] = useState<SocialPlatform[]>(addedChannels.get(brand.id) ?? []);
    const saveChannels = (next: SocialPlatform[]) => {
        addedChannels.set(brand.id, next);
        setChannels(next);
    };
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
                {section === "overview" && <HomeBackdrop />}
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
                        <BrandIdentity brandName={brand.name} domain={brand.domain} logo={brand.logo} brandColours={brand.colours} tab={identityTab} onTab={setIdentityTab} notify={notify} />
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
                    <BrandHome
                        brand={brand}
                        channels={channels}
                        ambassadorCount={ambassadors.length}
                        ambassadorSkipped={bannerSkipped}
                        onSkipAmbassador={() => {
                            skippedBanner.add(brand.id);
                            setBannerSkipped(true);
                        }}
                        go={(sec, tab) => {
                            if (tab) setIdentityTab(tab);
                            setSection(sec);
                        }}
                        onImport={() => {
                            setSection("ambassadors");
                            setImporting(true);
                        }}
                        notify={notify}
                    />
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
