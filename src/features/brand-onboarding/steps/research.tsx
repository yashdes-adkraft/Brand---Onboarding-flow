import { useEffect, useRef, useState } from "react";
import { AnimatePresence, type Transition, motion, useReducedMotion } from "motion/react";
import { cx } from "@/utils/cx";
import starLg from "@/assets/research/sparkle-star-lg.svg";
import starSm from "@/assets/research/sparkle-star-sm.svg";
import type { StepDefinition, StepProps } from "../flow";
import { RESEARCH_CARD_COUNT, RESEARCH_ITEMS, type ResearchItem } from "../research/research-items";

/** Time each card stays in focus before the carousel advances. */
const DWELL_MS = 2500;

const SHADOW_LG = "0px 12px 16px -4px rgba(10,13,18,0.08), 0px 4px 6px -2px rgba(10,13,18,0.03), 0px 2px 2px -1px rgba(10,13,18,0.04)";
const SHADOW_XS = "0px 1px 2px 0px rgba(10,13,18,0.05), 0px 0px 0px 0px rgba(10,13,18,0), 0px 0px 0px 0px rgba(10,13,18,0)";

/**
 * Slot geometry inside the 1198×751 modal, by distance from the focused card.
 * From Figma AB-05 v9 (focused card 480×308 centred at y=376, pills 400×56 at y=182 / 570) and the
 * carousel's hidden ±2 slots (86:4791: 360px wide, 3px blur, transparent).
 */
const slot = (d: number) => {
    if (d === 0) return { top: 376, width: 480, height: 308, borderRadius: 24, opacity: 1, filter: "blur(0px)", boxShadow: SHADOW_LG };
    if (Math.abs(d) === 1) return { top: d < 0 ? 182 : 570, width: 400, height: 56, borderRadius: 28, opacity: 1, filter: "blur(0px)", boxShadow: SHADOW_XS };
    return { top: d < 0 ? 149 : 619, width: 360, height: 56, borderRadius: 28, opacity: 0, filter: "blur(3px)", boxShadow: SHADOW_XS };
};

const MOVE: Transition = { type: "spring", stiffness: 260, damping: 32, mass: 1 };

interface CarouselItemProps {
    item: ResearchItem;
    d: number;
    reduce: boolean;
    onSelect?: () => void;
    onHoverChange?: (hovering: boolean) => void;
}

/** One research item: a 56px pill when peeking, the 480×308 card when focused (Figma "… · Expanded"). */
const CarouselItem = ({ item, d, reduce, onSelect, onHoverChange }: CarouselItemProps) => {
    const open = d === 0;
    const transition = reduce ? { duration: 0 } : MOVE;
    const Icon = item.icon;
    const { top, ...box } = slot(d);

    return (
        <motion.div
            aria-hidden={Math.abs(d) > 1 || undefined}
            className={cx("absolute left-1/2 overflow-hidden border border-secondary bg-primary", open ? "z-30" : Math.abs(d) === 1 ? "z-20" : "pointer-events-none z-10")}
            style={{ x: "-50%", y: "-50%" }}
            initial={false}
            animate={{ top, ...box }}
            transition={transition}
            // Hovering the focused card pauses auto-advance.
            onHoverStart={() => open && onHoverChange?.(true)}
            onHoverEnd={() => onHoverChange?.(false)}
        >
            {/* Header — pill: 8px inset, 32px icon · card: 20px inset, 40px icon */}
            <motion.div
                className="absolute flex items-center justify-between"
                initial={false}
                animate={{ left: open ? 20 : 8, right: open ? 20 : 16, top: open ? 20 : 11 }}
                transition={transition}
            >
                <div className="flex items-center gap-3">
                    <motion.span
                        className="flex shrink-0 items-center justify-center rounded-full bg-tertiary text-quaternary"
                        initial={false}
                        animate={{ width: open ? 40 : 32, height: open ? 40 : 32 }}
                        transition={transition}
                    >
                        <Icon className={cx("transition-[width,height] duration-300", open ? "size-5" : "size-4")} />
                    </motion.span>
                    <span className="text-md font-medium whitespace-nowrap text-primary">{item.title}</span>
                </div>
                {item.handle && (
                    <motion.span
                        className="overflow-clip rounded-full border border-secondary bg-white px-2 py-0.5 text-xs font-medium whitespace-nowrap text-primary shadow-[0px_4px_10px_-2px_rgba(10,13,18,0.04),0px_1px_2px_0px_rgba(10,13,18,0.06)]"
                        initial={false}
                        animate={{ opacity: open ? 1 : 0 }}
                        transition={reduce ? { duration: 0 } : { duration: 0.25, delay: open ? 0.15 : 0 }}
                    >
                        {item.handle}
                    </motion.span>
                )}
            </motion.div>

            {/* Artwork — 438×206 below the header (Figma "<name> graphic"), fills in when the card opens */}
            <AnimatePresence>
                {open && item.Graphic && (
                    <motion.div
                        key="graphic"
                        aria-hidden
                        className="absolute top-20 left-5 h-[206px] w-[438px]"
                        exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
                    >
                        <item.Graphic />
                    </motion.div>
                )}
            </AnimatePresence>

            {onSelect && (
                <button
                    type="button"
                    onClick={onSelect}
                    aria-label={`Show ${item.title}`}
                    className="absolute inset-0 rounded-[inherit] outline-focus-ring focus-visible:outline-2 focus-visible:-outline-offset-2"
                />
            )}
        </motion.div>
    );
};

