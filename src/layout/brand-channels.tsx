import { useEffect, useRef, useState } from "react";
import { Heading } from "react-aria-components";
import { AlertTriangle, CheckCircle, Globe02, Grid01, Lock01, Plus, RefreshCcw01, Link03, List, XClose } from "@untitledui/icons";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { AmbassadorHero } from "./ambassador-hero";
import { type SocialPlatform, accountFor } from "@/features/brand-onboarding/review/review-data";
import { cx } from "@/utils/cx";

/** Every channel a brand can connect, in the order the cards show. */
const PLATFORMS: { id: SocialPlatform; sub: string }[] = [
    { id: "instagram", sub: "Reels and feed posts" },
    { id: "tiktok", sub: "Business or creator account" },
    { id: "youtube", sub: "Shorts and videos" },
    { id: "facebook", sub: "Pages and Reels" },
    { id: "linkedin", sub: "Company page" },
    { id: "x", sub: "Posts and threads" },
];

/** Sample post activity for the accounts the brand already has; new connections start with none. */
const ACTIVITY: Partial<Record<SocialPlatform, { last: string; scheduled: number }>> = {
    instagram: { last: "Today, 9:30 AM", scheduled: 4 },
    facebook: { last: "Oct 22", scheduled: 2 },
    youtube: { last: "Oct 18", scheduled: 3 },
};

const handleOf = (p: SocialPlatform) => accountFor(p).found?.name ?? accountFor(p).channelHandle ?? "@aftershoot";

/** The platform's own coloured logo, whole inside a white tile (never cropped). */
const Logo = ({ platform, size = "md" }: { platform: SocialPlatform; size?: "md" | "lg" }) => (
    <span className={cx("flex shrink-0 items-center justify-center rounded-lg border border-secondary bg-white p-1.5 shadow-xs", size === "lg" ? "size-10" : "size-9")}>
        <img src={accountFor(platform).icon} alt="" className="size-full object-contain" />
    </span>
);

type Attempt = "connecting" | "denied";

interface BrandChannelsProps {
    brandName: string;
    channels: SocialPlatform[];
    onChannels: (next: SocialPlatform[]) => void;
    onSkip: () => void;
    notify: (message: string) => void;
}

/**
 * Brand ▸ Channels (Figma "B-50" none connected, "B-51" connecting / denied, "B-52" connected list, "B-53" disconnect).
 * Connecting is simulated: the card waits for approval, then connects. The first YouTube attempt is refused so the
 * "Couldn't connect" state and "Try again" can be seen. With channels connected the page is a table (or the same cards,
 * from the grid/list toggle) with a menu per account; "Connect a channel" adds another; "Disconnect" asks first.
 */
