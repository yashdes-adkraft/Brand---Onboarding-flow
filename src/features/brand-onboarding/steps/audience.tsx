import { useState } from "react";
import { Building07, LayersThree01, Users01 } from "@untitledui/icons";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import type { StepDefinition, StepProps } from "../flow";
import { KraftyPill } from "../krafty-pill";
import { type OptionItem, OptionCardRadioGroup } from "../option-card";

const AUDIENCES: OptionItem[] = [
    { id: "consumers", label: "Consumers", icon: Users01 },
    { id: "businesses", label: "Businesses", icon: Building07 },
    { id: "both", label: "Both", icon: LayersThree01 },
];

/** Figma "Who buys" (66:3043) — body 66:3155. */
const AudienceStep = ({ draft, update, next, back }: StepProps) => {
    const [error, setError] = useState<string>();

    return (
        <>
            <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-8">
                <Heading slot="title" className="text-[30px] leading-[44px] font-medium tracking-[-0.6px] whitespace-nowrap text-primary">
                    Who are their customers?
                </Heading>

                <OptionCardRadioGroup
                    label="Customers"
                    options={AUDIENCES}
                    columns={3}
                    // Figma: these cards use 18px padding on all sides (shared card default is 16px vertical).
                    className="[&>label>div]:py-[18px]"
                    value={draft.audience}
                    onChange={(audience) => {
                        update({ audience });
                        setError(undefined);
                    }}
                />

                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-start gap-3">
                        <Button color="secondary" size="lg" onClick={back}>
                            Back
                        </Button>
                        <Button size="lg" onClick={() => (draft.audience ? next() : setError("Pick who buys from them."))}>
                            Continue
                        </Button>
                    </div>
                    {error && (
                        <p role="alert" className="text-sm text-error-primary">
                            {error}
                        </p>
                    )}
                </div>
            </div>

            <KraftyPill title="Kraftly finding..." detail="assets" />
        </>
    );
};

export const audienceStep: StepDefinition = {
    id: "audience",
    ariaLabel: "New brand: who buys",
    phase: 0,
    phaseFill: 106 / 192,
    glow: "top",
    Component: AudienceStep,
};
