import { useEffect, useRef, useState } from "react";
import { DotsVertical, Plus } from "@untitledui/icons";
import { Tab, TabList, TabPanel, Tabs } from "@/components/application/tabs/tabs";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import loadingCircle from "@/assets/socials/loading-circle.svg";
import { cx } from "@/utils/cx";
import { CHANNEL_LIST, FOUND_LIST, type SocialPlatform, accountFor } from "./review-data";
import { ReviewPanelFrame } from "./review-panels";
import { AddHandlePopover } from "./socials-add-handle";
import { CONNECT_MS, FACEBOOK_PAGES } from "./socials-data";
import { DisconnectDialog, FacebookPageDialog } from "./socials-dialogs";
import { socialsStore, useSocialsStore } from "./socials-store";

export type SocialsView = "found" | "channels";

interface SocialsPanelProps {
    view: SocialsView;
    onViewChange: (view: SocialsView) => void;
    connected: Set<SocialPlatform>;
    onConnect: (platform: SocialPlatform) => void;
    onDisconnect: (platform: SocialPlatform) => void;
}

type ChannelStatus = "connecting" | "failed";

const PlatformIcon = ({ src }: { src: string }) => (
    <div className="relative size-7 shrink-0">
        <img src={src} alt="" className="absolute inset-0 size-full max-w-none" />
    </div>
);

/** Figma "Loading circle" (20px) used for Checking / Connecting. */
const Spinner = () => <img src={loadingCircle} alt="" className="size-5 shrink-0 animate-spin" />;

/** Figma "Card/Socials": white list card with 69px rows. */
const listCard = "flex w-full flex-col items-start overflow-x-clip rounded-2xl border border-primary bg-primary shadow-[0px_2px_6px_-1px_rgba(10,13,18,0.06)]";
const listRow = "flex w-full shrink-0 items-center gap-3.5 border-b border-secondary px-5 py-3.5 last:border-b-0";
const scrollList = "min-h-0 overflow-y-auto [scrollbar-color:var(--color-border-primary)_transparent] [scrollbar-width:thin]";

