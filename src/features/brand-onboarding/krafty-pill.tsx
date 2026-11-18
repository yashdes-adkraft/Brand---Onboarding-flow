import { motion, useReducedMotion } from "motion/react";
import { cx } from "@/utils/cx";
import starLg from "@/assets/sparkle-star-lg.svg";
import starSm from "@/assets/sparkle-star-sm.svg";

/** Figma "Sparkle" (8964:42450) — two stars breathing on a 2s loop; timings from get_motion_context. */
export const KraftySparkle = ({ className }: { className?: string }) => {
    const reduce = useReducedMotion();
    const ease = [0.77, 0, 0.175, 1] as const;
    return (
        <span aria-hidden className={cx("relative block size-8 shrink-0", className)}>
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
                animate={reduce ? undefined : { opacity: [1, 0.35, 0.96, 1], scale: [1, 0.55, 0.97, 1] }}
                transition={{ duration: 2, times: [0, 0.675, 0.9994, 1], ease, repeat: Infinity }}
            />
        </span>
    );
};

/** Exact Figma fill: two radial highlights over the brand gradient. */
const pillBackground = [
    `url("data:image/svg+xml;utf8,<svg viewBox='0 0 197 56' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%' height='100%' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.925 0 0 1.6797 98.5 56)'><stop stop-color='rgba(255,255,255,0.85)' offset='0'/><stop stop-color='rgba(255,255,255,0)' offset='1'/></radialGradient></defs></svg>")`,
    `url("data:image/svg+xml;utf8,<svg viewBox='0 0 197 56' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%' height='100%' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(11.825 0 0 3.9216 98.618 22.431)'><stop stop-color='rgba(255,255,255,0)' offset='0'/><stop stop-color='rgba(255,255,255,0.12)' offset='0.6'/><stop stop-color='rgba(255,255,255,0.75)' offset='1'/></radialGradient></defs></svg>")`,
    "linear-gradient(90deg, rgb(91,140,255) 0%, rgb(182,140,172) 55%, rgb(245,116,137) 100%)",
].join(", ");

interface KraftyPillProps {
    /** e.g. "Kraftly reading..." */
    title: string;
    /** e.g. "Brand Website" */
    detail: string;
    className?: string;
    onClick?: () => void;
}

/**
 * Figma "Button" (66:2792) — background research status, bottom-right of the modal (right edge at 1162px, top 675px).
 * Live region so screen readers hear research progress.
 */
export const KraftyPill = ({ title, detail, className, onClick }: KraftyPillProps) => (
    <button
        type="button"
        onClick={onClick}
        aria-live="polite"
        className={cx(
            "absolute top-[675px] right-9 z-10 flex h-14 items-center justify-center gap-2 rounded-[28px] rounded-tr-[10px] border-2 border-white/95 px-5",
            "shadow-[0px_1px_2px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(182,140,172,0.45)] outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
            className,
        )}
        style={{ backgroundImage: pillBackground }}
    >
        <KraftySparkle />
        <span className="flex flex-col items-start whitespace-nowrap text-white">
            <span className="text-sm font-semibold">{title}</span>
            <span className="text-xs font-medium opacity-60">{detail}</span>
        </span>
        <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-3px_8px_0px_rgba(245,116,137,0.35),inset_0px_2px_4px_0px_rgba(255,255,255,0.9)]"
        />
    </button>
);
