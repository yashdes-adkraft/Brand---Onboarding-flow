import { useCallback, useEffect, useRef, useState } from "react";
import { type OnboardingDraft, STEP_ORDER, type StepId, initialDraft } from "@/features/brand-onboarding/flow";
import { OnboardingModal } from "@/features/brand-onboarding/onboarding-modal";
import { STEPS } from "@/features/brand-onboarding/steps";
import { TrendsReadyWave } from "@/features/brand-onboarding/trends-ready-wave";
import { type Brand } from "@/layout/brand-card";
import { BRAND, type SocialPlatform } from "@/features/brand-onboarding/review/review-data";
import brandLogo from "@/assets/review/brand-logo.png";
import { AppRail, BrandsPage, BrandsSidebar, type StatusFilter } from "@/layout/app-shell";
import { BrandOverview } from "@/layout/brand-overview";

/** `?step=review` deep-links straight to a step — handy for reviewing one Figma screen at a time. */
const hasStepParam = () => new URLSearchParams(window.location.search).has("step");
const initialStep = (): StepId => {
    const q = new URLSearchParams(window.location.search).get("step");
    return [...STEP_ORDER, "manual"].includes(q as StepId) ? (q as StepId) : "website";
};

/** Brands live in the tab's session storage, so "New brand" (a full reload that clears the onboarding stores) keeps them. */
const STORAGE_KEY = "adkraft.brands";
const loadBrands = (): Brand[] => {
    try {
        return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "[]") as Brand[];
    } catch {
        return [];
    }
};

/** Prototype: how long background research takes before the brand counts as researched and its glow stops. */
const RESEARCH_MS = 20_000;

