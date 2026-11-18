import type { FC, ReactNode } from "react";
import { BarChartSquare02, Bell01, Building07, Grid01, HelpCircle, HomeLine, MagicWand02, Plus, SearchLg, Send01, Stars02, Users01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";
import avatar from "@/assets/avatar.png";
import credits from "@/assets/credits.png";
import logo from "@/assets/logo.png";

/* ---------------------------------------------------------------- Rail (Figma: V5/Rail, compact 76px) */

type RailItemProps = { label: string; icon: ReactNode; active?: boolean; labelClassName?: string };

const RailItem = ({ label, icon, active, labelClassName }: RailItemProps) => (
    <a
        href="#"
        aria-current={active ? "page" : undefined}
        className="relative flex w-full flex-col items-center gap-1 overflow-clip py-1 outline-focus-ring focus-visible:outline-2 focus-visible:-outline-offset-2"
    >
        <span className={cx("flex h-[34px] w-11 items-center justify-center rounded-[10px]", active && "bg-active")}>{icon}</span>
        <span
            className={cx(
                "text-[10px] leading-[18px] font-medium tracking-[0.1px] whitespace-nowrap",
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

export const AppRail = () => (
    <nav aria-label="Primary" className="flex h-full w-[76px] shrink-0 flex-col items-center gap-1.5 border-r border-secondary bg-primary py-3.5">
        <img src={logo} alt="AdKraft" className="size-8" />
        <div className="h-2.5 w-px" />
        <RailItem label="Home" icon={railIcon(HomeLine)} />
        <RailItem label="Brands" icon={railIcon(Building07, true)} active />
        <RailItem label="Create" icon={railIcon(MagicWand02)} />
        <RailItem label="Publish" icon={railIcon(Send01)} />
        <RailItem label="Insights" icon={railIcon(BarChartSquare02)} />
        <RailItem label="Characters" icon={railIcon(Users01)} />
        <div className="flex-1" />
        <RailItem label="Krafty" icon={railIcon(Stars02)} />
        <RailItem label="8.5k" icon={<img src={credits} alt="" className="size-6" />} labelClassName="text-secondary" />
        <RailItem label="Help" icon={railIcon(HelpCircle)} />
        {/* Avatar export includes the company badge, which overhangs the 32px circle by 3.5px */}
        <img src={avatar} alt="Your account" className="size-[35.5px] max-w-none shrink-0 self-center pl-[1.75px]" />
    </nav>
);

/* ---------------------------------------------------------------- Secondary sidebar (Figma: 66:2227) */

type NavRowProps = { label: string; count: number; lead: ReactNode; active?: boolean };

const NavRow = ({ label, count, lead, active }: NavRowProps) => (
    <a href="#" className={cx("relative flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5", active && "bg-active")}>
        {lead}
        <span className={cx("min-w-0 flex-1 text-sm font-medium", active ? "text-primary" : "text-secondary")}>{label}</span>
        <span className="text-xs font-medium text-tertiary">{count}</span>
        {active && <span aria-hidden className="absolute top-[9px] left-0 h-4 w-0.5 rounded-[1px] bg-indicator" />}
    </a>
);

const Dot = ({ className }: { className: string }) => <span aria-hidden className={cx("size-2 shrink-0 rounded-full", className)} />;

export const BrandsSidebar = () => (
    <aside className="flex h-full w-[248px] shrink-0 flex-col gap-0.5 border-r border-secondary bg-primary px-3 py-3.5">
        <div className="flex w-full items-center px-2.5 pt-1 pb-2.5">
            <h2 className="flex-1 text-md font-semibold text-primary">Brands</h2>
            <button
                aria-label="New brand"
                className="flex size-7 items-center justify-center rounded-lg border border-secondary bg-secondary text-fg-secondary"
            >
                <Plus className="size-4" />
            </button>
        </div>
        <NavRow label="All brands" count={0} active lead={<Grid01 className="size-5 text-fg-quaternary" />} />
        <p className="w-full px-2.5 pt-3.5 pb-1.5 text-xs font-semibold tracking-[0.48px] text-tertiary">STATUS</p>
        <NavRow label="Plan ready" count={0} lead={<Dot className="bg-status-plan-ready" />} />
        <NavRow label="Researched" count={0} lead={<Dot className="bg-status-researched" />} />
        <NavRow label="Researching" count={0} lead={<Dot className="bg-status-researching" />} />
        <NavRow label="Ready to set up" count={0} lead={<Dot className="bg-status-ready" />} />
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

export const BrandsPage = ({ onNewBrand }: { onNewBrand: () => void }) => (
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
        <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-clip px-8 pt-7 pb-8">
            <div className="flex w-full items-end gap-3">
                <div className="flex flex-1 flex-col gap-1">
                    <h1 className="text-xl font-semibold text-primary">Your brands</h1>
                    <p className="text-sm text-tertiary">No brands yet</p>
                </div>
                <Button color="secondary" size="sm" iconLeading={Plus} onClick={onNewBrand}>
                    New brand
                </Button>
            </div>
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
                <Button color="secondary" size="sm" iconLeading={Plus} onClick={onNewBrand}>
                    New brand
                </Button>
            </section>
        </main>
    </div>
);