/**
 * Figma "Sparkle" (98:5652) in its brand-gradient colourway — same 2s breathing loop as KraftySparkle
 * (timings from get_motion_context), which only ships the white stars used on the pill.
 */
const CaptionSparkle = ({ reduce }: { reduce: boolean }) => {
    const ease = [0.77, 0, 0.175, 1] as const;
    return (
        <span aria-hidden className="relative block size-8 shrink-0">
            <motion.img
                src={starLg}
                alt=""
                className="absolute inset-[20.97%_20.93%_7.12%_7.15%] block size-auto max-w-none"
                animate={reduce ? undefined : { scale: [1, 0.86, 1, 1] }}
                transition={{ duration: 2, times: [0, 0.45, 0.9, 1], ease, repeat: Infinity }}
            />
            <motion.img
                src={starSm}
                alt=""
                className="absolute inset-[7.15%_7.14%_56.82%_56.98%] block size-auto max-w-none"
                animate={reduce ? undefined : { opacity: [1, 0.35, 1, 1], scale: [1, 0.55, 1, 1] }}
                transition={{ duration: 2, times: [0, 0.675, 0.9994, 1], ease, repeat: Infinity }}
            />
        </span>
    );
};

/** "Kraftly creating…" — shimmering label with looping dots (Figma "Caption · …", 97:3438 shimmer band). */
const Caption = ({ item, reduce }: { item: ResearchItem; reduce: boolean }) => (
    <div className="absolute top-[631px] left-1/2 flex -translate-x-1/2 items-center gap-3">
        <CaptionSparkle reduce={reduce} />
        <div aria-live="polite" className="relative h-[38px]">
            <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                    key={item.id}
                    className="flex flex-col items-start whitespace-nowrap text-primary"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(1.5px)", y: 6 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(1.5px)", y: -6 }}
                    transition={{ duration: reduce ? 0 : 0.3, ease: "easeOut" }}
                >
                    <span className="flex text-sm font-semibold">
                        <motion.span
                            className="bg-clip-text text-transparent"
                            style={{
                                backgroundImage: "linear-gradient(90deg, #181d27 0%, #181d27 40%, #c4c6cc 50%, #181d27 60%, #181d27 100%)",
                                backgroundSize: "250% 100%",
                            }}
                            initial={{ backgroundPosition: "100% 0%" }}
                            animate={reduce ? undefined : { backgroundPosition: ["100% 0%", "0% 0%"] }}
                            transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
                        >
                            Kraftly {item.verb}
                        </motion.span>
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                aria-hidden
                                initial={{ opacity: reduce ? 1 : 0.2 }}
                                animate={reduce ? undefined : { opacity: [0.2, 1, 0.2] }}
                                transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                            >
                                .
                            </motion.span>
                        ))}
                    </span>
                    <span className="text-xs font-medium opacity-60">{item.detail}</span>
                </motion.div>
            </AnimatePresence>
        </div>
    </div>
);

/** Figma "AB-05 · Research · Carousel" (86:4461) with card states 98:5496 → 98:4803 → 98:5732 → 98:5032 → 98:5258 → 98:5954. */
const ResearchStep = ({ next }: StepProps) => {
    const reduce = useReducedMotion() ?? false;
    /** 0-based index into the researched cards (RESEARCH_ITEMS[active + 1] is in focus). */
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const nextRef = useRef(next);
    nextRef.current = next;

    // Auto-advance; after the last card, move on to the review step.
    useEffect(() => {
        if (paused) return;
        const t = window.setTimeout(() => {
            if (active < RESEARCH_CARD_COUNT - 1) setActive(active + 1);
            else nextRef.current();
        }, DWELL_MS);
        return () => window.clearTimeout(t);
    }, [active, paused]);

    const go = (index: number) => {
        setActive(Math.max(0, Math.min(RESEARCH_CARD_COUNT - 1, index)));
        setPaused(false);
    };
    const focusedIndex = active + 1;

    return (
        <>

            <section
                aria-roledescription="carousel"
                aria-label="Brand research"
                className="absolute inset-0"
                onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                        e.preventDefault();
                        go(active + 1);
                    } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        go(active - 1);
                    }
                }}
            >
                {RESEARCH_ITEMS.map((item, i) => {
                    const d = i - focusedIndex;
                    // Peeking neighbours step the carousel — except the bookends (Website / Trends), which aren't research cards.
                    const selectable = Math.abs(d) === 1 && !!item.Graphic;
                    return (
                        <CarouselItem
                            key={item.id}
                            item={item}
                            d={d}
                            reduce={reduce}
                            onSelect={selectable ? () => go(i - 1) : undefined}
                            onHoverChange={setPaused}
                        />
                    );
                })}

                <Caption item={RESEARCH_ITEMS[focusedIndex]} reduce={reduce} />
            </section>
        </>
    );
};

export const researchStep: StepDefinition = {
    id: "research",
    ariaLabel: "New brand: research",
    // Figma AB-05 v8/v9: Client fill 182/192, Brand & social still empty.
    phase: 0,
    phaseFill: 182 / 192,
    glow: "center",
    saveLabel: "Run in background",
    Component: ResearchStep,
};
