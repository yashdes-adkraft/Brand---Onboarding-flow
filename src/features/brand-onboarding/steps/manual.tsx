import { FileTrigger, Heading } from "react-aria-components";
import { XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import type { ManualBrand, StepDefinition, StepProps } from "../flow";
import { ColourEditor } from "../review/edit-colour-picker";
import { OptionSelect } from "../review/edit-fields";
import { LogoTile } from "../review/edit-forms";
import { OPTIONS } from "../review/edit-store";

/** Reads a picked image as a data URL, so the logo is kept even after a reload (an object URL would not be). */
const readImage = (file: File, done: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" && done(reader.result);
    reader.readAsDataURL(file);
};

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5">
        <Label>
            {label}
            {hint && <span className="ml-1.5 font-normal text-tertiary">{hint}</span>}
        </Label>
        {children}
    </div>
);

/**
 * "Set up manually": the way in for a client with no website to read. The user types what research would have found —
 * name, logo, colours, category, market and language — and "Create brand" adds the brand straight to the Brands page.
 * Everything is kept in the draft, so "Save and exit" resumes here with the fields filled in.
 */
const ManualStep = ({ draft, update, goTo, createBrand }: StepProps) => {
    const m = draft.manual;
    const set = <K extends keyof ManualBrand>(key: K, value: ManualBrand[K]) => update({ manual: { ...m, [key]: value } });

    return (
        <div className="absolute top-[88px] bottom-7 left-1/2 flex w-[560px] max-w-[calc(100%-32px)] -translate-x-1/2 flex-col gap-6">
            <div className="flex shrink-0 flex-col items-center gap-2 text-center">
                <Heading slot="title" className="text-[30px] leading-[38px] font-medium tracking-[-0.6px] text-primary">
                    Set up the brand yourself
                </Heading>
                <p className="text-sm text-tertiary">Enter what you know. Only the name is needed, and you can change anything later.</p>
            </div>

            {/* The fields scroll; the buttons below stay in view */}
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1 pb-1">
                <Field label="Logo">
                    <div className="flex items-center gap-3">
                        <LogoTile logo={m.logo} name={m.name || "Brand"} />
                        <FileTrigger acceptedFileTypes={["image/*"]} onSelect={(files) => files?.[0] && readImage(files[0], (url) => set("logo", url))}>
                            <Button color="secondary" size="md">
                                {m.logo ? "Replace" : "Upload logo"}
                            </Button>
                        </FileTrigger>
                        {m.logo && (
                            <Button color="tertiary" size="md" iconLeading={XClose} onClick={() => set("logo", null)}>
                                Remove
                            </Button>
                        )}
                    </div>
                </Field>

                <Input label="Brand name" isRequired size="lg" placeholder="e.g. Aftershoot" value={m.name} onChange={(v) => set("name", v)} autoFocus />
                <Input label="Website" size="lg" placeholder="aftershoot.com" hint="Optional" value={m.website} onChange={(v) => set("website", v)} />

                <Field label="Colours" hint="Add up to 4">
                    <ColourEditor values={m.colours} onChange={(v) => set("colours", v.slice(0, 4))} />
                </Field>

                <Field label="Category">
                    <OptionSelect label="Category" placeholder="Select a category" value={m.category} options={OPTIONS.category} onChange={(v) => set("category", v)} allowOther />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Market">
                        <OptionSelect label="Market" placeholder="Select" value={m.market} options={OPTIONS.market} onChange={(v) => set("market", v)} />
                    </Field>
                    <Field label="Language">
                        <OptionSelect label="Language" placeholder="Select" value={m.language} options={OPTIONS.language} onChange={(v) => set("language", v)} />
                    </Field>
                </div>
            </div>

            <div className="flex shrink-0 items-start justify-center gap-3">
                <Button color="secondary" size="lg" onClick={() => goTo("website")}>
                    Back
                </Button>
                <Button size="lg" isDisabled={!m.name.trim()} onClick={createBrand}>
                    Create brand
                </Button>
            </div>
        </div>
    );
};

export const manualStep: StepDefinition = {
    id: "manual",
    ariaLabel: "New brand: set up manually",
    phase: 0,
    phaseFill: 0.5,
    glow: "top",
    Component: ManualStep,
};
