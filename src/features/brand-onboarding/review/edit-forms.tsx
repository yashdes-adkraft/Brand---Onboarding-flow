import { useEffect, useRef, useState } from "react";
import { ImagePlus } from "@untitledui/icons";
import { FileTrigger } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import brandLogo from "@/assets/review/brand-logo.png";
import { ColourEditor } from "./edit-colour-picker";
import { EditBar, EditForm, FormRow, OptionSelect, TagListEditor } from "./edit-fields";
import {
    type AudienceValues,
    BRAND_LINE_MAX,
    type BrandValues,
    DEFAULT_LOGO,
    OPTIONS,
    type VoiceValues,
    isValidWebsite,
    sameValues,
} from "./edit-store";

/** 56px logo tile; `null` renders the dashed "missing" placeholder (Figma "Missing data"). */
export const LogoTile = ({ logo, name }: { logo: string | null; name: string }) =>
    logo ? (
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
            {logo === DEFAULT_LOGO ? (
                <img src={brandLogo} alt={`${name} logo`} className="absolute top-[-0.71%] left-[-31.48%] h-[110.38%] w-[168.33%] max-w-none" />
            ) : (
                <img src={logo} alt={`${name} logo`} className="size-full object-cover" />
            )}
        </div>
    ) : (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-primary bg-secondary">
            <ImagePlus aria-hidden className="size-6 text-fg-secondary" />
        </div>
    );

/** "Upload logo" / "Replace" button that opens the file picker. */
export const LogoPicker = ({ children, onPick }: { children: string; onPick: (url: string) => void }) => (
    <FileTrigger acceptedFileTypes={["image/*"]} onSelect={(files) => files?.[0] && onPick(URL.createObjectURL(files[0]))}>
        <Button color="secondary" size="sm">
            {children}
        </Button>
    </FileTrigger>
);

interface FormProps<T> {
    initial: T;
    /** Field to focus when editing started from a row's pencil. */
    focusField?: string;
    onDirtyChange: (dirty: boolean) => void;
    onCancel: () => void;
    onSave: (values: T) => void;
}

