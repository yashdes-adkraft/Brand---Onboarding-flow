import type { FC, SVGProps } from "react";
import { Announcement01, Building07, Users01 } from "@untitledui/icons";
import { Tab as AriaTab } from "react-aria-components";
import { TabList } from "@/components/application/tabs/tabs";
import { Badge } from "@/components/base/badges/badges";
import instagram from "@/assets/review/instagram.svg";
import { cx } from "@/utils/cx";

export type ReviewSection = "brand" | "audience" | "voice" | "socials";

interface NavItem {
    id: ReviewSection;
    label: string;
    icon: FC<SVGProps<SVGSVGElement> & { size?: number }>;
}

const ITEMS: NavItem[] = [
    { id: "brand", label: "Brand", icon: Building07 },
    { id: "audience", label: "Audience", icon: Users01 },
    { id: "voice", label: "Voice", icon: Announcement01 },
    { id: "socials", label: "Social accounts", icon: ({ className }) => <img src={instagram} alt="" className={className} /> },
];

interface SectionNavProps {
    /** Secondary line under the active item, per section. */
    details: Partial<Record<ReviewSection, string>>;
    /** Count badge shown on inactive items. */
    counts: Partial<Record<ReviewSection, number>>;
    className?: string;
}

/** Figma "Tabs" (72:4808) — the review screen's left section nav. Render inside an Untitled `Tabs` with orientation="vertical". */
export const SectionNav = ({ details, counts, className }: SectionNavProps) => (
    <TabList aria-label="Review sections" orientation="vertical" className={cx("w-[332px] gap-1.5", className)}>
        {ITEMS.map(({ id, label, icon: Icon }) => (
            <AriaTab
                key={id}
                id={id}
                className={({ isSelected, isHovered, isFocusVisible }) =>
                    cx(
                        "flex w-full cursor-pointer gap-3.5 rounded-xl px-4 py-3.5 outline-focus-ring transition duration-100 ease-linear",
                        isSelected && details[id] ? "items-start py-4" : "items-center",
                        isSelected ? "bg-utility-blue-50" : isHovered && "bg-primary_hover",
                        isFocusVisible && "outline-2 -outline-offset-2",
                    )
                }
            >
                {({ isSelected }) => (
                    <>
                        <span className="flex size-6 shrink-0 items-center justify-center">
                            <Icon aria-hidden className={cx("size-5", isSelected ? "text-utility-blue-600" : "text-fg-quaternary")} />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className={cx("text-md", isSelected ? "font-semibold text-primary" : "font-medium text-secondary")}>{label}</span>
                            {isSelected && details[id] && <span className="text-sm text-tertiary">{details[id]}</span>}
                        </span>
                        {!isSelected && counts[id] !== undefined && (
                            <Badge size="sm" color="blue">
                                {counts[id]}
                            </Badge>
                        )}
                    </>
                )}
            </AriaTab>
        ))}
    </TabList>
);
