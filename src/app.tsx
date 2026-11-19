import { useState } from "react";
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
const initialStep = (): StepId => {
    const q = new URLSearchParams(window.location.search).get("step");
    return (STEP_ORDER as readonly string[]).includes(q ?? "") ? (q as StepId) : "website";
};

/** Prototype harness: the Brands page with the new-brand onboarding modal open. */
export const App = () => {
    const [isOpen, setOpen] = useState(true);
    const [stepId, setStepId] = useState<StepId>(initialStep);
    const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);
    const [viewing, setViewing] = useState<string | null>(null); // id of the researching brand whose progress is open
    const [overviewId, setOverviewId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [toast, setToast] = useState<string>();

    const notify = (msg: string) => {
        setToast(msg);
        window.setTimeout(() => setToast(undefined), 2800);
    };

    const goTo = (id: StepId) => {
        setStepId(id);
        const url = new URL(window.location.href);
        url.searchParams.set("step", id);
        window.history.replaceState(null, "", url);
    };
    const index = STEP_ORDER.indexOf(stepId);
    const next = () => {
        if (index < STEP_ORDER.length - 1) return goTo(STEP_ORDER[index + 1]);
        // The last step's "Add client": the brand lists on the Brands page (or the researching card finishes).
        if (viewing) {
            setBrands((b) => b.map((x) => (x.id === viewing ? { ...x, status: "researched", channels: draft.channels as SocialPlatform[] } : x)));
            setViewing(null);
            setOpen(false);
            return;
        }
        setBrands((b) => [...b, { id: crypto.randomUUID(), name: BRAND.name, domain: BRAND.domain, category: BRAND.category, logo: brandLogo, channels: draft.channels as SocialPlatform[], status: "researched", createdAt: Date.now() }]);
        setOpen(false);
    };
    const back = () => (index > 0 ? goTo(STEP_ORDER[index - 1]) : setOpen(false));

    const overview = brands.find((b) => b.id === overviewId && b.status === "researched") ?? null;
    const step = STEPS[stepId];
    const Step = step.Component;
    const stepProps = { draft, update: (p: Partial<OnboardingDraft>) => setDraft((d) => ({ ...d, ...p })), next, back, goTo, notify };
    const saveAndExit = () => {
        setOpen(false);
        if (stepId === "research" && viewing) {
            setViewing(null);
            return notify("Still researching in the background.");
        }
        if (stepId === "research") {
            // "Run in background": the brand lists now, marked as still being researched.
            const domain = draft.website.trim() || BRAND.domain;
            const label = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split(/[./]/)[0];
            const name = draft.website.trim() ? label.charAt(0).toUpperCase() + label.slice(1) : BRAND.name;
            setBrands((b) => [...b, { id: crypto.randomUUID(), name, domain, category: BRAND.category, logo: brandLogo, channels: [], status: "researching", createdAt: Date.now() }]);
            return notify(`${name} is researching in the background.`);
        }
        notify("Draft saved. Pick it up from Brands any time.");
    };
    const openBrand = (b: Brand) => {
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
                <BrandsSidebar statusFilter={statusFilter} onStatusFilter={setStatusFilter} brands={brands} onOpenBrand={openBrand} brandCount={brands.length} researchingCount={brands.filter((b) => b.status === "researching").length} onNewBrand={() => window.location.assign("?step=website")} />
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
                onOpenChange={setOpen}
                ariaLabel={step.ariaLabel}
                phase={step.phase}
                phaseFill={step.phaseFill}
                glow={isWave ? "none" : step.glow}
                topFade={isWave ? false : step.topFade}
                chrome={isWave ? false : step.chrome}
                modalClassName={isWave ? "bg-transparent" : step.modalClassName}
                saveLabel={step.saveLabel}
                onBack={() => setOpen(false)}
                onSaveAndExit={saveAndExit}
            >
                {isWave ? (
                    <TrendsReadyWave revealed={stepId === "ready"} stepProps={stepProps} onClose={() => setOpen(false)} onSaveAndExit={saveAndExit} />
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
