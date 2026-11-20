import type { FC, ReactNode } from "react";
import { BarChartSquare02, Bell01, ChevronDown, List, Building07, Grid01, HelpCircle, HomeLine, MagicWand02, Plus, SearchLg, Send01, Users01 } from "@untitledui/icons";
import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";
import avatar from "@/assets/avatar.png";
import credits from "@/assets/credits.png";
import { type Brand, BrandCard } from "@/layout/brand-card";
import { BrandList } from "@/layout/brand-list";
import logo from "@/assets/logo.png";
import { KraftyIcon } from "@/layout/krafty-icon";

/* ---------------------------------------------------------------- Rail (Figma: V5/Rail, compact 76px) */

type RailItemProps = { label: string; icon: ReactNode; active?: boolean; labelClassName?: string; onClick?: () => void };

const RailItem = ({ label, icon, active, labelClassName, onClick }: RailItemProps) => (
    <a
        href="#"
        onClick={(e) => {
            e.preventDefault();
            onClick?.();
        }}
        aria-current={active ? "page" : undefined}
        className="group relative flex w-full flex-col items-center gap-1 overflow-clip py-1 outline-focus-ring focus-visible:outline-2 focus-visible:-outline-offset-2"
    >
        <span className={cx("flex h-[34px] w-11 items-center justify-center rounded-[10px] transition-colors group-hover:bg-active", active && "bg-active")}>{icon}</span>
        <span
            className={cx(
                "text-xs font-medium whitespace-nowrap",
                active ? "text-primary" : "text-tertiary",
                labelClassName,
            )}
        >
            {label}
        </span>
        {active && <span aria-hidden className="absolute top-2.5 left-0 h-[22px] w-[3px] rounded-[2px] bg-indicator" />}
    </a>
);

const railIcon = (Icon: FC<{ className?: string }>, active = false) => <Icon className={cx("size-6", active ? "text-primary" : "text-fg-rail")} />;

export const AppRail = ({ onBrands }: { onBrands?: () => void }) => (
    <nav aria-label="Primary" className="flex h-full w-[76px] shrink-0 flex-col items-center gap-1.5 border-r border-secondary bg-primary py-3.5">
        <img src={logo} alt="AdKraft" className="size-8" />
        <div className="h-2.5 w-px" />
        <RailItem label="Home" icon={railIcon(HomeLine)} />
        <RailItem label="Brands" icon={railIcon(Building07, true)} active onClick={onBrands} />
        <RailItem label="Create" icon={railIcon(MagicWand02)} />
        <RailItem label="Publish" icon={railIcon(Send01)} />
        <RailItem label="Insights" icon={railIcon(BarChartSquare02)} />
        <RailItem label="Characters" icon={railIcon(Users01)} />
        <div className="flex-1" />
        <RailItem label="Krafty" icon={<KraftyIcon />} />
        <RailItem label="8.5k" icon={<img src={credits} alt="" className="size-6" />} labelClassName="text-secondary" />
        <RailItem label="Help" icon={railIcon(HelpCircle)} />
        {/* Avatar export includes the company badge, which overhangs the 32px circle by 3.5px */}
        <img src={avatar} alt="Your account" className="size-[35.5px] max-w-none shrink-0 self-center pl-[1.75px]" />
    </nav>
);

/* ---------------------------------------------------------------- Secondary sidebar (Figma: 66:2227) */

type NavRowProps = { label: string; count: number; lead: ReactNode; active?: boolean; onClick?: () => void };

const NavRow = ({ label, count, lead, active, onClick }: NavRowProps) => (
    <a
        href="#"
        aria-current={active ? "true" : undefined}
        onClick={(e) => {
            e.preventDefault();
            onClick?.();
        }}
        className={cx("relative flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 transition-colors hover:bg-active", active && "bg-active")}
    >
        {lead}
        <span className={cx("min-w-0 flex-1 text-sm font-medium", active ? "text-primary" : "text-secondary")}>{label}</span>
        <span className="text-xs font-medium text-tertiary">{count}</span>
        {active && <span aria-hidden className="absolute top-[9px] left-0 h-4 w-0.5 rounded-[1px] bg-indicator" />}
    </a>
);

const Dot = ({ className }: { className: string }) => <span aria-hidden className={cx("size-2 shrink-0 rounded-full", className)} />;

export type StatusFilter = "plan-ready" | "researched" | "researching" | "ready" | null;

