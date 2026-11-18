import { useState } from "react";
import { Announcement01, Calendar, Download01, MarkerPin01, Rocket01, ShoppingCart01, TrendUp01, UserPlus01 } from "@untitledui/icons";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import type { StepDefinition, StepProps } from "../flow";
import { KraftyPill } from "../krafty-pill";
import { type OptionItem, OptionCardCheckboxGroup } from "../option-card";

const MAX_GOALS = 3;

const GOALS: OptionItem[] = [
    { id: "sales", label: "More sales", icon: ShoppingCart01 },
    { id: "leads", label: "More leads", icon: UserPlus01 },
    { id: "installs", label: "App installs", icon: Download01 },
    { id: "visits", label: "Store visits", icon: MarkerPin01 },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "awareness", label: "Brand awareness", icon: Announcement01 },
    { id: "launch", label: "Launch something", icon: Rocket01 },
    { id: "followers", label: "Grow followers", icon: TrendUp01 },
];

/** Figma " Goals" (66:3407) — body 66:3519. Up to three goals, numbered in pick order. */
const GoalsStep = ({ draft, update, next, back }: StepProps) => {
    const [error, setError] = useState<string>();

    return (
        <>
            <div className="absolute top-[calc(50%+1.5px)] left-[calc(50%-1px)] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-8">
                <Heading slot="title" className="text-[30px] leading-[44px] font-medium tracking-[-0.6px] whitespace-nowrap text-primary">
                    What should their ads do?
                </Heading>

                <OptionCardCheckboxGroup
                    label={`Ad goals, pick up to ${MAX_GOALS}`}
                    options={GOALS}
                    // Figma: unselected keys on this screen have no visible box.
                    className="[&>label:not([data-selected])_span[aria-hidden]]:border-transparent [&>label:not([data-selected])_span[aria-hidden]]:bg-transparent"
                    value={draft.goals}
                    onChange={(goals) => {
                        if (goals.length > MAX_GOALS) return setError(`Pick up to ${MAX_GOALS}. Unselect one to swap.`);
                        update({ goals });
                        setError(undefined);
                    }}
                />

                <p aria-live="polite" className="text-sm font-medium text-quaternary">
                    {error ? <span className="text-error-primary">{error}</span> : `${draft.goals.length} of ${MAX_GOALS} picked`}
                </p>

                <div className="flex items-start gap-3">
                    <Button color="secondary" size="lg" onClick={back}>
                        Back
                    </Button>
                    <Button size="lg" onClick={() => (draft.goals.length ? next() : setError("Pick at least one goal."))}>
                        Continue
                    </Button>
                </div>
            </div>

            <KraftyPill title="Kraftly searching..." detail="audience" />
        </>
    );
};

export const goalsStep: StepDefinition = {
    id: "goals",
    ariaLabel: "New brand: goals",
    phase: 0,
    phaseFill: 144 / 192,
    glow: "top",
    Component: GoalsStep,
};
