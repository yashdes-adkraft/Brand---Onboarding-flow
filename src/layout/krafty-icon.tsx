import railStarLg from "@/assets/rail-star-lg.svg";
import railStarSm from "@/assets/rail-star-sm.svg";

/** Figma rail/Krafty "Sparkle": the two gradient stars turn and breathe in a 2s loop (here: while the item is hovered or focused). */
/** `className` sizes the box (24px by default). Inside a `group`, the stars turn and breathe on hover. */
export const KraftyIcon = ({ className = "size-6", white = false }: { className?: string; /** Solid white stars, for use on a coloured button. */ white?: boolean }) => (
    <span aria-hidden className={`relative block ${className}`}>
        <img src={railStarLg} alt="" className={`krafty-star-lg ${white ? "brightness-0 invert" : ""} absolute inset-[20.97%_20.94%_7.12%_7.14%] block size-auto max-w-none`} />
        <img src={railStarSm} alt="" className={`krafty-star-sm ${white ? "brightness-0 invert" : ""} absolute inset-[7.14%_7.15%_56.82%_56.98%] block size-auto max-w-none`} />
    </span>
);