export const BrandsSidebar = ({
    statusFilter = null,
    onStatusFilter,
    onNewBrand,
    brandCount = 0,
    researchingCount = 0,
    draftCount = 0,
    brands = [],
    onOpenBrand,
}: {
    statusFilter?: StatusFilter;
    onStatusFilter?: (filter: StatusFilter) => void;
    onNewBrand: () => void;
    brandCount?: number;
    researchingCount?: number;
    /** Saved drafts, listed under "Ready to set up". */
    draftCount?: number;
    brands?: Brand[];
    onOpenBrand?: (brand: Brand) => void;
}) => (
    <aside className="flex h-full w-[248px] shrink-0 flex-col gap-0.5 border-r border-secondary bg-primary px-3 py-3.5">
        <div className="flex w-full items-center px-2.5 pt-1 pb-2.5">
            <h2 className="flex-1 text-md font-semibold text-primary">Brands</h2>
            <Button color="secondary" size="sm" iconLeading={Plus} aria-label="New brand" className="size-7 p-1.5! *:data-icon:size-4" onClick={onNewBrand} />
        </div>
        <NavRow label="All brands" count={brandCount} active={statusFilter === null} onClick={() => onStatusFilter?.(null)} lead={<Grid01 className="size-5 text-fg-quaternary" />} />
        <p className="w-full px-2.5 pt-3.5 pb-1.5 text-xs font-semibold tracking-[0.48px] text-tertiary">STATUS</p>
        <NavRow label="Plan ready" count={0} active={statusFilter === "plan-ready"} onClick={() => onStatusFilter?.("plan-ready")} lead={<Dot className="bg-status-plan-ready" />} />
        <NavRow label="Researched" count={brandCount - researchingCount - draftCount} active={statusFilter === "researched"} onClick={() => onStatusFilter?.("researched")} lead={<Dot className="bg-status-researched" />} />
        <NavRow label="Researching" count={researchingCount} active={statusFilter === "researching"} onClick={() => onStatusFilter?.("researching")} lead={<Dot className="bg-status-researching" />} />
        <NavRow label="Ready to set up" count={draftCount} active={statusFilter === "ready"} onClick={() => onStatusFilter?.("ready")} lead={<Dot className="bg-status-ready" />} />
        {brands.length > 0 && (
            <>
                <p className="w-full px-2.5 pt-3.5 pb-1.5 text-xs font-semibold tracking-[0.48px] text-tertiary">RECENT</p>
                {[...brands]
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .slice(0, 5)
                    .map((b) => (
                        <button
                            key={b.id}
                            type="button"
                            onClick={() => onOpenBrand?.(b)}
                            className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left outline-focus-ring hover:bg-active focus-visible:outline-2 focus-visible:-outline-offset-2"
                        >
                            <img src={b.logo} alt="" className="size-7 shrink-0 rounded-md object-cover" />
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-secondary">{b.name}</span>
                        </button>
                    ))}
            </>
        )}
        <div className="flex-1" />
        <div className="flex w-full flex-col gap-1.5 rounded-xl border border-secondary bg-linear-to-r from-[rgba(91,140,255,0.14)] to-[rgba(255,122,168,0.1)] p-3 text-xs">
            <p className="font-semibold text-primary">Tip</p>
            <p className="font-medium text-tertiary">Press G then B from anywhere to jump back to your brands.</p>
        </div>
    </aside>
);

/* ---------------------------------------------------------------- Brands page (empty state) */

const BrandTile = ({ gradient, rotate }: { gradient: string; rotate?: string }) => (
    <div className={cx("flex size-[81.32px] shrink-0 items-center justify-center", rotate)}>
        <div className="flex size-[72px] items-center justify-center rounded-[18px] border-3 border-white" style={{ backgroundImage: gradient }}>
            <Building07 className="size-[30px] text-white" />
        </div>
    </div>
);

type BrandsPageProps = { statusFilter?: StatusFilter; onNewBrand: () => void; brands?: Brand[]; onOpenBrand?: (brand: Brand) => void; onDeleteBrand?: (brand: Brand) => void };