function useEditForm<T>({ initial, focusField, onDirtyChange }: FormProps<T>) {
    const [values, setValues] = useState(initial);
    const [showErrors, setShowErrors] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const isDirty = !sameValues(values, initial);

    useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange]);

    useEffect(() => {
        const root = ref.current;
        if (!root) return;
        const row = focusField ? root.querySelector<HTMLElement>(`[data-field="${focusField}"]`) : null;
        const target = row
            ? row.querySelector<HTMLElement>('input, textarea, button[aria-haspopup="listbox"], button[aria-label^="Add"], button')
            : root.querySelector<HTMLElement>('[role="group"][tabindex="-1"]');
        row?.scrollIntoView({ block: "center" });
        target?.focus({ preventScroll: !!row });
        // Run once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const set = <K extends keyof T>(key: K, value: T[K]) => setValues((v) => ({ ...v, [key]: value }));
    return { values, set, isDirty, showErrors, setShowErrors, ref };
}

/** Brand edit states (Figma 8919:7692 Editing … 8920:9239 Errors). */
export const BrandEditForm = (props: FormProps<BrandValues>) => {
    const { values, set, isDirty, showErrors, setShowErrors, ref } = useEditForm(props);
    const nameError = !values.name.trim() ? "Add a brand name" : undefined;
    const siteError = !isValidWebsite(values.domain) ? "Enter a valid website" : undefined;

    const save = () => {
        if (nameError || siteError) return setShowErrors(true);
        props.onSave({ ...values, name: values.name.trim(), domain: values.domain.trim() });
    };

    return (
        <div ref={ref} className="contents">
            <EditBar isDirty={isDirty} onCancel={props.onCancel} onSave={save} />
            <EditForm label="Edit brand">
                <FormRow label="Logo" field="logo" labelPad="pt-[18px]">
                    <div className="flex items-center gap-3">
                        <LogoTile logo={values.logo} name={values.name} />
                        <LogoPicker onPick={(url) => set("logo", url)}>{values.logo ? "Replace" : "Upload logo"}</LogoPicker>
                        {values.logo && (
                            <Button color="tertiary" size="sm" onClick={() => set("logo", null)}>
                                Remove
                            </Button>
                        )}
                    </div>
                </FormRow>
                <FormRow label="Brand name" field="name">
                    <Input
                        aria-label="Brand name"
                        size="lg"
                        placeholder="Brewbloom Coffee"
                        value={values.name}
                        onChange={(v) => set("name", v)}
                        isInvalid={showErrors && !!nameError}
                        hint={showErrors ? nameError : undefined}
                    />
                </FormRow>
                <FormRow label="Website" field="domain">
                    <Input
                        aria-label="Website"
                        size="lg"
                        value={values.domain}
                        onChange={(v) => set("domain", v)}
                        isInvalid={showErrors && !!siteError}
                        hint={showErrors ? siteError : undefined}
                    />
                </FormRow>
                <FormRow label="Colours" field="colours">
                    <ColourEditor values={values.colours} onChange={(v) => set("colours", v)} />
                </FormRow>
                <FormRow label="Category" field="category">
                    <OptionSelect label="Category" value={values.category} options={OPTIONS.category} onChange={(v) => set("category", v)} />
                </FormRow>
                <FormRow label="Market" field="market">
                    <OptionSelect label="Market" value={values.market} options={OPTIONS.market} onChange={(v) => set("market", v)} />
                </FormRow>
                <FormRow label="Language" field="language">
                    <OptionSelect label="Language" value={values.language} options={OPTIONS.language} onChange={(v) => set("language", v)} />
                </FormRow>
            </EditForm>
        </div>
    );
};

/** Audience edit states (Figma 8925:8057 Editing … 8925:9413 Errors). */
export const AudienceEditForm = (props: FormProps<AudienceValues>) => {
    const { values, set, isDirty, showErrors, setShowErrors, ref } = useEditForm(props);
    const whoError = values.whoBuys.length === 0 ? "Add at least one audience" : undefined;

    const save = () => {
        if (whoError) return setShowErrors(true);
        props.onSave(values);
    };

    return (
        <div ref={ref} className="contents">
            <EditBar isDirty={isDirty} onCancel={props.onCancel} onSave={save} />
            <EditForm label="Edit audience">
                <FormRow label="Who buys" field="Who buys">
                    <TagListEditor
                        label="Who buys"
                        values={values.whoBuys}
                        onChange={(v) => set("whoBuys", v)}
                        suggestions={OPTIONS.whoBuys}
                        placeholder="Add an audience"
                        isInvalid={showErrors && !!whoError}
                        errorMessage={whoError}
                    />
                </FormRow>
                <FormRow label="Age" field="Age">
                    <div className="flex items-center gap-3">
                        <OptionSelect label="Youngest age" className="flex-1" value={values.ageFrom} options={OPTIONS.ageFrom} onChange={(v) => set("ageFrom", v)} />
                        <span className="text-sm text-tertiary">to</span>
                        <OptionSelect label="Oldest age" className="flex-1" value={values.ageTo} options={OPTIONS.ageTo} onChange={(v) => set("ageTo", v)} />
                    </div>
                </FormRow>
                <FormRow label="Gender" field="Gender">
                    <OptionSelect label="Gender" value={values.gender} options={OPTIONS.gender} onChange={(v) => set("gender", v)} />
                </FormRow>
                <FormRow label="Locations" field="Locations">
                    <TagListEditor label="Locations" values={values.locations} onChange={(v) => set("locations", v)} suggestions={OPTIONS.locations} placeholder="Add a location" />
                </FormRow>
                <FormRow label="Interests" field="Interests">
                    <TagListEditor label="Interests" values={values.interests} onChange={(v) => set("interests", v)} suggestions={OPTIONS.interests} placeholder="Add an interest" />
                </FormRow>
            </EditForm>
        </div>
    );
};

/** Voice edit states (Figma 8927:9248 Editing … 8927:10951 Errors). */
export const VoiceEditForm = (props: FormProps<VoiceValues>) => {
    const { values, set, isDirty, ref } = useEditForm(props);
    const [lineFocused, setLineFocused] = useState(false);
    const lineError = values.line.length > BRAND_LINE_MAX ? "Keep it under 120 characters" : undefined;

    const save = () => {
        if (lineError) return;
        props.onSave({ ...values, line: values.line.trim() });
    };

    return (
        <div ref={ref} className="contents">
            <EditBar isDirty={isDirty} onCancel={props.onCancel} onSave={save} />
            <EditForm label="Edit voice">
                <FormRow label="Tone" field="Tone">
                    <TagListEditor label="Tone" values={values.tone} onChange={(v) => set("tone", v)} suggestions={OPTIONS.tone} placeholder="Add a tone" />
                </FormRow>
                <FormRow label="Brand line" field="Brand line">
                    <TextArea
                        aria-label="Brand line"
                        rows={6}
                        value={values.line}
                        onChange={(v) => set("line", v)}
                        onFocus={() => setLineFocused(true)}
                        onBlur={() => setLineFocused(false)}
                        isInvalid={!!lineError}
                        textAreaClassName="h-[178px]"
                        hint={lineError ?? (lineFocused || values.line !== props.initial.line ? `${values.line.length} / ${BRAND_LINE_MAX}` : undefined)}
                    />
                </FormRow>
                <FormRow label="Words we use" field="Words we use">
                    <TagListEditor label="Words we use" values={values.use} onChange={(v) => set("use", v)} suggestions={OPTIONS.words} placeholder="Add a word" />
                </FormRow>
                <FormRow label="Words we avoid" field="Words we avoid">
                    <TagListEditor label="Words we avoid" values={values.avoid} onChange={(v) => set("avoid", v)} suggestions={OPTIONS.avoidWords} placeholder="Add a word" />
                </FormRow>
            </EditForm>
        </div>
    );
};
