import type { FC, ReactNode } from "react";
import { Check } from "@untitledui/icons";
import { Checkbox, CheckboxGroup, Radio, RadioGroup } from "react-aria-components";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";

export interface OptionItem {
    id: string;
    label: string;
    icon: FC<{ className?: string }>;
    /** Optional supporting line under the label. */
    description?: ReactNode;
}

/**
 * Figma "Onboarding/Option card v3 (Untitled UI)" (8747:2230).
 * 220px card, Untitled UI modern featured icon, 22px key that fills blue with the selection order.
 */
/** `order` numbers multi-select picks; leave it out for single choice to show a check instead. */
const CardBody = ({ item, order, isSelected, isFocusVisible }: { item: OptionItem; order?: number; isSelected: boolean; isFocusVisible: boolean }) => (
    <div
        className={cx(
            "flex h-full w-[220px] cursor-pointer flex-col items-start gap-3.5 rounded-xl px-[18px] py-4 transition duration-100 ease-linear",
            isSelected
                ? "border-[1.5px] border-utility-blue-500 bg-utility-blue-50"
                : "border border-secondary bg-primary drop-shadow-[0px_1px_1px_rgba(10,13,18,0.05)] hover:border-primary",
            isFocusVisible && "outline-2 outline-offset-2 outline-focus-ring",
        )}
    >
        <div className="flex w-full items-start justify-between">
            <FeaturedIcon icon={item.icon} theme="modern" color="gray" size="md" />
            <span
                aria-hidden
                className={cx(
                    "flex size-[22px] items-center justify-center rounded-md border text-xs font-medium",
                    isSelected ? "border-utility-blue-600 bg-utility-blue-600 text-white" : "border-secondary bg-primary",
                )}
            >
                {isSelected && (order ? order : <Check className="size-3.5" />)}
            </span>
        </div>
        <div className="flex w-full flex-col gap-0.5">
            <span className={cx("text-md font-semibold", isSelected ? "text-utility-blue-700" : "text-primary")}>{item.label}</span>
            {item.description && <span className="text-sm text-tertiary">{item.description}</span>}
        </div>
    </div>
);

interface SingleProps {
    label: string;
    options: OptionItem[];
    value: string | null;
    onChange: (id: string) => void;
    /** Cards per row (Figma uses 4 for categories, 3 for audience). */
    columns?: number;
    className?: string;
}

/** Single-choice cards (radio semantics). */
export const OptionCardRadioGroup = ({ label, options, value, onChange, columns = 4, className }: SingleProps) => (
    <RadioGroup aria-label={label} value={value} onChange={onChange} className={cx("grid gap-3", className)} style={{ gridTemplateColumns: `repeat(${columns}, 220px)` }}>
        {options.map((item) => (
            <Radio key={item.id} value={item.id} className="outline-hidden">
                {({ isSelected, isFocusVisible }) => <CardBody item={item} isSelected={isSelected} isFocusVisible={isFocusVisible} />}
            </Radio>
        ))}
    </RadioGroup>
);

interface MultiProps {
    label: string;
    options: OptionItem[];
    /** Selected ids, in the order the user picked them — the key shows that order. */
    value: string[];
    onChange: (ids: string[]) => void;
    columns?: number;
    className?: string;
}

/** Multi-choice cards (checkbox semantics). Keeps pick order so the key can number it. */
export const OptionCardCheckboxGroup = ({ label, options, value, onChange, columns = 4, className }: MultiProps) => (
    <CheckboxGroup
        aria-label={label}
        value={value}
        onChange={(next) => onChange([...value.filter((id) => next.includes(id)), ...next.filter((id) => !value.includes(id))])}
        className={cx("grid gap-3", className)}
        style={{ gridTemplateColumns: `repeat(${columns}, 220px)` }}
    >
        {options.map((item) => (
            <Checkbox key={item.id} value={item.id} className="outline-hidden">
                {({ isSelected, isFocusVisible }) => (
                    <CardBody item={item} order={value.indexOf(item.id) + 1} isSelected={isSelected} isFocusVisible={isFocusVisible} />
                )}
            </Checkbox>
        ))}
    </CheckboxGroup>
);
