import { type KeyboardEvent, type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle, Plus } from "@untitledui/icons";
import { Heading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Select } from "@/components/base/select/select";
import { Tag, TagGroup, TagList } from "@/components/base/tags/tags";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";

/** Figma disabled primary button (light grey fill, grey label) instead of Untitled's 50% opacity. */
export const DISABLED_PRIMARY = "disabled:bg-utility-neutral-100 disabled:text-utility-neutral-400 disabled:opacity-100 disabled:shadow-xs disabled:ring-1 disabled:ring-utility-neutral-200 disabled:before:hidden";

/** Figma "Bar" in edit mode: Editing / Unsaved changes badge + Cancel / Save. */
export const EditBar = ({ isDirty, onCancel, onSave }: { isDirty: boolean; onCancel: () => void; onSave: () => void }) => (
    <div className="flex w-full items-center gap-2">
        {isDirty ? (
            <Badge type="pill-color" size="sm" color="warning">
                Unsaved changes
            </Badge>
        ) : (
            <Badge type="pill-color" size="sm" color="gray">
                Editing
            </Badge>
        )}
        <div className="h-px flex-1" />
        <div className="flex items-start gap-2">
            <Button color="secondary" size="sm" onClick={onCancel}>
                Cancel
            </Button>
            <Button size="sm" isDisabled={!isDirty} onClick={onSave} className={DISABLED_PRIMARY}>
                Save
            </Button>
        </div>
    </div>
);

/** Figma "Form/…": scrolling white card, 28px side padding. */
export const EditForm = ({ children, label }: { children: ReactNode; label: string }) => (
    <div
        role="group"
        aria-label={label}
        tabIndex={-1}
        className="flex h-[332px] w-full shrink-0 flex-col items-start overflow-x-clip overflow-y-auto rounded-[18px] border border-secondary bg-primary px-7 shadow-xs outline-hidden"
    >
        {children}
    </div>
);

/** Figma "Row/…": 168px label column + control, 20px vertical padding, divider between rows. */
export const FormRow = ({ label, field, children, labelPad = "pt-3", id }: { label: string; field: string; children: ReactNode; labelPad?: string; id?: string }) => (
    <div data-field={field} className="flex w-full shrink-0 items-start gap-6 border-b border-secondary py-5 last:border-b-0">
        <div className={cx("w-[168px] shrink-0", labelPad)}>
            <span id={id} className="text-sm leading-[1.45] font-medium whitespace-nowrap text-secondary">
                {label}
            </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
);

/** Untitled `Select` (lg = 44px) for a string option list. */
export const OptionSelect = ({
    label,
    value,
    options,
    onChange,
    className,
}: {
    label: string;
    value: string;
    options: readonly string[];
    onChange: (value: string) => void;
    className?: string;
}) => (
    <Select
        aria-label={label}
        size="lg"
        className={className}
        selectedKey={value}
        onSelectionChange={(key) => key != null && onChange(String(key))}
        items={options.map((o) => ({ id: o, label: o }))}
    >
        {(item) => <Select.Item id={item.id} label={item.label} />}
    </Select>
);

interface TagListEditorProps {
    /** Accessible name, e.g. "Who buys". */
    label: string;
    values: string[];
    onChange: (values: string[]) => void;
    suggestions: readonly string[];
    /** Placeholder for the add input, e.g. "Add an audience". */
    placeholder: string;
    isInvalid?: boolean;
    errorMessage?: string;
}

