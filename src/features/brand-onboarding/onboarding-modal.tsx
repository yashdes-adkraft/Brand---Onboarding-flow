import { type ReactNode, useEffect, useState } from "react";
import { ChevronLeft } from "@untitledui/icons";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import glowCenter from "@/assets/glow.svg";
import glowTop from "@/assets/glow-top.svg";
import { OnboardingProgress } from "./onboarding-progress";

/**
 * Figma glow placements inside the 1198×751 modal.
 * - "center": Onboarding 1 (66:2335) — exported already in modal coordinates.
 * - "top":    question steps (e.g. 66:2745) — 1100×520 ellipse at (49,-300), 16% opacity, blur 90.
 * - "none":   screens without a glow (review, competitors, trends…).
 */
export type OnboardingGlow = "center" | "top" | "none";

export interface OnboardingModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    /** Accessible name for the dialog, e.g. "New brand: business category". */
    ariaLabel: string;
    /** Active phase: 0 Client, 1 Brand & social, 2 Competitors & trends. */
    phase: number;
    /** 0–1 fill of the active phase's bar. */
    phaseFill: number;
    glow?: OnboardingGlow;
    /** Show the white top fade (Figma "Top fade"). Defaults to true when there is a glow. */
    topFade?: boolean;
    /** Back link, progress and "Save and exit". Off for full-bleed screens like the final summary. */
    chrome?: boolean;
    /** Overrides the 1198×751 box (size, radius). */
    modalClassName?: string;
    saveLabel?: string;
    onBack: () => void;
    backLabel?: string;
    onSaveAndExit: () => void;
    children: ReactNode;
    className?: string;
}

const MODAL_W = 1198;
const MODAL_H = 751;

/**
 * The onboarding screens are laid out at a fixed 1198×751. On a smaller window (a laptop at 100% zoom, a short browser
 * window) the modal would be cut off and the bottom buttons, such as "Confirm brand", would be out of reach. This works
 * out how much to shrink the whole modal so it always fits, with a little room around it; it never scales up.
 */
const useFitScale = (margin = 24) => {
    const fit = () => Math.min(1, (window.innerWidth - margin * 2) / MODAL_W, (window.innerHeight - margin * 2) / MODAL_H);
    const [scale, setScale] = useState(fit);
    useEffect(() => {
        const onResize = () => setScale(fit());
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return scale;
};

/** The glow, top fade and header (back link, progress, save button) that every step shares — inside the modal, or inside a wave view. */
export const ModalFrame = ({
    phase,
    phaseFill,
    glow = "top",
    topFade = glow !== "none",
    chrome = true,
    saveLabel = "Save and exit",
    onBack,
    backLabel = "Brands",
    onSaveAndExit,
    children,
}: Pick<OnboardingModalProps, "phase" | "phaseFill" | "glow" | "topFade" | "chrome" | "saveLabel" | "onBack" | "backLabel" | "onSaveAndExit" | "children">) => (
    <>
    {glow === "center" && <img src={glowCenter} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full max-w-none" />}
    {glow === "top" && (
        <img src={glowTop} alt="" aria-hidden className="pointer-events-none absolute top-[-480px] left-[-131px] h-[880px] w-[1460px] max-w-none" />
    )}
    {topFade && (
        <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-[-121px] h-[900px] w-[1440px] bg-linear-to-b from-white/0 via-white/60 via-55% to-white"
        />
    )}

    {chrome && (
        <>
            <button
                type="button"
                onClick={onBack}
                className="absolute top-8 left-8 z-10 flex items-center gap-1.5 rounded-md text-sm font-medium text-tertiary outline-focus-ring hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2"
            >
                <ChevronLeft className="size-4" />
                {backLabel}
            </button>

            <OnboardingProgress className="absolute top-6 left-[299px] z-10 max-lg:hidden" current={phase} currentFill={phaseFill} />

            <Button color="secondary" size="sm" // Right-anchored (Figma: x 1042 + 118 wide = 38px from the edge) so longer labels like "Run in background" grow leftwards.
                className="absolute top-6 right-[38px] z-10 max-lg:right-6" onClick={onSaveAndExit}>
                {saveLabel}
            </Button>
        </>
    )}

        {children}
    </>
);

/** The persistent new-brand modal (Figma "Modal", 1198×751) — every onboarding step renders inside it. */
export const OnboardingModal = ({
    isOpen,
    onOpenChange,
    ariaLabel,
    phase,
    phaseFill,
    glow = "top",
    topFade = glow !== "none",
    chrome = true,
    modalClassName,
    saveLabel = "Save and exit",
    onBack,
    backLabel = "Brands",
    onSaveAndExit,
    children,
    className,
}: OnboardingModalProps) => {
    const scale = useFitScale();
    return (
    <ModalOverlay
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        // Figma: bg-overlay @ 70%, background blur 16 (= CSS blur 8px)
        className="backdrop-blur-[8px] sm:items-center"
    >
        <Modal style={scale < 1 ? { scale } : undefined} className={cx("h-[751px] max-h-none w-[1198px] max-w-none shrink-0 overflow-clip rounded-2xl shadow-none sm:mt-px sm:rounded-2xl", modalClassName)}>
            <Dialog aria-label={ariaLabel} className={cx("relative h-full overflow-clip", className)}>
                <ModalFrame
                    phase={phase}
                    phaseFill={phaseFill}
                    glow={glow}
                    topFade={topFade}
                    chrome={chrome}
                    saveLabel={saveLabel}
                    onBack={onBack}
                    backLabel={backLabel}
                    onSaveAndExit={onSaveAndExit}
                >
                    {children}
                </ModalFrame>
            </Dialog>
        </Modal>
    </ModalOverlay>
    );
};