export const BrandsPage = ({ statusFilter = null, onNewBrand, brands = [], onOpenBrand, onDeleteBrand }: BrandsPageProps) => {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<"recent" | "name">("recent");
    const [layout, setLayout] = useState<"grid" | "list">("grid");

    const q = query.trim().toLowerCase();
    const shown = brands
        .filter((b) => statusFilter === null || (statusFilter === "ready" ? b.status === "draft" : b.status === statusFilter))
        .filter((b) => !q || `${b.name} ${b.domain} ${b.category}`.toLowerCase().includes(q))
        .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : b.createdAt - a.createdAt));

    return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
        <header className="flex h-14 w-full shrink-0 items-center gap-3 border-b border-secondary px-7">
            <div className="flex flex-1 items-center gap-2 text-sm whitespace-nowrap">
                <span className="font-medium text-tertiary">Brands</span>
                <span className="text-placeholder">/</span>
                <span className="font-semibold text-primary">All brands</span>
            </div>
            <Input aria-label="Search" placeholder="Search" icon={SearchLg} shortcut="⌘K" size="md" className="w-[265px]" />
            <button aria-label="Notifications" className="flex size-[34px] items-center justify-center rounded-lg text-fg-quaternary">
                <Bell01 className="size-[18px]" />
            </button>
        </header>
        <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-8 pt-7 pb-8">
            <div className="flex w-full flex-wrap items-end gap-3">
                <div className="flex min-w-[240px] flex-1 flex-col gap-1">
                    <h1 className="text-xl font-semibold text-primary">Your brands</h1>
                    <p className="text-sm text-tertiary">
                        {brands.length ? `${brands.length} ${brands.length === 1 ? "brand" : "brands"} · identity, research and plans for each one` : "No brands yet"}
                    </p>
                </div>
                {brands.length > 0 && (
                    <>
                        <Input aria-label="Search brands" placeholder="Search brands" icon={SearchLg} size="md" value={query} onChange={setQuery} className="w-[220px]" />
                        <Dropdown.Root>
                            <Button color="tertiary" size="md" iconTrailing={ChevronDown}>
                                {sort === "recent" ? "Recent" : "Name"}
                            </Button>
                            <Dropdown.Popover className="w-40">
                                <Dropdown.Menu>
                                    <Dropdown.Item onAction={() => setSort("recent")}>Recent</Dropdown.Item>
                                    <Dropdown.Item onAction={() => setSort("name")}>Name</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown.Root>
                        <ButtonGroup size="md" aria-label="Layout" selectedKeys={[layout]} onSelectionChange={(k) => { const v = [...k][0]; if (v) setLayout(v as "grid" | "list"); }}>
                            <ButtonGroupItem id="grid" iconLeading={Grid01} aria-label="Grid" />
                            <ButtonGroupItem id="list" iconLeading={List} aria-label="List" />
                        </ButtonGroup>
                    </>
                )}
                <Button size="md" iconLeading={Plus} onClick={onNewBrand}>
                    New brand
                </Button>
            </div>
            {brands.length > 0 && shown.length === 0 && (
                <p className="py-10 text-center text-sm text-tertiary">{q ? `No brands match “${query.trim()}”.` : "No brands in this status yet."}</p>
            )}
            {shown.length > 0 && layout === "list" && (
                <BrandList brands={shown} total={brands.length} showAdd={!q && statusFilter === null} onNewBrand={onNewBrand} onOpen={(x) => onOpenBrand?.(x)} onDelete={(x) => onDeleteBrand?.(x)} />
            )}
            {shown.length > 0 && layout === "grid" && (
                <section aria-label="Brands" className={"grid w-full grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5"}>
                    {shown.map((b) => (
                        <BrandCard key={b.id} brand={b} onOpen={(x) => onOpenBrand?.(x)} onDelete={(x) => onDeleteBrand?.(x)} />
                    ))}
                    {!q && statusFilter === null && (
                        <button
                            type="button"
                            onClick={onNewBrand}
                            className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-primary bg-secondary text-center outline-focus-ring transition hover:bg-active focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            <span className="flex size-8 items-center justify-center rounded-lg border border-dashed border-primary bg-primary text-fg-secondary">
                                <Plus className="size-4" />
                            </span>
                            <span className="flex flex-col gap-0.5">
                                <span className="text-sm font-semibold text-primary">New brand</span>
                                <span className="text-xs text-tertiary">Name + website is enough to start</span>
                            </span>
                        </button>
                    )}
                </section>
            )}
            {brands.length === 0 && (
            <section className="flex w-full flex-col items-center justify-center gap-5 rounded-[20px] border border-dashed border-secondary bg-secondary py-20">
                <div className="flex items-center">
                    <div className="-mr-3.5">
                        <BrandTile rotate="rotate-8" gradient="linear-gradient(135deg, rgba(91,140,255,0.9) 0%, rgba(91,140,255,0.35) 71.429%)" />
                    </div>
                    <div className="-mr-3.5 flex size-[72px] items-center justify-center">
                        <div
                            className="flex size-[72px] shrink-0 items-center justify-center rounded-[18px] border-3 border-white"
                            style={{ backgroundImage: "linear-gradient(135deg, rgba(200,107,250,0.9) 0%, rgba(200,107,250,0.35) 71.429%)" }}
                        >
                            <Building07 className="size-[30px] text-white" />
                        </div>
                    </div>
                    <BrandTile rotate="-rotate-8" gradient="linear-gradient(135deg, rgba(255,122,168,0.9) 0%, rgba(255,122,168,0.35) 71.429%)" />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-xl font-semibold text-primary">Add your first brand</h2>
                    <p className="w-[520px] max-w-full text-center text-md text-tertiary">
                        Give AdKraft a name and a website. It researches the brand, drafts how it looks and sounds, and every ad you make stays on-brand.
                    </p>
                </div>
                <Button size="md" iconLeading={Plus} onClick={onNewBrand}>
                    New brand
                </Button>
            </section>
            )}
        </main>
    </div>
    );
};
