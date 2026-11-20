import { Clock, Trash01, ArrowUpRight } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { cx } from "@/utils/cx";
import type { OnboardingDraft, StepId } from "@/features/brand-onboarding/flow";
import type { SocialPlatform } from "@/features/brand-onboarding/review/review-data";

/** A brand on the Brands page: still being researched (the user pressed "Run in background"), or finished. */
export interface Brand {
    id: string;
    name: string;
    domain: string;
    category: string;
    /** Logo image URL. */
    logo: string;
    channels: SocialPlatform[];
    status: "researching" | "researched" | "draft";
    /** Draft only: the step the user saved and exited from, and everything entered so far. */
    resume?: { step: StepId; data: OnboardingDraft };
    /** Colours entered by hand (manual setup), as #RRGGBB. */
    colours?: string[];
    /** When it was added (ms), for "2h ago" and the Recent sort. */
    createdAt: number;
}

/** Where a saved draft stops, in the words a person would use. */
const STEP_LABEL: Record<StepId, string> = {
    website: "Website",
    category: "Business category",
    audience: "Audience",
    assets: "Brand files",
    research: "Research",
    review: "Review",
    competitors: "Competitors",
    trends: "Trends",
    ready: "Final check",
    manual: "Manual setup",
};

export const STATUS_LABEL = { researching: "Researching", researched: "Researched", draft: "Draft" } as const;
export const STATUS_COLOR = { researching: "brand", researched: "success", draft: "gray" } as const;
export const openLabel = (b: Brand) => (b.status === "draft" ? "Continue setup" : b.status === "researching" ? "View progress" : "View overview");
/** The line under the name: category and site, or for a draft, where it was left. */
export const subline = (b: Brand) => (b.status === "draft" ? `Paused at ${STEP_LABEL[b.resume?.step ?? "website"]}` : [b.category, b.domain].filter(Boolean).join(" · "));

/** Research is six stages (brand kit, socials, audience, assets, brief, competitors); the prototype shows 3 of 6 while researching. */
export const STAGES = 6;
export const stagesDone = (b: Brand) => (b.status === "researched" ? STAGES : 3);

export const timeAgo = (ms: number) => {
    const m = Math.floor((Date.now() - ms) / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
};

interface BrandCardProps {
    brand: Brand;
    onOpen: (brand: Brand) => void;
    onDelete: (brand: Brand) => void;
}

/**
 * Brand card (Figma "0.2 · Your brands"): logo and a three-dot menu, the name, "category · website" on one line,
 * and a status pill with when it was added. The whole card opens the brand's overview — the
 * name is the one button, stretched over the card — while the menu stays above it.
 */
export const BrandCard = ({ brand, onOpen, onDelete }: BrandCardProps) => {
    const researching = brand.status === "researching";

    return (
        <article
            className={cx(
                "relative flex flex-col gap-4 rounded-xl border border-secondary bg-primary p-5 shadow-xs transition duration-200 ease-out",
                // While research runs, the card's edges glow in the brand colours until it finishes.
                researching && "card-glow",
                "hover:border-primary hover:shadow-md focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring motion-reduce:transition-none",
            )}
        >
            <div className="flex items-start justify-between">
                <Avatar size="lg" src={brand.logo} alt="" contrastBorder />
                <div className="relative z-10 -mt-1 -mr-2">
                    <Dropdown.Root>
                        <Dropdown.DotsButton aria-label={`${brand.name} options`} />
                        <Dropdown.Popover className="w-44">
                            <Dropdown.Menu>
                                <Dropdown.Item icon={ArrowUpRight} onAction={() => onOpen(brand)}>
                                    {openLabel(brand)}
                                </Dropdown.Item>
                                <Dropdown.Separator />
                                <Dropdown.Item icon={Trash01} onAction={() => onDelete(brand)}>
                                    Delete brand
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown.Root>
                </div>
            </div>

            <div className="flex min-w-0 flex-col gap-0.5">
                <h3 className="truncate text-md font-semibold text-primary">
                    <button type="button" onClick={() => onOpen(brand)} className="text-left outline-none after:absolute after:inset-0 after:rounded-xl">
                        {brand.name}
                    </button>
                </h3>
                <p className="truncate text-sm text-tertiary">{subline(brand)}</p>
            </div>

            <div className="flex items-center gap-3">
                <BadgeWithDot color={STATUS_COLOR[brand.status]} size="sm">
                    {STATUS_LABEL[brand.status]}
                </BadgeWithDot>
                <span className="flex-1" />
                <Clock aria-hidden className="size-3.5 text-fg-quaternary" />
                <span className="text-xs font-medium text-tertiary">{timeAgo(brand.createdAt)}</span>
            </div>
        </article>
    );
};
