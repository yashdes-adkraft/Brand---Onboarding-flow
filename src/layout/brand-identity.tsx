import { type FC, type ReactNode, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, CheckCircle, Edit05, Globe02, Image03, Lock01, Plus, RefreshCcw01, SearchLg, Stars01, Trash01, X, XClose } from "@untitledui/icons";
import { Tab, TabList, TabPanel, Tabs } from "@/components/application/tabs/tabs";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { ProgressBarBase } from "@/components/base/progress-indicators/progress-indicators";
import { TextArea } from "@/components/base/textarea/textarea";
import { AddHandlePopover } from "@/features/brand-onboarding/review/socials-add-handle";
import { SOCIAL_ACCOUNTS, type SocialPlatform, accountFor } from "@/features/brand-onboarding/review/review-data";
import { cx } from "@/utils/cx";
import {
    type BrandColour,
    DEFAULT_COLOURS,
    DEFAULT_DONTS,
    DEFAULT_DOS,
    DEFAULT_GUARDRAILS,
    DEFAULT_KEYWORDS,
    DEFAULT_MOTIFS,
    DEFAULT_VOICE,
    EVIDENCE,
    type Guardrail,
    IDENTITY_TABS,
    type IdentityTab,
    type Motif,
    contrast,
} from "./identity-data";
import { KraftyIcon } from "./krafty-icon";
import { QuickAdd } from "./quick-add";
import { RedraftIdentityModal } from "./redraft-identity-modal";

export type { IdentityTab } from "./identity-data";

interface Profile {
    platform: SocialPlatform;
    handle: string;
    stats: string;
}
const foundProfiles = (): Profile[] =>
    SOCIAL_ACCOUNTS.filter((a) => a.found).map((a) => ({ platform: a.platform, handle: a.found!.name, stats: `25 posts read · ${a.found!.audience}` }));

const Logo = ({ platform }: { platform: SocialPlatform }) => (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-secondary bg-white p-2 shadow-xs">
        <img src={accountFor(platform).icon} alt="" className="size-full object-contain" />
    </span>
);

/** A grey section card: a title with a line under it on the left, an action on the right. */
const Section = ({ title, sub, action, children, className }: { title: string; sub?: string; action?: ReactNode; children?: ReactNode; className?: string }) => (
    <section className={cx("flex flex-col gap-4 rounded-xl border border-secondary bg-secondary p-5", className)}>
        <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className="text-md font-semibold text-primary">{title}</h2>
                {sub && <p className="text-xs text-tertiary">{sub}</p>}
            </div>
            {action}
        </div>
        {children}
    </section>
);

const Label = ({ children }: { children: ReactNode }) => <p className="text-xs font-semibold tracking-[0.48px] text-tertiary uppercase">{children}</p>;

const Skeleton = () => (
    <div className="flex flex-col gap-3 rounded-xl border border-secondary bg-secondary p-5">
        {[88, 70, 80, 52].map((w, i) => (
            <span key={i} className="h-2 animate-pulse rounded bg-tertiary" style={{ width: `${w}%` }} />
        ))}
    </div>
);

/** A coloured square tile with an icon, for guardrail rows. */
const IconTile = ({ icon: Icon, tone }: { icon: FC<{ className?: string }>; tone: "error" | "warning" }) => (
    <span className={cx("flex size-10 shrink-0 items-center justify-center rounded-lg", tone === "error" ? "bg-[#fee4e2] text-fg-error-primary" : "bg-[#fef0c7] text-fg-warning-primary")}>
        <Icon className="size-5" />
    </span>
);

interface BrandIdentityProps {
    brandName: string;
    domain: string;
    logo: string;
    tab: IdentityTab;
    onTab: (tab: IdentityTab) => void;
    notify: (message: string) => void;
}

type DraftStatus = "Done" | "Writing…" | "Queued" | "Kept";

/**
 * Brand ▸ Identity (Figma "B-10" to "B-16b"): one page with the six parts on horizontal Untitled UI tabs.
 * Online presence lists the accounts research found (no linked / unlinked tags) and lets the user add profiles.
 * Voice & tone, Colour palette, Do's & Don'ts, Recurring motifs and Guardrails are editable; hand edits mark a section
 * "edited" so Re-draft identity can leave it alone. Re-draft opens a picker, then rewrites the chosen sections one at a
 * time (a progress card and a status on each tab, with Stop), simulated here.
 */
