import { DistortionWave } from "distortion-waves";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import type { StepProps } from "./flow";
import { ModalFrame } from "./onboarding-modal";
import { STEPS } from "./steps";

/**
 * Colour-only wave over the real pages (the library's own picture of the page came out as a black-outlined wireframe
 * while it bent). A wider, softer rim and fewer particles than the defaults, so it reads as a glow, not a line.
 */
const COLOUR_WAVE = { rimWidth: 56, rimStrength: 0.9, hairlineOpacity: 0.7, particleCount: 60, particleSize: 2.2, gatherGlow: 0.6 };

/** The page swap. The colour wave's front takes about 2.3s to cross, so this is timed to travel with it. */
const SWAP = { duration: 2, ease: [0.45, 0, 0.2, 1] } as const;

interface TrendsReadyWaveProps {
    /** True once the flow is on the final "ready" screen: the wave runs from the Continue button on trends. */
    revealed: boolean;
    stepProps: StepProps;
    onClose: () => void;
    onSaveAndExit: () => void;
}

/**
 * The trends screen and the final "ready" screen in one container. Pressing Continue on trends flips `revealed`:
 * the colour wave rises from the button, the ready screen is revealed behind it by a soft feathered wipe (and
 * sharpens from a blur as it arrives) while the trends screen blurs and fades out. Back from ready runs it in
 * reverse. Both screens use the standard 1198×751 modal.
 */
export const TrendsReadyWave = ({ revealed, stepProps, onClose, onSaveAndExit }: TrendsReadyWaveProps) => {
    const { Component: Trends, ...trends } = STEPS.trends;
    const { Component: Ready } = STEPS.ready;
    const reduce = useReducedMotion();
    const trendsRef = useRef<HTMLDivElement>(null);
    const readyRef = useRef<HTMLDivElement>(null);

    // 0 = trends showing, 1 = ready showing. Everything below is derived from this one value, so it all moves together.
    const p = useMotionValue(revealed ? 1 : 0);
    useEffect(() => {
        const controls = animate(p, revealed ? 1 : 0, reduce ? { duration: 0 } : SWAP);
        return () => controls.stop();
    }, [revealed, reduce, p]);

    // Trends: blurs and fades out over the first half.
    const trendsOpacity = useTransform(p, [0, 0.55], [1, 0]);
    const trendsFilter = useTransform(p, [0, 0.55], ["blur(0px)", "blur(8px)"]);
    const trendsScale = useTransform(p, [0, 0.55], [1, 0.985]);
    // The white card behind both stays until the end, so there is never a dark gap between the two screens.
    const backingOpacity = useTransform(p, [0.65, 1], [1, 0]);
    // Ready: a wide feathered edge climbs from the bottom (where Continue was) while it sharpens and settles.
    const readyFilter = useTransform(p, [0, 1], ["blur(16px)", "blur(0px)"]);
    const readyY = useTransform(p, [0, 1], [28, 0]);
    const readyScale = useTransform(p, [0, 1], [0.985, 1]);
    const edge = useTransform(p, [0, 1], [-45, 100]);
    const edgeTop = useTransform(edge, (v) => v + 45);
    const readyMask = useMotionTemplate`linear-gradient(to top, #000 ${edge}%, transparent ${edgeTop}%)`;

    return (
        <DistortionWave
            revealed={revealed}
            capture={false}
            waveStyle={COLOUR_WAVE}
            style={{ width: 1198, height: 751, borderRadius: 16, overflow: "hidden" }}
            // The pressed button goes inert when its screen is hidden, so hand focus to the screen that is now showing.
            onFinish={(isReady) => (isReady ? readyRef : trendsRef).current?.querySelector<HTMLElement>("button")?.focus()}
        >
            <div className="relative h-[751px] w-[1198px]">
                <motion.div aria-hidden className="absolute inset-0 bg-primary" style={{ opacity: backingOpacity }} />

                <motion.div
                    ref={trendsRef}
                    inert={revealed}
                    aria-hidden={revealed}
                    className="absolute inset-0 overflow-clip"
                    style={{ opacity: trendsOpacity, filter: trendsFilter, scale: trendsScale }}
                >
                    <ModalFrame phase={trends.phase} phaseFill={trends.phaseFill} glow={trends.glow} topFade={trends.topFade} onBack={onClose} onSaveAndExit={onSaveAndExit}>
                        <Trends {...stepProps} />
                    </ModalFrame>
                </motion.div>

                <motion.div
                    ref={readyRef}
                    inert={!revealed}
                    aria-hidden={!revealed}
                    className="absolute inset-0"
                    style={{ y: readyY, scale: readyScale, filter: readyFilter, maskImage: readyMask, WebkitMaskImage: readyMask }}
                >
                    <div className="relative size-full overflow-clip rounded-2xl">
                        <Ready {...stepProps} />
                    </div>
                </motion.div>
            </div>
        </DistortionWave>
    );
};