/** Figma 72:5416 (Found accounts) and 72:5612 (Channels) — Social accounts section, with states from Socials · Found 01–05 / Channels 01–07. */
export const SocialsPanel = ({ view, onViewChange, connected, onConnect, onDisconnect }: SocialsPanelProps) => {
    const { selected, added, facebookPageId } = useSocialsStore();
    const [status, setStatus] = useState<Partial<Record<SocialPlatform, ChannelStatus>>>({});
    const [choosingPage, setChoosingPage] = useState(false);
    const [disconnecting, setDisconnecting] = useState<SocialPlatform | null>(null);
    // Keeps the dialog copy stable while it animates out.
    const [disconnectTarget, setDisconnectTarget] = useState<SocialPlatform>("instagram");

    const timers = useRef<number[]>([]);
    useEffect(() => () => timers.current.forEach(clearTimeout), []);

    const setChannelStatus = (platform: SocialPlatform, value?: ChannelStatus) =>
        setStatus((prev) => {
            const nextStatus = { ...prev };
            if (value) nextStatus[platform] = value;
            else delete nextStatus[platform];
            return nextStatus;
        });

    const connect = (platform: SocialPlatform) => {
        setChannelStatus(platform, "connecting");
        timers.current.push(
            window.setTimeout(() => {
                if (platform === "facebook") return setChoosingPage(true);
                if (socialsStore.consumeFailure(platform)) return setChannelStatus(platform, "failed");
                onConnect(platform);
                setChannelStatus(platform);
            }, CONNECT_MS),
        );
    };

    const handleFor = (platform: SocialPlatform) => {
        const extra = added[platform];
        if (extra?.status === "found") return extra.handle;
        if (platform === "facebook") return FACEBOOK_PAGES.find((p) => p.id === facebookPageId)?.name;
        return accountFor(platform).channelHandle;
    };

    const foundList = [...FOUND_LIST, ...CHANNEL_LIST.filter((p) => !FOUND_LIST.includes(p) && added[p])];
    const nextMissing = CHANNEL_LIST.find((p) => !accountFor(p).found && !added[p]) ?? "instagram";
    const addHandle = (platform: SocialPlatform, handle: string) => socialsStore.addHandle(platform, handle);


    return (
        <ReviewPanelFrame>
            <Tabs selectedKey={view} onSelectionChange={(key) => onViewChange(key as SocialsView)} className="min-h-0 flex-1 gap-4">
                <div className="flex w-full items-center gap-2">
                    <TabList type="button-border" size="sm" aria-label="Social accounts view">
                        <Tab id="found" className="h-9">
                            Found accounts
                        </Tab>
                        <Tab id="channels" className="h-9">
                            {({ isSelected }) => (
                                <>
                                    Channels
                                    {isSelected && connected.size > 0 && (
                                        <Badge size="sm" color="gray" className="ml-0.5">
                                            {connected.size}
                                        </Badge>
                                    )}
                                </>
                            )}
                        </Tab>
                    </TabList>
                    <div className="h-px flex-1" />
                    {view === "found" && (
                        <AddHandlePopover key={nextMissing} defaultPlatform={nextMissing} placement="bottom end" onAdd={addHandle}>
                            <Button color="secondary" size="sm" iconLeading={Plus}>
                                Add account
                            </Button>
                        </AddHandlePopover>
                    )}
                </div>

                <TabPanel id="found" className="w-full shrink-0">
                    {/* Figma card is 334px tall and may run into the panel's bottom padding; extra rows scroll. */}
                    <ul aria-label="Accounts we found" className={cx(listCard, scrollList, "max-h-[334px]")}>
                        {foundList.map((platform) => {
                            const account = accountFor(platform);
                            const extra = added[platform];
                            const found = extra?.status === "found" ? { name: extra.handle, audience: extra.audience } : !extra ? account.found : undefined;
                            return (
                                <li key={platform} className={cx(listRow, found && "transition-colors duration-100 hover:bg-secondary")}>
                                    <PlatformIcon src={found || extra ? account.icon : (account.iconMuted ?? account.icon)} />
                                    {extra?.status === "verifying" ? (
                                        <>
                                            <p className="min-w-0 flex-1 truncate text-sm leading-5 font-medium text-primary">{extra.handle}</p>
                                            <span role="status" aria-label={`Checking ${account.platformName} ${extra.handle}`}>
                                                <Spinner />
                                            </span>
                                        </>
                                    ) : found ? (
                                        <>
                                            <div className="flex min-w-0 flex-1 flex-col text-sm leading-5 whitespace-nowrap">
                                                <p className="font-medium text-primary">{found.name}</p>
                                                <p className="text-tertiary">{found.audience}</p>
                                            </div>
                                            <Checkbox
                                                // Figma checkbox fill is #51525c; the app's bg-brand-solid is pure black.
                                                className="[&_.bg-brand-solid]:bg-[#51525c] [&_.ring-brand-solid]:ring-[#51525c]"
                                                aria-label={`Use ${account.platformName} ${found.name}`}
                                                isSelected={selected.has(platform)}
                                                onChange={(isSelected) => socialsStore.toggleSelected(platform, isSelected)}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <p className="min-w-0 flex-1 text-sm leading-5 font-medium text-tertiary">Not found</p>
                                            <AddHandlePopover defaultPlatform={platform} defaultHandle={account.channelHandle} onAdd={addHandle}>
                                                <Button color="link-gray" size="sm" iconLeading={Plus} aria-label={`Add ${account.platformName} handle`}>
                                                    Add handle
                                                </Button>
                                            </AddHandlePopover>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </TabPanel>

                <TabPanel id="channels" className="flex min-h-0 w-full flex-1 flex-col gap-4">
                    <p className="w-full text-sm leading-5 text-tertiary">Connect the accounts you post to so AdKraft can publish your ads and track how they perform.</p>
                    <ul aria-label="Channels" className={cx(listCard, scrollList, "h-[298px] shrink-0")}>
                        {CHANNEL_LIST.map((platform) => {
                            const account = accountFor(platform);
                            const handle = handleFor(platform);
                            const rowStatus = status[platform];
                            return (
                                <li key={platform} className={listRow}>
                                    <PlatformIcon src={account.icon} />
                                    <div className="flex min-w-0 flex-1 flex-col text-sm leading-5 whitespace-nowrap">
                                        <p className="font-medium text-primary">{account.platformName}</p>
                                        {handle && <p className="text-tertiary">{handle}</p>}
                                    </div>
                                    {connected.has(platform) ? (
                                        <div className="flex items-center gap-2">
                                            <Badge size="sm" color="success">
                                                Connected
                                            </Badge>
                                            <Button
                                                color="tertiary"
                                                size="sm"
                                                iconLeading={DotsVertical}
                                                aria-label={`Disconnect ${account.platformName}`}
                                                onClick={() => {
                                                    setDisconnectTarget(platform);
                                                    setDisconnecting(platform);
                                                }}
                                            />
                                        </div>
                                    ) : rowStatus === "connecting" ? (
                                        <div role="status" className="flex items-center gap-2">
                                            <Spinner />
                                            <span className="text-sm leading-[1.45] font-medium text-tertiary">Connecting</span>
                                        </div>
                                    ) : rowStatus === "failed" ? (
                                        <div className="flex items-center gap-2">
                                            <span role="alert">
                                                <Badge size="sm" color="error">
                                                    Couldn't connect
                                                </Badge>
                                            </span>
                                            <Button color="secondary" size="sm" aria-label={`Retry connecting ${account.platformName}`} onClick={() => connect(platform)}>
                                                Retry
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button color="secondary" size="sm" aria-label={`Connect ${account.platformName}`} onClick={() => connect(platform)}>
                                            Connect
                                        </Button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </TabPanel>
            </Tabs>

            <FacebookPageDialog
                key={String(choosingPage)}
                isOpen={choosingPage}
                icon={accountFor("facebook").icon}
                defaultPageId={facebookPageId}
                onCancel={() => {
                    setChoosingPage(false);
                    setChannelStatus("facebook");
                }}
                onConnect={(pageId) => {
                    socialsStore.setFacebookPage(pageId);
                    onConnect("facebook");
                    setChoosingPage(false);
                    setChannelStatus("facebook");
                }}
            />

            <DisconnectDialog
                isOpen={disconnecting !== null}
                platformName={accountFor(disconnectTarget).platformName}
                handle={handleFor(disconnectTarget)}
                onCancel={() => setDisconnecting(null)}
                onDisconnect={() => {
                    if (disconnecting) onDisconnect(disconnecting);
                    setDisconnecting(null);
                }}
            />
        </ReviewPanelFrame>
    );
};