export const BrandIdentity = ({ brandName, domain, logo, tab, onTab, notify }: BrandIdentityProps) => {
    const [profiles, setProfiles] = useState<Profile[]>(foundProfiles);
    const [voice, setVoice] = useState(DEFAULT_VOICE);
    const [draft, setDraft] = useState(DEFAULT_VOICE);
    const [keywords, setKeywords] = useState(DEFAULT_KEYWORDS);
    const [colours, setColours] = useState<BrandColour[]>(DEFAULT_COLOURS);
    const [dos, setDos] = useState(DEFAULT_DOS);
    const [donts, setDonts] = useState(DEFAULT_DONTS);
    const [motifs, setMotifs] = useState<Motif[]>(DEFAULT_MOTIFS);
    const [guardrails, setGuardrails] = useState<Guardrail[]>(DEFAULT_GUARDRAILS);
    const [edited, setEdited] = useState<IdentityTab[]>([]);
    const [redrafting, setRedrafting] = useState(false);
    const [run, setRun] = useState<{ sections: IdentityTab[]; done: number } | null>(null);

    const current = IDENTITY_TABS.find((t) => t.id === tab)!;
    const soon = (what: string) => () => notify(`${what} is the next screen to build.`);
    const markEdited = (id: IdentityTab) => setEdited((e) => (e.includes(id) ? e : [...e, id]));
    const voiceDirty = draft.brand !== voice.brand || draft.tone !== voice.tone;

    /* ---- Re-drafting (simulated): each chosen section takes a couple of seconds ---- */
    const notifyRef = useRef(notify);
    notifyRef.current = notify;
    useEffect(() => {
        if (!run) return;
        if (run.done >= run.sections.length) {
            // Finished: the rewritten sections go back to the AI's version and are no longer "edited".
            const finished = run.sections;
            if (finished.includes("voice")) {
                setVoice(DEFAULT_VOICE);
                setDraft(DEFAULT_VOICE);
                setKeywords(DEFAULT_KEYWORDS);
            }
            if (finished.includes("palette")) setColours(DEFAULT_COLOURS);
            if (finished.includes("dos")) {
                setDos(DEFAULT_DOS);
                setDonts(DEFAULT_DONTS);
            }
            if (finished.includes("motifs")) setMotifs(DEFAULT_MOTIFS);
            if (finished.includes("guardrails")) setGuardrails(DEFAULT_GUARDRAILS);
            setEdited((e) => e.filter((x) => !finished.includes(x)));
            setRun(null);
            notifyRef.current(`Identity re-drafted: ${finished.length} ${finished.length === 1 ? "section" : "sections"}.`);
            return;
        }
        const t = window.setTimeout(() => setRun((r) => (r ? { ...r, done: r.done + 1 } : r)), 2400);
        return () => window.clearTimeout(t);
    }, [run]);

    const statusOf = (id: IdentityTab): DraftStatus | null => {
        if (!run) return null;
        const i = run.sections.indexOf(id);
        if (i === -1) return "Kept";
        return i < run.done ? "Done" : i === run.done ? "Writing…" : "Queued";
    };
    const pending = (id: IdentityTab) => {
        const s = statusOf(id);
        return s === "Writing…" || s === "Queued";
    };

    const addProfile = (platform: SocialPlatform, handle: string) => {
        setProfiles((cur) => [...cur.filter((p) => p.platform !== platform), { platform, handle, stats: "No posts read yet" }]);
        notify(`${accountFor(platform).platformName} profile added. Perception will read it next.`);
    };

    /* ---- Brand snapshot, beside every tab ---- */
    const snapshot = (
        <aside aria-label="Brand snapshot" className="flex h-max flex-col gap-4 rounded-xl border border-secondary bg-primary p-5 shadow-xs">
            <div className="flex items-center justify-between">
                <h2 className="text-md font-semibold text-primary">Brand snapshot</h2>
                <BadgeWithDot color="gray" size="sm">
                    Live
                </BadgeWithDot>
            </div>
            <div className="flex flex-col gap-2.5">
                <Label>Palette</Label>
                <div className="flex flex-wrap gap-2.5">
                    {colours.map((c) => (
                        <span key={c.id} title={`${c.name} ${c.hex}`} className="size-10 rounded-lg ring-1 ring-black/10 ring-inset" style={{ backgroundColor: c.hex }} />
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Label>Voice</Label>
                <p className="text-sm text-secondary">“{voice.brand}”</p>
            </div>
            <div className="flex flex-col gap-2.5">
                <Label>Recurring motifs</Label>
                <div className="flex flex-wrap gap-2">
                    {motifs.map((m) => (
                        <Badge key={m.id} color="gray" size="md">
                            {m.name}
                        </Badge>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-2.5">
                <Label>Top rules</Label>
                <ul className="flex flex-col gap-2">
                    {[...dos.slice(0, 2).map((t) => [t, true] as const), ...donts.slice(0, 1).map((t) => [t, false] as const)].map(([t, ok]) => (
                        <li key={t} className="flex items-start gap-2 text-xs text-secondary">
                            {ok ? <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-fg-success-secondary" /> : <XClose aria-hidden className="mt-0.5 size-3.5 shrink-0 text-fg-error-secondary" />}
                            {t}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );

    const removeMenu = (label: string, onRemove: () => void) => (
        <Dropdown.Root>
            <Dropdown.DotsButton aria-label={label} />
            <Dropdown.Popover className="w-40">
                <Dropdown.Menu>
                    <Dropdown.Item icon={Trash01} onAction={onRemove}>
                        Remove
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown.Root>
    );

    /* ---- Panels ---- */
    const presence = (
        <div className="flex flex-col gap-5">
            <section className="flex items-center gap-4 rounded-xl border border-secondary bg-secondary p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-secondary bg-primary text-fg-secondary">
                    <Globe02 aria-hidden className="size-5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-primary">{domain}</span>
                    <span className="truncate text-xs text-tertiary">Read just now · 14 pages · product pages and About us</span>
                </div>
                <BadgeWithDot color="success" size="sm">
                    AI researched
                </BadgeWithDot>
                <Button color="secondary" size="md" iconLeading={Edit05} onClick={soon("Editing the website")}>
                    Edit
                </Button>
            </section>

            <section className="flex flex-col overflow-clip rounded-xl border border-secondary bg-secondary">
                <div className="flex flex-wrap items-center gap-3 p-5">
                    <div className="flex min-w-[220px] flex-1 flex-col gap-0.5">
                        <h2 className="text-md font-semibold text-primary">Social profiles</h2>
                        <p className="text-xs text-tertiary">{profiles.length} found · perception reads the last 25 posts on each</p>
                    </div>
                    <Button color="secondary" size="md" iconLeading={SearchLg} onClick={soon("Finding links")}>
                        Find links for me
                    </Button>
                    <AddHandlePopover defaultPlatform="instagram" placement="bottom end" onAdd={addProfile}>
                        <Button color="secondary" size="md" iconLeading={Plus}>
                            Add profile
                        </Button>
                    </AddHandlePopover>
                </div>
                <ul>
                    {profiles.map((p) => (
                        <li key={p.platform} className="flex items-center gap-3 border-t border-secondary bg-primary px-5 py-3.5">
                            <Logo platform={p.platform} />
                            <div className="flex min-w-0 flex-1 flex-col">
                                <span className="flex flex-wrap items-baseline gap-x-2 text-sm">
                                    <span className="font-semibold text-primary">{accountFor(p.platform).platformName}</span>
                                    <span className="truncate text-tertiary">{p.handle}</span>
                                </span>
                                <span className="truncate text-xs text-tertiary">{p.stats}</span>
                            </div>
                            <Button color="tertiary" size="sm" iconLeading={RefreshCcw01} aria-label={`Re-read ${accountFor(p.platform).platformName}`} onClick={() => notify(`Re-reading ${accountFor(p.platform).platformName}…`)} />
                            {removeMenu(`${accountFor(p.platform).platformName} options`, () => {
                                setProfiles((cur) => cur.filter((x) => x.platform !== p.platform));
                                notify(`${accountFor(p.platform).platformName} profile removed.`);
                            })}
                        </li>
                    ))}
                    {profiles.length === 0 && <li className="border-t border-secondary bg-primary px-5 py-8 text-center text-sm text-tertiary">No profiles yet. Add one so perception has something to read.</li>}
                </ul>
            </section>

            <div className="flex items-center gap-3 rounded-xl border border-secondary bg-linear-to-r from-[rgba(91,140,255,0.12)] to-[rgba(255,122,168,0.1)] p-4">
                <KraftyIcon />
                <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold text-primary">Adding a profile re-runs perception for that platform only</p>
                    <p className="text-xs text-tertiary">About 5 credits per platform. Your other research is kept.</p>
                </div>
            </div>
        </div>
    );

    const voicePanel = (
        <div className="flex flex-col gap-5">
            <Section title="Voice" sub="One line every script starts from." action={edited.includes("voice") && <BadgeWithDot color="warning" size="sm">Edited</BadgeWithDot>}>
                <TextArea label="Brand voice" rows={3} value={draft.brand} onChange={(v) => setDraft((d) => ({ ...d, brand: v }))} />
                <TextArea label="Tone" rows={3} value={draft.tone} onChange={(v) => setDraft((d) => ({ ...d, tone: v }))} />
            </Section>

            <Section
                title="Key words"
                sub="Words the AI reaches for in scripts and captions."
                action={
                    <QuickAdd label="Key word" placeholder="e.g. fresh-milled" onAdd={(w) => { setKeywords((k) => (k.includes(w) ? k : [...k, w])); markEdited("voice"); }}>
                        <Button color="secondary" size="md" iconLeading={Plus}>
                            Add word
                        </Button>
                    </QuickAdd>
                }
            >
                <ul className="flex flex-wrap gap-2">
                    {keywords.map((k) => (
                        <li key={k}>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary bg-primary py-1 pr-1.5 pl-3 text-sm font-medium text-secondary">
                                {k}
                                <button
                                    type="button"
                                    aria-label={`Remove ${k}`}
                                    onClick={() => { setKeywords((cur) => cur.filter((x) => x !== k)); markEdited("voice"); }}
                                    className="flex size-5 items-center justify-center rounded-full text-fg-quaternary outline-focus-ring hover:bg-secondary_hover hover:text-fg-quaternary_hover focus-visible:outline-2"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </span>
                        </li>
                    ))}
                </ul>
            </Section>

            <section className="flex flex-col gap-3 rounded-xl border border-secondary bg-linear-to-br from-[rgba(91,140,255,0.1)] to-[rgba(255,122,168,0.1)] p-5">
                <div className="flex items-center gap-2.5">
                    <KraftyIcon />
                    <h2 className="flex-1 text-md font-semibold text-primary">Why the AI wrote this</h2>
                    <BadgeWithDot color="brand" size="sm">
                        From research
                    </BadgeWithDot>
                </div>
                <ul className="flex flex-col gap-3">
                    {EVIDENCE.map((e) => (
                        <li key={e.quote} className="flex flex-col gap-0.5 border-l-2 border-secondary pl-3">
                            <span className="text-sm text-primary">{e.quote}</span>
                            <span className="text-xs text-tertiary">{e.source}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );

    // Contrast of the colour pairs that matter on an ad, worked out from the palette itself.
    const by = (role: BrandColour["role"]) => colours.find((c) => c.role === role) ?? colours[0];
    const [primary, secondary, background] = [by("Primary"), by("Secondary"), by("Background")];
    const checks = [
        { label: `${primary.name} on ${background.name}`, ratio: contrast(primary.hex, background.hex) },
        { label: `${background.name} on ${primary.name}`, ratio: contrast(background.hex, primary.hex) },
        { label: `White on ${secondary.name}`, ratio: contrast("#FFFFFF", secondary.hex) },
    ];
    const weak = checks.find((c) => c.ratio < 4.5);

    const palettePanel = (
        <div className="flex flex-col gap-5">
            <Section
                title="Brand colours"
                sub="Taken from your logo. Colours are used in this order."
                action={
                    <div className="flex items-center gap-2.5">
                        <BadgeWithDot color="gray" size="sm">
                            From your logo
                        </BadgeWithDot>
                        <QuickAdd label="Colour (hex)" placeholder="#7A5AF8" onAdd={(v) => {
                            const hex = v.startsWith("#") ? v : `#${v}`;
                            if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return notify("Enter a colour like #7A5AF8.");
                            setColours((c) => [...c, { id: crypto.randomUUID(), name: `Colour ${c.length + 1}`, hex: hex.toUpperCase(), role: "Accent" }]);
                            markEdited("palette");
                        }}>
                            <Button color="secondary" size="md" iconLeading={Plus}>
                                Add colour
                            </Button>
                        </QuickAdd>
                    </div>
                }
            >
                <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {colours.map((c) => (
                        <li key={c.id} className="flex flex-col overflow-clip rounded-xl border border-secondary bg-primary">
                            <span className="h-24" style={{ backgroundColor: c.hex }} />
                            <div className="flex flex-col gap-2 p-3">
                                <div className="flex items-start justify-between gap-1">
                                    <span className="flex min-w-0 flex-col">
                                        <span className="truncate text-sm font-semibold text-primary">{c.name}</span>
                                        <span className="text-xs text-tertiary">{c.hex}</span>
                                    </span>
                                    {colours.length > 1 && removeMenu(`${c.name} options`, () => { setColours((cur) => cur.filter((x) => x.id !== c.id)); markEdited("palette"); })}
                                </div>
                                <span>
                                    <Badge color={c.role === "Primary" ? "success" : "gray"} size="sm">
                                        {c.role}
                                    </Badge>
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section title="How it looks on an ad" sub="A caption and end card using these colours.">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_minmax(0,1.1fr)]">
                    <div className="flex min-h-[260px] flex-col justify-end gap-3 rounded-xl p-4" style={{ backgroundColor: primary.hex }}>
                        <span className="w-max rounded-md px-3 py-1.5 text-sm font-semibold" style={{ backgroundColor: background.hex, color: primary.hex }}>
                            Edited by morning.
                        </span>
                        <span className="text-xs text-white/90">Hundreds of frames, culled while you sleep.</span>
                    </div>
                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl p-4 text-center" style={{ backgroundColor: background.hex }}>
                        <img src={logo} alt="" className="size-12 rounded-xl object-cover" />
                        <span className="text-sm font-semibold" style={{ color: primary.hex }}>
                            {brandName}
                        </span>
                        <span className="rounded-full px-4 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: secondary.hex }}>
                            Try it free
                        </span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-semibold text-primary">Contrast check</h3>
                        <ul className="flex flex-col gap-2.5">
                            {checks.map((c) => (
                                <li key={c.label} className="flex items-start gap-2 text-xs text-secondary">
                                    {c.ratio >= 4.5 ? <CheckCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-success-secondary" /> : <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-warning-primary" />}
                                    <span className="flex-1">{c.label}</span>
                                    <span className="tabular-nums text-tertiary">{c.ratio.toFixed(1)} : 1</span>
                                </li>
                            ))}
                        </ul>
                        {weak && <p className="text-xs text-tertiary">{weak.label} is hard to read on small captions. The AI will use a darker colour instead.</p>}
                    </div>
                </div>
            </Section>
        </div>
    );

    const ruleCard = (title: string, items: string[], ok: boolean, set: (v: string[]) => void) => (
        <Section
            title={title}
            action={
                <QuickAdd label={ok ? "New do" : "New don’t"} placeholder={ok ? "e.g. Show the album proof" : "e.g. No jargon"} onAdd={(v) => { set([...items, v]); markEdited("dos"); }}>
                    <Button color="secondary" size="sm" iconLeading={Plus}>
                        Add
                    </Button>
                </QuickAdd>
            }
        >
            <ul className="flex flex-col gap-2.5">
                {items.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-sm text-secondary">
                        {ok ? <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-success-secondary" /> : <XClose aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-error-secondary" />}
                        <span className="flex-1">{t}</span>
                        <button type="button" aria-label={`Remove “${t}”`} onClick={() => { set(items.filter((x) => x !== t)); markEdited("dos"); }} className="text-fg-quaternary outline-focus-ring hover:text-fg-quaternary_hover focus-visible:outline-2">
                            <X className="size-4" />
                        </button>
                    </li>
                ))}
            </ul>
        </Section>
    );
    const dosPanel = (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {ruleCard("Do", dos, true, setDos)}
            {ruleCard("Don’t", donts, false, setDonts)}
        </div>
    );

    const motifsPanel = (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-tertiary">
                    {motifs.length} motifs · found in your last 25 posts
                </p>
                <QuickAdd label="Motif name" placeholder="e.g. Contact sheet" onAdd={(name) => {
                    setMotifs((m) => [...m, { id: crypto.randomUUID(), name, description: "Added by you. The AI will look for it in your posts.", seen: 0, art: "linear-gradient(135deg, #a4a7ae 0%, #5b8cff 100%)" }]);
                    markEdited("motifs");
                }}>
                    <Button color="secondary" size="md" iconLeading={Plus}>
                        Add motif
                    </Button>
                </QuickAdd>
            </div>
            <ul className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                {motifs.map((m) => (
                    <li key={m.id} className="flex flex-col overflow-clip rounded-xl border border-secondary bg-secondary">
                        <div className="relative h-36" style={{ backgroundImage: m.art }}>
                            <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white">
                                <Image03 aria-hidden className="size-3.5" />3 examples
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-semibold text-primary">{m.name}</h3>
                                {removeMenu(`${m.name} options`, () => { setMotifs((cur) => cur.filter((x) => x.id !== m.id)); markEdited("motifs"); })}
                            </div>
                            <p className="text-xs text-tertiary">{m.description}</p>
                            <span>
                                <Badge color="gray" size="md">
                                    Seen in {m.seen} of 25 posts
                                </Badge>
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );

    const guardrailsPanel = (
        <div className="flex flex-col gap-5">
            <section className="flex flex-col overflow-clip rounded-xl border border-secondary bg-secondary">
                <div className="flex items-start justify-between gap-3 p-5">
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-md font-semibold text-primary">
                            {guardrails.length} guardrails
                        </h2>
                        <p className="text-xs text-tertiary">Legal, safety and category rules</p>
                    </div>
                    <QuickAdd label="Guardrail" placeholder="e.g. No price promises" onAdd={(text) => {
                        setGuardrails((g) => [...g, { id: crypto.randomUUID(), text, category: "Brand", severity: "Warns" }]);
                        markEdited("guardrails");
                    }}>
                        <Button color="secondary" size="md" iconLeading={Plus}>
                            Add guardrail
                        </Button>
                    </QuickAdd>
                </div>
                <ul>
                    {guardrails.map((g) => (
                        <li key={g.id} className="flex items-center gap-3 border-t border-secondary bg-primary px-5 py-3.5">
                            <IconTile icon={g.severity === "Blocks render" ? Lock01 : AlertTriangle} tone={g.severity === "Blocks render" ? "error" : "warning"} />
                            <div className="flex min-w-0 flex-1 flex-col">
                                <span className="text-sm font-medium text-primary">{g.text}</span>
                                <span className="text-xs text-tertiary">{g.category}</span>
                            </div>
                            <BadgeWithDot color={g.severity === "Blocks render" ? "error" : "warning"} size="sm">
                                {g.severity}
                            </BadgeWithDot>
                            {removeMenu(`${g.text} options`, () => { setGuardrails((cur) => cur.filter((x) => x.id !== g.id)); markEdited("guardrails"); })}
                        </li>
                    ))}
                </ul>
            </section>

            <Section
                title="Last check"
                sub="Quick Ad “Edited by morning” · 2 hours ago"
                action={
                    <BadgeWithDot color="success" size="sm">
                        Passed
                    </BadgeWithDot>
                }
            >
                <ul className="flex flex-col gap-2.5 text-sm text-secondary">
                    <li className="flex items-center gap-2.5"><CheckCircle aria-hidden className="size-4 text-fg-success-secondary" />No turnaround promises found in script</li>
                    <li className="flex items-center gap-2.5"><CheckCircle aria-hidden className="size-4 text-fg-success-secondary" />Client release shown at 0:21</li>
                    <li className="flex items-center gap-2.5"><AlertTriangle aria-hidden className="size-4 text-fg-warning-primary" />Caption mentions “cheaper than Lightroom”, removed before render</li>
                </ul>
            </Section>
        </div>
    );

    const panels: Record<IdentityTab, ReactNode> = { presence, voice: voicePanel, palette: palettePanel, dos: dosPanel, motifs: motifsPanel, guardrails: guardrailsPanel };
    const progress = run ? (run.done / run.sections.length) * 100 : 0;

    return (
        <>
            <div className="flex w-full flex-wrap items-end gap-4">
                <div className="flex min-w-[260px] flex-1 flex-col gap-1">
                    <h1 className="text-xl font-semibold text-primary">Identity</h1>
                    <p className="text-sm text-tertiary">{current.blurb.replace("{brand}", brandName)}</p>
                </div>
                {run ? (
                    <Button color="secondary" size="md" iconLeading={XClose} onClick={() => { setRun(null); notify("Re-draft stopped. Sections already done are kept."); }}>
                        Stop
                    </Button>
                ) : (
                    // Same gradient as the Krafty icon in the left rail: blue → mauve → pink
                    <button
                        type="button"
                        onClick={() => setRedrafting(true)}
                        className="group flex items-center gap-2 rounded-lg bg-linear-to-r from-[#5b8cff] via-[#b68cac] to-[#f57489] py-2.5 pr-4 pl-3 text-sm font-semibold text-white shadow-xs outline-focus-ring hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        <KraftyIcon white />
                        Re-draft identity
                    </button>
                )}
            </div>

            {run && (
                <section className="flex flex-col gap-3 rounded-xl border border-secondary bg-linear-to-r from-[rgba(91,140,255,0.12)] to-[rgba(255,122,168,0.1)] p-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#5b8cff] to-[#f57489] text-white">
                            <Stars01 className="size-5" />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <h2 className="text-sm font-semibold text-primary">
                                Re-drafting {run.sections.length} {run.sections.length === 1 ? "section" : "sections"} · {run.done} of {run.sections.length} done
                            </h2>
                            <p className="text-xs text-tertiary">
                                {IDENTITY_TABS.filter((t) => !run.sections.includes(t.id)).map((t) => t.label).join(", ") || "Nothing"} {run.sections.length === IDENTITY_TABS.length ? "is" : "are"} kept as you edited them. You can leave this page.
                            </p>
                        </div>
                        <span className="text-xs text-tertiary">~{Math.max(1, Math.ceil(((run.sections.length - run.done) * 2.4) / 60))} min left</span>
                    </div>
                    <ProgressBarBase value={Math.max(progress, 6)} className="h-1" progressClassName="bg-linear-to-r from-[#5b8cff] to-[#f57489]" />
                    <ul className="flex flex-wrap gap-2">
                        {run.sections.map((id, i) => {
                            const st = statusOf(id)!;
                            return (
                                <li
                                    key={id}
                                    className={cx(
                                        "flex items-center gap-1.5 rounded-full border bg-primary px-3 py-1 text-xs font-medium",
                                        st === "Writing…" ? "border-utility-blue-500 text-primary" : "border-secondary text-secondary",
                                    )}
                                >
                                    {st === "Done" ? <CheckCircle aria-hidden className="size-3.5 text-fg-success-secondary" /> : <span aria-hidden className={cx("size-1.5 rounded-full", st === "Writing…" ? "animate-pulse bg-utility-blue-500" : "bg-fg-quaternary")} />}
                                    {IDENTITY_TABS.find((t) => t.id === id)!.label}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}

            <Tabs selectedKey={tab} onSelectionChange={(k) => onTab(k as IdentityTab)} className="flex shrink-0 flex-col gap-5">
                <TabList type="underline" size="md" items={IDENTITY_TABS.map((t) => ({ id: t.id, label: t.label }))} className="shrink-0 overflow-x-auto">
                    {(t) => <Tab id={t.id} label={t.label} badge={statusOf(t.id as IdentityTab) ?? undefined} />}
                </TabList>
                <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="min-w-0">
                        {IDENTITY_TABS.map((t) => (
                            <TabPanel key={t.id} id={t.id}>
                                {pending(t.id) ? (
                                    <div className="flex flex-col gap-4">
                                        <Skeleton />
                                        <Skeleton />
                                    </div>
                                ) : (
                                    panels[t.id]
                                )}
                            </TabPanel>
                        ))}
                    </div>
                    {snapshot}
                </div>
            </Tabs>

            {tab === "voice" && voiceDirty && (
                <div className="sticky bottom-2 z-20 mx-auto flex w-full max-w-[560px] items-center gap-3 rounded-xl border border-secondary bg-primary py-2.5 pr-2.5 pl-4 shadow-lg">
                    <span aria-hidden className="size-2 rounded-full bg-[#f79009]" />
                    <span className="flex-1 text-sm font-semibold text-primary">Unsaved changes in Voice &amp; tone</span>
                    <Button color="tertiary" size="md" onClick={() => setDraft(voice)}>
                        Discard
                    </Button>
                    <Button
                        size="md"
                        onClick={() => {
                            setVoice(draft);
                            markEdited("voice");
                            notify("Voice & tone saved.");
                        }}
                    >
                        Save changes
                    </Button>
                </div>
            )}

            <RedraftIdentityModal
                key={edited.join(",")}
                isOpen={redrafting}
                onClose={() => setRedrafting(false)}
                edited={edited}
                onStart={(sections) => {
                    setRedrafting(false);
                    setRun({ sections, done: 0 });
                }}
            />
        </>
    );
};
