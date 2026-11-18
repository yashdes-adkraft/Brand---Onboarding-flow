import { useState } from "react";
import { type OnboardingDraft, STEP_ORDER, type StepId, initialDraft } from "@/features/brand-onboarding/flow";
import { OnboardingModal } from "@/features/brand-onboarding/onboarding-modal";
import { STEPS } from "@/features/brand-onboarding/steps";
import { AppRail, BrandsPage, BrandsSidebar } from "@/layout/app-shell";

/** `?step=goals` deep-links straight to a step — handy for reviewing one Figma screen at a time. */
const initialStep = (): StepId => {
    const q = new URLSearchParams(window.location.search).get("step");
    return (STEP_ORDER as readonly string[]).includes(q ?? "") ? (q as StepId) : "website";
};

/** Prototype harness: the Brands page with the new-brand onboarding modal open. */
export const App = () => {
    const [isOpen, setOpen] = useState(true);
    const [stepId, setStepId] = useState<StepId>(initialStep);
    const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);
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
    const next = () => (index < STEP_ORDER.length - 1 ? goTo(STEP_ORDER[index + 1]) : setOpen(false));
    const back = () => (index > 0 ? goTo(STEP_ORDER[index - 1]) : setOpen(false));

    const step = STEPS[stepId];
    const Step = step.Component;

    return (
        <div className="flex h-dvh w-full overflow-hidden bg-primary">
            <AppRail />
            <BrandsSidebar />
            <BrandsPage
                // A fresh page load resets the draft and every module-level store (market, socials, review edits) in one go.
                onNewBrand={() => window.location.assign("?step=website")}
            />

            <OnboardingModal
                isOpen={isOpen}
                onOpenChange={setOpen}
                ariaLabel={step.ariaLabel}
                phase={step.phase}
                phaseFill={step.phaseFill}
                glow={step.glow}
                topFade={step.topFade}
                chrome={step.chrome}
                modalClassName={step.modalClassName}
                saveLabel={step.saveLabel}
                onBack={() => setOpen(false)}
                onSaveAndExit={() => {
                    setOpen(false);
                    notify("Draft saved. Pick it up from Brands any time.");
                }}
            >
                <Step key={stepId} draft={draft} update={(p) => setDraft((d) => ({ ...d, ...p }))} next={next} back={back} goTo={goTo} notify={notify} />
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
