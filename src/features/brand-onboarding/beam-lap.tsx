import { type CSSProperties, type HTMLAttributes, useId } from "react";
import { cx } from "@/utils/cx";

/** How strong the gradient is at its peak (40%). Set through the animation, since it overrides a plain opacity. */
const BEAM_OPACITY = 0.4;

interface BeamLapProps extends HTMLAttributes<HTMLDivElement> {
    /** While true, a soft beam travels once around the inside of the outline. Turning it off removes it at once. */
    active: boolean;
    /** Seconds for the full lap. */
    lapSeconds?: number;
    /** Corner radius of the wrapped element, in px. */
    radius?: number;
}

/**
 * A soft beam in the AdKraft brand gradient that travels once, at an even speed, around the inside of the wrapped
 * element's rounded outline. It is clipped to the element, so nothing spills outside, and it sits above the element's
 * own content so it shows on every edge. It is decorative, so it ignores the pointer and is hidden from screen
 * readers; users who ask for reduced motion don't see it.
 */
export const BeamLap = ({ active, lapSeconds = 5, radius = 8, className, children, ...rest }: BeamLapProps) => {
    const id = useId();
    const lap = { strokeDasharray: "26 74", animation: `beam-lap ${lapSeconds}s linear 1 forwards`, "--beam-opacity": BEAM_OPACITY } as CSSProperties;
    const box = { width: "calc(100% - 3px)", height: "calc(100% - 3px)" };

    return (
        <div {...rest} className={cx("relative", className)}>
            {children}
            {active && (
                <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden motion-reduce:hidden" style={{ borderRadius: radius }}>
                    <svg className="size-full" fill="none">
                        <defs>
                            {/* AdKraft brand gradient, left to right */}
                            <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0" stopColor="#5b8cff" />
                                <stop offset="0.55" stopColor="#b68cac" />
                                <stop offset="1" stopColor="#f57489" />
                            </linearGradient>
                        </defs>
                        {/* A wide, heavily blurred band that spreads the gradient inward, then a softer core. Both at BEAM_OPACITY. */}
                        <rect pathLength={100} x="1.5" y="1.5" rx={radius - 1.5} stroke={`url(#${id})`} strokeWidth="20" style={{ ...box, filter: "blur(10px)", ...lap }} />
                        <rect pathLength={100} x="1.5" y="1.5" rx={radius - 1.5} stroke={`url(#${id})`} strokeWidth="5" strokeLinecap="round" style={{ ...box, filter: "blur(3px)", ...lap }} />
                    </svg>
                </div>
            )}
        </div>
    );
};
