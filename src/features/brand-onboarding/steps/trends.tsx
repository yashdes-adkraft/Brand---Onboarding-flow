import type { FC } from "react";
import { Heart, Sun, Sunrise, TrendUp01 } from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import type { StepDefinition, StepProps } from "../flow";
import { type TrendIcon, marketActions, useMarket } from "../market/market-store";
import { ReviewRow, ReviewScreen } from "../market/review-list";

const ICONS: Record<TrendIcon, FC<{ className?: string }>> = {
    "trend-up": TrendUp01,
    sunrise: Sunrise,
    sun: Sun,
    heart: Heart,
};

/** Figma "Trends · Happy path v2" (72:5871). */
const TrendsStep = ({ next, back }: StepProps) => {
    const { trends } = useMarket();

    return (
        <ReviewScreen
            title="Pick trends to build ads around"
            description="These are topics people are talking about in your market right now. Tick the ones that fit the brand. We’ll write campaign ideas around them. Untick any you don’t want."
            listLabel="Trends"
            addLabel="Add a trend"
            addPlaceholder="e.g. Photographers switching to AI culling"
            onAdd={marketActions.addTrend}
            onBack={back}
            onContinue={next}
        >
            {trends.map((t) => (
                <ReviewRow
                    key={t.id}
                    title={t.title}
                    meta={t.meta}
                    kept={t.kept}
                    onChange={(kept) => marketActions.toggleTrend(t.id, kept)}
                    leading={<FeaturedIcon theme="modern" color="gray" size="md" icon={ICONS[t.icon]} />}
                />
            ))}
        </ReviewScreen>
    );
};

export const trendsStep: StepDefinition = {
    id: "trends",
    ariaLabel: "New brand: trends",
    phase: 2,
    phaseFill: 173 / 192,
    glow: "top",
    Component: TrendsStep,
};
