import type { ReactNode, Ref } from "react";
import { useState } from "react";
import { Edit02, Plus } from "@untitledui/icons";
import { Checkbox as AriaCheckbox, Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { CheckboxBase } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";

export interface ReviewRowProps {
    title: string;
    meta: string;
    kept: boolean;
    onChange: (kept: boolean) => void;
    /** Rendered at 40×40 before the text; faded to 50% when the row is not kept. */
    leading: ReactNode;
    /** Rendered between the text and the checkbox; faded to 50% when the row is not kept. */
    trailing?: ReactNode;
    /**
     * Figma "Competitors · 02 · Hover": when set, hovering (or focusing into) the row reveals an edit button between the
     * trailing content and the checkbox. The button sits outside the checkbox label so clicking it doesn't toggle.
     */
    onEdit?: () => void;
    /** Accessible name of the edit button, e.g. "Edit Rage Coffee". */
    editLabel?: string;
}

const rowClass = "relative flex h-18 w-full shrink-0 items-center border-b border-secondary last:border-b-0";

/** Figma "Competitor/*" / "Trend/*" row — the whole 72px row toggles keep/remove. */
export const ReviewRow = ({ onEdit, editLabel, ...props }: ReviewRowProps) =>
    onEdit ? (
        <div className={cx(rowClass, "group/row")}>
            <RowCheckbox {...props} className="border-0" editSlot />
            {/* Figma 8940:12189: 36px tertiary utility button, 50px from the row's right edge (x 552 in a 638 row). */}
            <ButtonUtility
                color="tertiary"
                icon={Edit02}
                aria-label={editLabel ?? "Edit"}
                onPress={onEdit}
                className="absolute top-1/2 right-[50px] -translate-y-1/2 p-2 opacity-0 group-focus-within/row:opacity-100 group-hover/row:opacity-100"
            />
        </div>
    ) : (
        <RowCheckbox {...props} />
    );

const RowCheckbox = ({
    title,
    meta,
    kept,
    onChange,
    leading,
    trailing,
    className,
    editSlot,
}: Omit<ReviewRowProps, "onEdit" | "editLabel"> & { className?: string; editSlot?: boolean }) => (
    <AriaCheckbox
        isSelected={kept}
        onChange={onChange}
        className={({ isFocusVisible }) =>
            cx(
                rowClass,
                "cursor-pointer gap-3.5 px-5 outline-hidden hover:bg-primary_hover",
                editSlot && "group-hover/row:bg-primary_hover",
                isFocusVisible && "z-1 outline-2 -outline-offset-2 outline-focus-ring",
                className,
            )
        }
    >
        {({ isSelected }) => (
            <>
                <span className={cx("flex shrink-0", !isSelected && "opacity-50")}>{leading}</span>
                <span className={cx("flex min-w-px flex-1 flex-col gap-0.5 text-sm", isSelected ? "text-primary" : "text-tertiary")}>
                    <span className="truncate font-medium">{title}</span>
                    <span className="truncate text-tertiary">{meta}</span>
                </span>
                {trailing && <span className={cx("flex shrink-0 items-center", !isSelected && "opacity-50")}>{trailing}</span>}
                {/* Reserves room for the edit button, which is positioned over this slot. */}
                {editSlot && <span aria-hidden className="hidden size-9 shrink-0 group-focus-within/row:block group-hover/row:block" />}
                {/* Figma checkbox fill is #51525c (Untitled gray-iron 600), not the black brand-solid. */}
                <CheckboxBase isSelected={isSelected} className={cx(isSelected && "bg-[#51525c] ring-[#51525c]")} />
            </>
        )}
    </AriaCheckbox>
);

interface ReviewScreenProps {
    title: string;
    listLabel: string;
    addLabel: string;
    addPlaceholder: string;
    onAdd: (value: string) => void;
    onBack: () => void;
    onContinue: () => void;
    /** Replaces the built-in inline add form (competitors use their own Add → Finding → Added flow). */
    addSlot?: ReactNode;
    /** Figma "Competitors · 08 · None selected": Continue is disabled. */
    continueDisabled?: boolean;
    listRef?: Ref<HTMLDivElement>;
    children: ReactNode;
}

/** Shared body of the competitors / trends review screens (Figma Body at 279,142 in the modal). */
export const ReviewScreen = ({
    title,
    listLabel,
    addLabel,
    addPlaceholder,
    onAdd,
    onBack,
    onContinue,
    addSlot,
    continueDisabled,
    listRef,
    children,
}: ReviewScreenProps) => {
    const [adding, setAdding] = useState(false);
    const [value, setValue] = useState("");

    const submit = () => {
        if (!value.trim()) return;
        onAdd(value);
        setValue("");
        setAdding(false);
    };

    return (
        <div className="absolute top-[142px] left-1/2 flex w-160 -translate-x-1/2 flex-col items-center gap-8">
            <Heading slot="title" className="text-[30px] leading-[38px] font-medium whitespace-nowrap text-primary">
                {title}
            </Heading>

            <div className="flex w-full flex-col items-start gap-3">
                <div
                    ref={listRef}
                    role="group"
                    aria-label={listLabel}
                    className="flex max-h-[362px] w-full flex-col overflow-y-auto rounded-xl border border-secondary bg-primary shadow-xs"
                >
                    {children}
                </div>

                {addSlot ?? (adding ? (
                    <form
                        className="flex w-full items-start gap-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            submit();
                        }}
                    >
                        <Input
                            autoFocus
                            aria-label={addLabel}
                            placeholder={addPlaceholder}
                            value={value}
                            onChange={setValue}
                            className="flex-1"
                            onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
                        />
                        <Button type="button" color="secondary" size="md" onClick={() => setAdding(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" size="md" isDisabled={!value.trim()}>
                            Add
                        </Button>
                    </form>
                ) : (
                    <Button color="link-gray" size="sm" iconLeading={Plus} className="gap-1.5" onClick={() => setAdding(true)}>
                        {addLabel}
                    </Button>
                ))}
            </div>

            <div className="flex gap-3">
                <Button color="secondary" size="lg" onClick={onBack}>
                    Back
                </Button>
                <Button size="lg" onClick={onContinue} isDisabled={continueDisabled}>
                    Continue
                </Button>
            </div>
        </div>
    );
};
