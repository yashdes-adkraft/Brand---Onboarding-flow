import { Check } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export const ONBOARDING_PHASES = ["Client", "Brand & social", "Competitors & trends"] as const;

interface OnboardingProgressProps {
    /** Index of the active phase. */
    current: number;
    /** 0–1 progress through the active phase. */
    currentFill: number;
    className?: string;
}

/** Figma: "Progress" (66:2362) — three 192px phases, 6px track, brand-gradient fill. */
export const OnboardingProgress = ({ current, currentFill, className }: OnboardingProgressProps) => (
    <ol aria-label="Onboarding progress" className={cx("flex items-start gap-3", className)}>
        {ONBOARDING_PHASES.map((label, i) => {
            const fill = i < current ? 1 : i === current ? currentFill : 0;
            return (
                <li key={label} aria-current={i === current ? "step" : undefined} className="flex w-48 flex-col gap-2.5">
                    <div className="h-1.5 w-48 overflow-clip rounded-[3px] bg-primary">
                        <div
                            className="h-1.5 rounded-[3px] bg-linear-to-r from-adkraft-blue via-adkraft-mauve via-55% to-adkraft-pink transition-[width] duration-500 ease-out motion-reduce:transition-none"
                            style={{ width: `${fill * 100}%` }}
                        />
                    </div>
                    {/* Figma 72:4872: finished phases get a 14px blue check and text-secondary label. */}
                    <span
                        className={cx(
                            "flex items-center gap-1.5 text-[13px] leading-[18px] whitespace-nowrap",
                            i === current ? "font-semibold text-primary" : i < current ? "font-medium text-secondary" : "font-medium text-quaternary",
                        )}
                    >
                        {i < current && <Check aria-hidden className="size-3.5 text-utility-blue-600" />}
                        {label}
                        {i < current && <span className="sr-only"> (done)</span>}
                    </span>
                </li>
            );
        })}
    </ol>
);
