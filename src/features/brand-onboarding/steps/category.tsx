import type { ComponentProps } from "react";
import { useState } from "react";
import { Briefcase01, GraduationHat01, Heart, Phone01, Stars02 } from "@untitledui/icons";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import bottle from "@/assets/icons/bottle.svg";
import fashionHanger from "@/assets/icons/fashion-hanger.svg";
import foodPizza from "@/assets/icons/food-pizza.svg";
import type { StepDefinition, StepProps } from "../flow";
import { KraftyPill } from "../krafty-pill";
import { type OptionItem, OptionCardRadioGroup } from "../option-card";

/** Icons the Figma file uses that this @untitledui/icons version doesn't ship — exported from Figma. */
const svgIcon = (src: string) => {
    const Icon = (props: ComponentProps<"img">) => <img src={src} alt="" {...props} />;
    return Icon;
};

const CATEGORIES: OptionItem[] = [
    { id: "physical", label: "Physical products", icon: svgIcon(bottle) },
    { id: "food", label: "Food and drink", icon: svgIcon(foodPizza) },
    { id: "fashion", label: "Fashion and beauty", icon: svgIcon(fashionHanger) },
    { id: "apps", label: "Apps and software", icon: Phone01 },
    { id: "services", label: "Services", icon: Briefcase01 },
    { id: "courses", label: "Courses and coaching", icon: GraduationHat01 },
    { id: "health", label: "Health and fitness", icon: Heart },
    { id: "other", label: "Something else", icon: Stars02 },
];

/** Figma "Business type" (66:2635). */
const CategoryStep = ({ draft, update, next }: StepProps) => {
    const [error, setError] = useState<string>();

    const submit = () => {
        if (!draft.category) return setError("Pick the closest category.");
        if (!draft.oneLiner.trim()) return setError("Add one line about what they sell.");
        next();
    };

    return (
        <>
            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
                className="absolute top-[calc(50%+15px)] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-8"
            >
                <Heading slot="title" className="text-[30px] leading-[44px] font-medium tracking-[-0.6px] whitespace-nowrap text-primary">
                    What business category?
                </Heading>

                <OptionCardRadioGroup
                    label="Business category"
                    options={CATEGORIES}
                    value={draft.category}
                    onChange={(category) => {
                        update({ category });
                        setError(undefined);
                    }}
                />

                <div className="flex w-full flex-col gap-2">
                    <div className="flex items-start gap-3">
                        <Input
                            label="What do they sell, in one line?"
                            placeholder="e.g. Cold brew in glass bottles, delivered across Bengaluru"
                            size="lg"
                            // Figma: 8px between label and field (Untitled UI default is 6px)
                            className="w-[797px] gap-2"
                            value={draft.oneLiner}
                            onChange={(oneLiner) => {
                                update({ oneLiner });
                                setError(undefined);
                            }}
                            isInvalid={!!error && !draft.oneLiner.trim()}
                        />
                        <Button type="submit" size="lg" className="self-end">
                            Continue
                        </Button>
                    </div>
                    {error && (
                        <p role="alert" className="text-sm text-error-primary">
                            {error}
                        </p>
                    )}
                </div>
            </form>

            <KraftyPill title="Kraftly reading..." detail="Brand Website" />
        </>
    );
};

export const categoryStep: StepDefinition = {
    id: "category",
    ariaLabel: "New brand: business category",
    phase: 0,
    phaseFill: 67 / 192,
    glow: "top",
    Component: CategoryStep,
};
