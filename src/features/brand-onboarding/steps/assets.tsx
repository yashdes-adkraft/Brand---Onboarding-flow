import { useEffect, useState } from "react";
import { Button as AriaButton, FileTrigger, Heading } from "react-aria-components";
import { FileUploadDropZone } from "@/components/application/file-upload/file-upload-base";
import { Tab, TabList, TabPanel, Tabs } from "@/components/application/tabs/tabs";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import plus from "@/assets/intake/plus.svg";
import type { OnboardingDraft, StepDefinition, StepProps } from "../flow";
import { type AssetKind, AssetTile, formatSize, kindOf } from "../intake/asset-tile";
import { KraftyPill } from "../krafty-pill";

type Asset = OnboardingDraft["assets"][number];

const FILTERS: { id: "all" | AssetKind; label: string }[] = [
    { id: "all", label: "All" },
    { id: "logo", label: "Logos" },
    { id: "image", label: "Images" },
    { id: "video", label: "Videos" },
    { id: "document", label: "Documents" },
];

const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/** Figma "Client assets" (66:4185) — body 66:4316. */
const AssetsStep = ({ draft, update, next, back, notify }: StepProps) => {
    const assets = draft.assets;
    const [filter, setFilter] = useState<string>("all");
    // shortcut: uploads are simulated client-side; swap for real upload progress once there is a backend.
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const [durations, setDurations] = useState<Record<string, string>>({});

    const uploading = Object.values(progress).some((p) => p < 100);
    useEffect(() => {
        if (!uploading) return;
        const id = setInterval(() => setProgress((prev) => Object.fromEntries(Object.entries(prev).map(([k, p]) => [k, Math.min(100, p + 2)]))), 150);
        return () => clearInterval(id);
    }, [uploading]);

    const addFiles = (list: FileList | null) => {
        const files = Array.from(list ?? []).filter((f) => !assets.some((a) => a.name === f.name));
        if (!files.length) return;
        update({ assets: [...assets, ...files.map(({ name, size, type }) => ({ name, size, type }))] });
        setProgress((prev) => ({ ...prev, ...Object.fromEntries(files.map((f) => [f.name, 0])) }));
        const urls = files.filter((f) => /^(image|video)\//.test(f.type)).map((f) => [f.name, URL.createObjectURL(f)] as const);
        setPreviews((prev) => ({ ...prev, ...Object.fromEntries(urls) }));
        files
            .filter((f) => f.type.startsWith("video/"))
            .forEach((f) => {
                const v = document.createElement("video");
                v.preload = "metadata";
                v.onloadedmetadata = () => setDurations((prev) => ({ ...prev, [f.name]: formatDuration(v.duration) }));
                v.src = urls.find(([n]) => n === f.name)?.[1] ?? "";
            });
    };

    const removeAsset = (name: string) => {
        update({ assets: assets.filter((a) => a.name !== name) });
        const drop = <T,>(rec: Record<string, T>) => Object.fromEntries(Object.entries(rec).filter(([k]) => k !== name));
        setProgress(drop);
        setPreviews(drop);
        setDurations(drop);
    };

    const done = assets.filter((a) => (progress[a.name] ?? 100) >= 100);
    const totalSize = formatSize(done.reduce((sum, a) => sum + a.size, 0));
    const countOf = (id: string) => (id === "all" ? assets.length : assets.filter((a) => kindOf(a) === id).length);

    const finish = () => {
        if (uploading) return notify("Hang on, files are still uploading.");
        update({ assets });
        next();
    };

    return (
        <>
            <div className="absolute top-[155px] left-1/2 flex w-[916px] -translate-x-1/2 flex-col items-center gap-8">
                <div className="flex w-full flex-col items-center gap-8">
                    <div className="flex w-full flex-col items-center gap-4">
                        <Heading slot="title" className="text-[30px] leading-[38px] font-medium tracking-[-0.6px] whitespace-nowrap text-primary">
                            Add client brand files.
                        </Heading>
                        <FileUploadDropZone
                            hint="Logos, photos, videos, guidelines, decks"
                            onDropFiles={addFiles}
                            // Figma: grey well with a dashed border and a grey (not brand) link; keep the brand ring while dragging.
                            // The upload button's ::before is stretched over the whole well so clicking anywhere opens the picker.
                            className="w-[478px] gap-3 py-[15px] border border-dashed border-secondary bg-tertiary [&:not(.ring-brand)]:ring-transparent [&_label_button]:text-secondary [&_label_button]:static [&_label_button]:before:inset-0 [&_label_button]:before:rounded-xl cursor-pointer"
                        />
                    </div>

                    {assets.length > 0 && (
                        <Tabs selectedKey={filter} onSelectionChange={(key) => setFilter(String(key))} className="gap-4">
                            <div className="flex w-full items-center gap-2">
                                <TabList type="button-border" size="sm" aria-label="Filter files by type">
                                    {FILTERS.map((f) => (
                                        <Tab key={f.id} id={f.id} className="h-9">
                                            {f.label}
                                            <Badge type="pill-color" color="gray" size="sm" className="ml-0.5">
                                                {countOf(f.id)}
                                            </Badge>
                                        </Tab>
                                    ))}
                                </TabList>
                                <span className="flex-1" />
                                {done.length > 0 && <p className="text-sm text-quaternary">{totalSize}</p>}
                            </div>

                            {FILTERS.map((f) => (
                                <TabPanel key={f.id} id={f.id}>
                                    <ul className="grid grid-cols-6 gap-2.5">
                                        {assets
                                            .filter((a) => f.id === "all" || kindOf(a) === f.id)
                                            .map((a) => (
                                                <AssetTile key={a.name} {...a} progress={progress[a.name]} preview={previews[a.name]} duration={durations[a.name]}
                                                    monogram={draft.website} onRemove={() => removeAsset(a.name)}
                                                />
                                            ))}
                                        <li className="flex">
                                            <FileTrigger allowsMultiple onSelect={addFiles}>
                                                <AriaButton className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-primary text-xs font-medium text-tertiary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2">
                                                    <img src={plus} alt="" className="size-5" />
                                                    Add more
                                                </AriaButton>
                                            </FileTrigger>
                                        </li>
                                    </ul>
                                </TabPanel>
                            ))}
                        </Tabs>
                    )}
                </div>

                <div className="flex items-start gap-3">
                    <Button color="secondary" size="lg" onClick={back}>
                        Back
                    </Button>
                    <Button size="lg" onClick={finish}>
                        Continue
                    </Button>
                    <Button color="tertiary" size="lg" onClick={next}>
                        Skip for now
                    </Button>
                </div>
            </div>

            <KraftyPill title="Kraftly searching..." detail="audience" />
        </>
    );
};

export const assetsStep: StepDefinition = {
    id: "assets",
    ariaLabel: "New brand: client assets",
    phase: 0,
    phaseFill: 182 / 192,
    glow: "top",
    Component: AssetsStep,
};