export const BrandChannels = ({ brandName, channels, onChannels, onSkip, notify }: BrandChannelsProps) => {
    const [attempts, setAttempts] = useState<Partial<Record<SocialPlatform, Attempt>>>({});
    const [view, setView] = useState<"list" | "grid">("grid");
    const [adding, setAdding] = useState(false);
    const [disconnecting, setDisconnecting] = useState<SocialPlatform | null>(null);
    const refused = useRef(new Set<SocialPlatform>());
    const timers = useRef(new Map<SocialPlatform, number>());
    const channelsRef = useRef(channels);
    channelsRef.current = channels;

    useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

    const setAttempt = (p: SocialPlatform, a: Attempt | undefined) =>
        setAttempts((cur) => {
            const next = { ...cur };
            if (a) next[p] = a;
            else delete next[p];
            return next;
        });

    const connect = (p: SocialPlatform) => {
        setAttempt(p, "connecting");
        window.clearTimeout(timers.current.get(p));
        timers.current.set(
            p,
            window.setTimeout(() => {
                if (p === "youtube" && !refused.current.has(p)) {
                    refused.current.add(p); // prototype: the first YouTube attempt is refused
                    setAttempt(p, "denied");
                    return;
                }
                setAttempt(p, undefined);
                onChannels([...channelsRef.current, p]);
                notify(`${accountFor(p).platformName} connected.`);
            }, 2200),
        );
    };
    const cancel = (p: SocialPlatform) => {
        window.clearTimeout(timers.current.get(p));
        setAttempt(p, undefined);
    };

    const connected = channels;
    const available = PLATFORMS.filter((p) => !connected.includes(p.id));

    /** A channel card: idle, waiting for approval, refused, or (grid view) connected. */
    const card = ({ id, sub }: { id: SocialPlatform; sub: string }) => {
        const attempt = attempts[id];
        const isConnected = connected.includes(id);
        const name = accountFor(id).platformName;
        return (
            <li
                key={id}
                className={cx(
                    "flex flex-col gap-3 rounded-xl border bg-secondary p-5",
                    attempt === "connecting" ? "border-utility-blue-500" : attempt === "denied" ? "border-error" : "border-secondary",
                )}
            >
                <div className="flex items-center gap-3">
                    <Logo platform={id} size="lg" />
                    <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="truncate text-md font-semibold text-primary">{isConnected ? handleOf(id) : name}</h3>
                        <p className="truncate text-xs text-tertiary">{isConnected ? name : sub}</p>
                    </div>
                    {isConnected && (
                        <>
                            <BadgeWithDot color="success" size="sm">
                                Connected
                            </BadgeWithDot>
                            {rowMenu(id)}
                        </>
                    )}
                </div>
                {attempt === "connecting" ? (
                    <>
                        <p className="flex items-start gap-2.5 text-sm text-secondary">
                            <span aria-hidden className="mt-1.5 size-2 shrink-0 animate-pulse rounded-full bg-utility-blue-500" />
                            Waiting for you to approve in the {name} window…
                        </p>
                        <div>
                            <Button color="secondary" size="sm" onClick={() => cancel(id)}>
                                Cancel
                            </Button>
                        </div>
                    </>
                ) : attempt === "denied" ? (
                    <>
                        <p className="text-sm text-error-primary">Couldn’t connect. Permission was denied in {name}.</p>
                        <div>
                            <Button color="secondary" size="sm" iconLeading={RefreshCcw01} onClick={() => connect(id)}>
                                Try again
                            </Button>
                        </div>
                    </>
                ) : isConnected ? (
                    <p className="text-sm text-tertiary">
                        {ACTIVITY[id] ? `Last post ${ACTIVITY[id]!.last} · ${ACTIVITY[id]!.scheduled} scheduled` : "No posts yet"}
                    </p>
                ) : (
                    <>
                        <p className="text-sm text-tertiary">Publish ads from AdKraft and read how each post performs.</p>
                        <div>
                            <Button color="secondary" size="sm" iconLeading={Link03} onClick={() => connect(id)}>
                                Connect {name}
                            </Button>
                        </div>
                    </>
                )}
            </li>
        );
    };

    const rowMenu = (id: SocialPlatform) => (
        <Dropdown.Root>
            <Dropdown.DotsButton aria-label={`${accountFor(id).platformName} options`} />
            <Dropdown.Popover className="w-52">
                <Dropdown.Menu>
                    <Dropdown.Item icon={Globe02} onAction={() => notify(`Opening ${accountFor(id).platformName} is the next screen to build.`)}>
                        Open on {accountFor(id).platformName}
                    </Dropdown.Item>
                    <Dropdown.Item icon={RefreshCcw01} onAction={() => notify(`${accountFor(id).platformName} reconnected.`)}>
                        Reconnect
                    </Dropdown.Item>
                    <Dropdown.Separator />
                    <Dropdown.Item icon={XClose} onAction={() => setDisconnecting(id)}>
                        Disconnect
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown.Root>
    );

    return (
        <>
            <div className="flex w-full flex-wrap items-end gap-4">
                <div className="flex min-w-[260px] flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl font-semibold text-primary">Channels</h1>
                        {connected.length > 0 && (
                            <span className="rounded-md border border-secondary bg-primary px-2 py-0.5 text-xs font-medium text-secondary">{connected.length} connected</span>
                        )}
                    </div>
                    <p className="text-sm text-tertiary">Where {brandName}’s ads get published. Each brand keeps its own connections.</p>
                </div>
                <div className="flex items-center gap-3">
                    {connected.length > 0 && (
                        <ButtonGroup
                            size="md"
                            aria-label="Layout"
                            selectedKeys={[view]}
                            onSelectionChange={(k) => {
                                const v = [...k][0];
                                if (v) setView(v as "list" | "grid");
                            }}
                        >
                            <ButtonGroupItem id="grid" iconLeading={Grid01} aria-label="Grid" />
                            <ButtonGroupItem id="list" iconLeading={List} aria-label="List" />
                        </ButtonGroup>
                    )}
                    <Button size="md" iconLeading={Plus} isDisabled={available.length === 0} onClick={() => setAdding(true)}>
                        Connect a channel
                    </Button>
                </div>
            </div>

            {view === "grid" || connected.length === 0 ? (
                <>
                    <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">{PLATFORMS.map((p) => card(p))}</ul>
                    <div role="note" className="flex items-center gap-3 rounded-xl border border-secondary bg-secondary px-4 py-3.5 text-sm text-secondary">
                        <Lock01 aria-hidden className="size-4 shrink-0 text-fg-quaternary" />
                        You sign in on the platform. AdKraft never sees your password and only asks to publish and read post results.
                    </div>
                    {connected.length === 0 && (
                        <div className="flex items-center justify-between gap-4 px-1 text-sm text-tertiary">
                            <span>You can skip this and connect later from Publish.</span>
                            <Button color="tertiary" size="md" onClick={onSkip}>
                                Skip for now
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div role="table" aria-label="Connected channels" className="@container w-full overflow-clip rounded-xl border border-secondary bg-primary shadow-xs">
                    <div role="row" className="grid h-11 grid-cols-[minmax(0,1fr)_140px_44px] items-center gap-x-4 border-b border-secondary bg-secondary px-5 text-xs font-medium text-tertiary @xl:grid-cols-[minmax(0,1.4fr)_150px_160px_140px_44px]">
                        <span role="columnheader">Account</span>
                        <span role="columnheader">Status</span>
                        <span role="columnheader" className="hidden @xl:block">Last post</span>
                        <span role="columnheader" className="hidden @xl:block">Scheduled</span>
                        <span role="columnheader" className="sr-only">Actions</span>
                    </div>
                    {connected.map((id) => (
                        <div key={id} role="row" className="grid h-[69px] grid-cols-[minmax(0,1fr)_140px_44px] items-center gap-x-4 border-b border-secondary px-5 last:border-b-0 @xl:grid-cols-[minmax(0,1.4fr)_150px_160px_140px_44px]">
                            <div role="cell" className="flex min-w-0 items-center gap-3">
                                <Logo platform={id} />
                                <div className="flex min-w-0 flex-col">
                                    <span className="truncate text-sm font-semibold text-primary">{handleOf(id)}</span>
                                    <span className="truncate text-xs text-tertiary">{accountFor(id).platformName}</span>
                                </div>
                            </div>
                            <div role="cell">
                                <BadgeWithDot color="success" size="sm">
                                    Connected
                                </BadgeWithDot>
                            </div>
                            <div role="cell" className="hidden text-sm text-tertiary @xl:block">
                                {ACTIVITY[id]?.last ?? "No posts yet"}
                            </div>
                            <div role="cell" className="hidden text-sm text-tertiary @xl:block">
                                {ACTIVITY[id] ? `${ACTIVITY[id]!.scheduled} posts` : "None"}
                            </div>
                            <div role="cell" className="flex justify-end">
                                {rowMenu(id)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Connect a channel: the channels not connected yet */}
            <ModalOverlay isOpen={adding} onOpenChange={setAdding} isDismissable>
                <Modal className="max-w-[560px] rounded-2xl sm:rounded-2xl">
                    <Dialog aria-label="Connect a channel" className="flex flex-col rounded-2xl">
                        <div className="relative">
                            <AmbassadorHero icon={Link03} logos={PLATFORMS.map((p) => accountFor(p.id).icon)} />
                            <CloseButton theme="dark" size="md" className="absolute top-3 right-3 text-white! hover:bg-white/25!" />
                        </div>
                        <div className="flex flex-col gap-1 px-6 pt-5">
                            <Heading slot="title" className="text-lg font-semibold text-primary">
                                Connect a channel
                            </Heading>
                            <p className="text-sm text-tertiary">Pick where {brandName}’s ads should get published.</p>
                        </div>
                        <ul className="flex flex-col gap-2.5 px-6 pt-4 pb-6">
                            {available.map((p) => (
                                <li key={p.id} className="flex items-center gap-3 rounded-xl border border-secondary bg-secondary p-3.5">
                                    <Logo platform={p.id} />
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <span className="text-sm font-semibold text-primary">{accountFor(p.id).platformName}</span>
                                        <span className="text-xs text-tertiary">{p.sub}</span>
                                    </div>
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        iconLeading={Link03}
                                        onClick={() => {
                                            setAdding(false);
                                            connect(p.id);
                                            setView("grid"); // the waiting card shows in the grid view
                                        }}
                                    >
                                        Connect
                                    </Button>
                                </li>
                            ))}
                            {available.length === 0 && <li className="py-6 text-center text-sm text-tertiary">Every channel is connected.</li>}
                        </ul>
                    </Dialog>
                </Modal>
            </ModalOverlay>

            {/* Disconnect (Figma "B-53") */}
            <ModalOverlay isOpen={!!disconnecting} onOpenChange={(o) => !o && setDisconnecting(null)} isDismissable>
                <Modal className="max-w-[480px] rounded-2xl sm:rounded-2xl">
                    <Dialog role="alertdialog" aria-label="Disconnect channel" className="flex flex-col rounded-2xl">
                        {disconnecting && (
                            <>
                                <div className="flex items-start gap-4 p-6 pb-5">
                                    <FeaturedIcon icon={AlertTriangle} color="error" theme="light" size="md" />
                                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                                        <Heading slot="title" className="text-md font-semibold text-primary">
                                            Disconnect {accountFor(disconnecting).platformName}?
                                        </Heading>
                                        <p className="text-sm text-tertiary">
                                            {handleOf(disconnecting)} will no longer be available for {brandName}.
                                        </p>
                                    </div>
                                    <CloseButton size="sm" className="-mt-1 -mr-2" />
                                </div>
                                <ul className="flex flex-col gap-3 px-6 pb-6 text-sm text-secondary">
                                    <li className="flex items-center gap-2.5">
                                        <AlertTriangle aria-hidden className="size-4 shrink-0 text-fg-warning-primary" />
                                        {ACTIVITY[disconnecting]?.scheduled ?? 0} scheduled posts will be paused
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <CheckCircle aria-hidden className="size-4 shrink-0 text-fg-success-secondary" />
                                        Posts already published stay on {accountFor(disconnecting).platformName}
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <CheckCircle aria-hidden className="size-4 shrink-0 text-fg-success-secondary" />
                                        Other brands’ {accountFor(disconnecting).platformName} connections are not affected
                                    </li>
                                </ul>
                                <div className="flex items-center justify-end gap-3 border-t border-secondary px-6 py-4">
                                    <Button color="secondary" size="md" onClick={() => setDisconnecting(null)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary-destructive"
                                        size="md"
                                        onClick={() => {
                                            const p = disconnecting;
                                            onChannels(connected.filter((c) => c !== p));
                                            setDisconnecting(null);
                                            notify(`${accountFor(p).platformName} disconnected.`);
                                        }}
                                    >
                                        Disconnect
                                    </Button>
                                </div>
                            </>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </>
    );
};