/** A grey tile with the brand's first letter, for a brand that has no logo yet. */
const monogram = (name: string) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#EEF0F3"/><text x="48" y="62" font-family="Inter,Arial,sans-serif" font-size="44" font-weight="600" text-anchor="middle" fill="#535862">${(name.trim()[0] ?? "?").toUpperCase().replace(/[<>&]/g, "")}</text></svg>`,
    )}`;

/** "aftershoot.com" -> "Aftershoot" */
const nameFromSite = (website: string) => {
    const label = website.replace(/^(https?:\/\/)?(www\.)?/, "").split(/[./]/)[0];
    return label ? label.charAt(0).toUpperCase() + label.slice(1) : "";
};

/** Prototype harness: the Brands page with the new-brand onboarding modal open. */
export const App = () => {
    const [brands, setBrands] = useState<Brand[]>(loadBrands);
    // Open on a fresh page only when asked for a step, or when there is nothing else to show yet.
    const [isOpen, setOpen] = useState(() => hasStepParam() || brands.length === 0);
    const [stepId, setStepId] = useState<StepId>(initialStep);
    const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);
    const [viewing, setViewing] = useState<string | null>(null); // id of the saved or researching brand whose onboarding is open
    const [overviewId, setOverviewId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);
    const [toast, setToast] = useState<string>();

    const notify = useCallback((msg: string) => {
        setToast(msg);
        window.setTimeout(() => setToast(undefined), 2800);
    }, []);

    useEffect(() => {
        try {
            window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
        } catch {
            /* storage full or blocked: the brands just stay in memory */
        }
    }, [brands]);

    // Research finishes after a while: the card stops glowing and becomes a researched brand.
    const brandsRef = useRef(brands);
    brandsRef.current = brands;
    useEffect(() => {
        const t = window.setInterval(() => {
            const now = Date.now();
            const done = brandsRef.current.filter((b) => b.status === "researching" && now - b.createdAt >= RESEARCH_MS);
            if (!done.length) return;
            setBrands((all) => all.map((b) => (done.some((d) => d.id === b.id) ? { ...b, status: "researched" } : b)));
            notify(done.length === 1 ? `${done[0].name} research is done.` : `${done.length} brands finished researching.`);
        }, 1000);
        return () => window.clearInterval(t);
    }, [notify]);

    const goTo = (id: StepId) => {
        setStepId(id);
        const url = new URL(window.location.href);
        url.searchParams.set("step", id);
        window.history.replaceState(null, "", url);
    };
    /** Close the onboarding and drop `?step=`, so reloading the Brands page doesn't reopen it. */
    const closeModal = () => {
        setOpen(false);
        setViewing(null);
        const url = new URL(window.location.href);
        url.searchParams.delete("step");
        window.history.replaceState(null, "", url);
    };
    const patchBrand = (id: string, patch: Partial<Brand>) => setBrands((all) => all.map((b) => (b.id === id ? { ...b, ...patch } : b)));

    const index = (STEP_ORDER as readonly string[]).indexOf(stepId);
    const next = () => {
        if (index >= 0 && index < STEP_ORDER.length - 1) return goTo(STEP_ORDER[index + 1]);
        // The last step's "Add client": the brand lists on the Brands page (or the saved / researching card is completed).
        const done: Brand = { id: viewing ?? crypto.randomUUID(), name: BRAND.name, domain: BRAND.domain, category: BRAND.category, logo: brandLogo, channels: draft.channels as SocialPlatform[], status: "researched", createdAt: Date.now() };
        setBrands((all) => (viewing ? all.map((b) => (b.id === viewing ? done : b)) : [...all, done]));
        closeModal();
    };
    const back = () => (index > 0 ? goTo(STEP_ORDER[index - 1]) : closeModal());

    const createBrand = () => {
        const m = draft.manual;
        const name = m.name.trim();
        if (!name) return;
        const made: Brand = { id: viewing ?? crypto.randomUUID(), name, domain: m.website.trim(), category: m.category || "Not set", logo: m.logo ?? monogram(name), channels: [], colours: m.colours, status: "researched", createdAt: Date.now() };
        setBrands((all) => (viewing ? all.map((b) => (b.id === viewing ? made : b)) : [...all, made]));
        closeModal();
        notify(`${name} added.`);
    };

    const overview = brands.find((b) => b.id === overviewId && b.status !== "draft") ?? null;
    const step = STEPS[stepId];
    const Step = step.Component;
    const stepProps = { draft, update: (p: Partial<OnboardingDraft>) => setDraft((d) => ({ ...d, ...p })), next, back, goTo, notify, createBrand };

    const saveAndExit = () => {
        const active = viewing ? brands.find((b) => b.id === viewing) : undefined;
        if (stepId === "research") {
            if (active?.status === "researching") {
                closeModal();
                return notify("Still researching in the background.");
            }
            // "Run in background": the brand lists now, glowing until research finishes (a saved draft is promoted in place).
            const domain = draft.website.trim() || BRAND.domain;
            const name = nameFromSite(draft.website) || BRAND.name;
            const researching: Brand = { id: active?.id ?? crypto.randomUUID(), name, domain, category: BRAND.category, logo: brandLogo, channels: [], status: "researching", createdAt: Date.now() };
            setBrands((all) => (active ? all.map((b) => (b.id === active.id ? researching : b)) : [...all, researching]));
            closeModal();
            return notify(`${name} is researching in the background.`);
        }
        // Any other step: keep what was entered as a draft card, to carry on from this very step later.
        const m = draft.manual;
        const started = stepId !== "website" || draft.website.trim();
        if (!started) {
            closeModal();
            return notify("Nothing to save yet.");
        }
        const name = m.name.trim() || nameFromSite(draft.website) || "Untitled brand";
        const saved: Brand = {
            id: active?.id ?? crypto.randomUUID(),
            name,
            domain: draft.website.trim() || m.website.trim(),
            category: draft.category ?? m.category,
            logo: m.logo ?? monogram(name),
            channels: [],
            colours: m.colours,
            status: "draft",
            resume: { step: stepId, data: draft },
            createdAt: Date.now(),
        };
        setBrands((all) => (active ? all.map((b) => (b.id === active.id ? saved : b)) : [...all, saved]));
        closeModal();
        notify(`${name} saved as a draft. Continue it from Brands.`);
    };
    const openBrand = (b: Brand) => {
        if (b.status === "draft" && b.resume) {
            // Resume: the answers come back and onboarding opens on the step where the user left.
            setDraft(b.resume.data);
            setViewing(b.id);
            goTo(b.resume.step);
            return setOpen(true);
        }
        if (b.status !== "researching") return setOverviewId(b.id);
        // View progress: back to the research screen, where "Run in background" was pressed.
        setViewing(b.id);
        goTo("research");
        setOpen(true);
    };
    // Trends and the final screen share one wave container, so the wave can carry one into the other.
    const isWave = stepId === "trends" || stepId === "ready";

    return (
        <div className="flex h-dvh w-full overflow-hidden bg-primary">
            <AppRail onBrands={() => setOverviewId(null)} />
            {overview ? (
                <BrandOverview brand={overview} onBrands={() => setOverviewId(null)} notify={notify} />
            ) : (
                <>
                <BrandsSidebar statusFilter={statusFilter} onStatusFilter={setStatusFilter} brands={brands} onOpenBrand={openBrand} brandCount={brands.length} researchingCount={brands.filter((b) => b.status === "researching").length} draftCount={brands.filter((b) => b.status === "draft").length} onNewBrand={() => window.location.assign("?step=website")} />
                <BrandsPage statusFilter={statusFilter}
                    // A fresh page load resets the draft and every module-level store (market, socials, review edits) in one go.
                    onNewBrand={() => window.location.assign("?step=website")}
                    brands={brands}
                    onOpenBrand={openBrand}
                    onDeleteBrand={(b) => {
                        setBrands((all) => all.filter((x) => x.id !== b.id));
                        notify(`${b.name} deleted.`);
                    }}
                />
                </>
            )}

            <OnboardingModal
                isOpen={isOpen}
                onOpenChange={(open) => (open ? setOpen(true) : closeModal())}
                ariaLabel={step.ariaLabel}
                phase={step.phase}
                phaseFill={step.phaseFill}
                glow={isWave ? "none" : step.glow}
                topFade={isWave ? false : step.topFade}
                chrome={isWave ? false : step.chrome}
                modalClassName={isWave ? "bg-transparent" : step.modalClassName}
                saveLabel={step.saveLabel}
                onBack={closeModal}
                onSaveAndExit={saveAndExit}
            >
                {isWave ? (
                    <TrendsReadyWave revealed={stepId === "ready"} stepProps={stepProps} onClose={closeModal} onSaveAndExit={saveAndExit} />
                ) : (
                    <Step key={stepId} {...stepProps} />
                )}
            </OnboardingModal>

            <div
                role="status"
                aria-live="polite"
                className={`fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-primary-solid px-3.5 py-2.5 text-sm font-medium text-white shadow-lg transition-opacity ${toast ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
                {toast}
            </div>
        </div>
    );
};
