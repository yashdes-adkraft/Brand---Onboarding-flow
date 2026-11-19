import { Clock, Plus, Trash01, ArrowUpRight } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { cx } from "@/utils/cx";
import { type Brand, timeAgo } from "./brand-card";

/** Column template shared by the header and every row: Brand · Status · Updated · menu. */
/** Container queries: a narrow table drops "Updated", so the brand name never gets squeezed. */
const COLUMNS = "grid grid-cols-[minmax(0,1fr)_130px_44px] @xl:grid-cols-[minmax(0,1fr)_150px_140px_44px] items-center gap-x-4 px-5";
const UPDATED = "hidden @xl:flex";

interface BrandListProps {
    brands: Brand[];
    onOpen: (brand: Brand) => void;
    onDelete: (brand: Brand) => void;
    onNewBrand: () => void;
    /** Hides the "New brand" row (while a search is active). */
    showAdd?: boolean;
    total: number;
}

/**
 * List view of the brands (Figma "0.11 · Your brands — list view"): one table, a row per brand with its status and when it was updated, a "New brand" row at the end, and a footer with the count.
 * The brand name is the row's button, stretched over the row; the menu stays above it.
 */
export const BrandList = ({ brands, onOpen, onDelete, onNewBrand, showAdd = true, total }: BrandListProps) => (
    <div role="table" aria-label="Brands" className="@container w-full overflow-clip rounded-xl border border-secondary bg-primary shadow-xs">
        <div role="row" className={cx(COLUMNS, "h-11 border-b border-secondary bg-secondary text-xs font-medium text-tertiary")}>
            <span role="columnheader">Brand</span>
            <span role="columnheader">Status</span>
            <span role="columnheader" className={UPDATED}>
                Updated
            </span>
            <span role="columnheader" className="sr-only">
                Actions
            </span>
        </div>

        {brands.map((b) => {
            const researching = b.status === "researching";
            return (
                <div
                    key={b.id}
                    role="row"
                    className={cx(COLUMNS, "relative h-[65px] border-b border-secondary transition-colors hover:bg-secondary focus-within:bg-secondary motion-reduce:transition-none")}
                >
                    <div role="cell" className="flex min-w-0 items-center gap-3">
                        <Avatar size="sm" src={b.logo} alt="" contrastBorder className="shrink-0" />
                        <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-semibold text-primary">
                                <button type="button" onClick={() => onOpen(b)} className="text-left outline-focus-ring after:absolute after:inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2">
                                    {b.name}
                                </button>
                            </span>
                            <span className="truncate text-xs text-tertiary">
                                {b.category} · {b.domain}
                            </span>
                        </div>
                    </div>

                    <div role="cell">
                        <BadgeWithDot color={researching ? "brand" : "success"} size="sm">
                            {researching ? "Researching" : "Researched"}
                        </BadgeWithDot>
                    </div>

                    <div role="cell" className={cx(UPDATED, "items-center gap-1.5 text-sm text-tertiary")}>
                        <Clock aria-hidden className="size-4 text-fg-quaternary" />
                        {timeAgo(b.createdAt)}
                    </div>

                    <div role="cell" className="relative z-10 flex justify-end">
                        <Dropdown.Root>
                            <Dropdown.DotsButton aria-label={`${b.name} options`} />
                            <Dropdown.Popover className="w-44">
                                <Dropdown.Menu>
                                    <Dropdown.Item icon={ArrowUpRight} onAction={() => onOpen(b)}>
                                        {researching ? "View progress" : "View overview"}
                                    </Dropdown.Item>
                                    <Dropdown.Separator />
                                    <Dropdown.Item icon={Trash01} onAction={() => onDelete(b)}>
                                        Delete brand
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown.Root>
                    </div>
                </div>
            );
        })}

        {showAdd && (
            <button
                type="button"
                onClick={onNewBrand}
                className="flex h-[65px] w-full items-center gap-3 border-b border-secondary bg-secondary px-5 text-left outline-focus-ring hover:bg-active focus-visible:outline-2 focus-visible:-outline-offset-2"
            >
                <span className="flex size-8 items-center justify-center rounded-lg border border-dashed border-primary bg-primary text-fg-secondary">
                    <Plus className="size-4" />
                </span>
                <span className="flex flex-col">
                    <span className="text-sm font-semibold text-primary">New brand</span>
                    <span className="text-xs text-tertiary">Name + website is enough to start</span>
                </span>
            </button>
        )}

        <div className="flex h-14 items-center px-5 text-xs font-medium text-tertiary">
            Showing {brands.length} of {total} {total === 1 ? "brand" : "brands"}
        </div>
    </div>
);