/** Tags with × + an "add" button that opens an Untitled ComboBox with suggestions (Figma "Add audience" / "Add tone"). */
export const TagListEditor = ({ label, values, onChange, suggestions, placeholder, isInvalid, errorMessage }: TagListEditorProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [text, setText] = useState("");
    const showInput = isAdding || values.length === 0;

    const add = (value: string) => {
        const v = value.trim();
        if (v && !values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v]);
        setText("");
        setIsAdding(false);
    };

    // Loose match: any typed word (2+ letters) found in the suggestion; best matches first.
    const words = text.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
    const score = (s: string) => words.filter((w) => s.toLowerCase().includes(w)).length;
    const available = suggestions
        .filter((s) => !values.includes(s) && (!words.length || score(s) > 0))
        .sort((a, b) => score(b) - score(a));

    const onKeyDownCapture = (e: KeyboardEvent<HTMLDivElement>) => {
        const input = e.target as HTMLInputElement;
        if (input.tagName !== "INPUT") return;
        // Enter with no highlighted suggestion adds what was typed.
        if (e.key === "Enter" && !input.getAttribute("aria-activedescendant") && input.value.trim()) {
            e.preventDefault();
            e.stopPropagation();
            add(input.value);
        }
        if (e.key === "Escape" && !input.value) {
            e.stopPropagation();
            setIsAdding(false);
        }
    };

    return (
        <div className="flex w-full flex-col gap-3 pt-1.5">
            {values.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <TagGroup label={label} size="md" className="contents" onRemove={(keys) => onChange(values.filter((v) => !keys.has(v)))}>
                        <TagList className="contents">
                            {values.map((v) => (
                                <Tag key={v} id={v}>
                                    {v}
                                </Tag>
                            ))}
                        </TagList>
                    </TagGroup>
                    <Button color="secondary" size="sm" iconLeading={Plus} aria-label={`Add to ${label}`} onClick={() => setIsAdding(true)} />
                </div>
            )}
            {showInput && (
                <div
                    onKeyDownCapture={onKeyDownCapture}
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node) && !text.trim()) setIsAdding(false);
                    }}
                    className={cx(isInvalid && "[&_[role=group]]:ring-error_subtle [&_[role=group]:focus-within]:ring-2 [&_[role=group]:focus-within]:ring-error")}
                >
                    <Select.ComboBox
                        aria-label={label}
                        placeholder={placeholder}
                        size="lg"
                        shortcut={false}
                        icon={<></>}
                        allowsCustomValue
                        defaultFilter={() => true}
                        autoFocus={isAdding}
                        isInvalid={isInvalid}
                        hint={isInvalid ? errorMessage : undefined}
                        inputValue={text}
                        onInputChange={setText}
                        selectedKey={null}
                        onSelectionChange={(key) => key != null && add(String(key))}
                        items={available.map((s) => ({ id: s, label: s }))}
                    >
                        {(item) => <Select.Item id={item.id} label={item.label} selectionIndicator="none" />}
                    </Select.ComboBox>
                </div>
            )}
        </div>
    );
};

/** Figma "Dialog/Discard" (8921:9068). */
export const DiscardDialog = ({ isOpen, message, onKeepEditing, onDiscard }: { isOpen: boolean; message: string; onKeepEditing: () => void; onDiscard: () => void }) => (
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && onKeepEditing()} isDismissable className="z-[70]">
        <Modal className="max-w-[400px] rounded-xl sm:rounded-xl">
            <Dialog role="alertdialog" className="flex flex-col items-start gap-5 rounded-xl border border-secondary p-6 shadow-2xl">
                <FeaturedIcon icon={AlertTriangle} color="warning" theme="light" size="lg" />
                <div className="flex flex-col gap-1 leading-[1.45]">
                    <Heading slot="title" className="text-lg font-semibold text-primary">
                        Discard changes?
                    </Heading>
                    <p className="text-sm text-tertiary">{message}</p>
                </div>
                <div className="flex w-full gap-3">
                    <Button color="secondary" size="lg" className="flex-1" onClick={onKeepEditing} autoFocus>
                        Keep editing
                    </Button>
                    <Button size="lg" className="flex-1" onClick={onDiscard}>
                        Discard
                    </Button>
                </div>
            </Dialog>
        </Modal>
    </ModalOverlay>
);

/** Figma "Notification" (8921:9408): top-right success toast, e.g. "Brand saved". */
export const SavedToast = ({ message, onClose }: { message: string | null; onClose: () => void }) => {
    useEffect(() => {
        if (!message) return;
        const t = window.setTimeout(onClose, 4000);
        return () => window.clearTimeout(t);
    }, [message, onClose]);

    return createPortal(
        <div role="status" aria-live="polite" className="pointer-events-none fixed top-6 right-6 z-[80] w-[400px]">
            {message && (
                <div className="pointer-events-auto relative flex items-start gap-4 rounded-xl border border-primary bg-primary_alt p-4 shadow-lg duration-200 animate-in fade-in slide-in-from-top-2">
                    <FeaturedIcon icon={CheckCircle} color="success" theme="outline" size="md" />
                    <p className="flex-1 pt-0.5 pr-8 text-sm font-semibold text-primary">{message}</p>
                    <CloseButton size="sm" label="Dismiss" onPress={onClose} className="absolute top-[7px] right-[7px]" />
                </div>
            )}
        </div>,
        document.body,
    );
};
