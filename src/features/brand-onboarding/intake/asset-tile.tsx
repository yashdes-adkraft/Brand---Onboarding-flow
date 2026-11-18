import { FileIcon } from "@untitledui/file-icons";
import { Badge } from "@/components/base/badges/badges";
import { ProgressBarBase } from "@/components/base/progress-indicators/progress-indicators";
import playButton from "@/assets/intake/play-button.svg";

export type AssetKind = "logo" | "image" | "video" | "document";

export const KIND_BADGE = {
    logo: { label: "Logo", color: "blue" },
    image: { label: "Image", color: "pink" },
    video: { label: "Video", color: "purple" },
    document: { label: "Document", color: "orange" },
} as const;

export const kindOf = ({ name, type }: { name: string; type: string }): AssetKind => {
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("image/")) return /logo/i.test(name) || type === "image/svg+xml" ? "logo" : "image";
    return "document";
};

/** "18 KB", "1.9 MB", "48 MB" — one decimal below 10, as in Figma. */
export const formatSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
    }
    const digits = i >= 2 && n < 10 ? 1 : 0;
    return `${n.toFixed(digits).replace(/\.0$/, "")} ${units[i]}`;
};

export interface AssetTileProps {
    name: string;
    size: number;
    type: string;
    /** 0–100 while uploading; undefined or 100 when done. */
    progress?: number;
    /** Static or object-URL preview. */
    preview?: string;
    /** "0:32" */
    duration?: string;
    /** Letter shown on the logo placeholder when there is no preview (the brand's initial). */
    monogram?: string;
}

const Thumb = ({ name, type, preview, duration, monogram }: AssetTileProps) => {
    const kind = kindOf({ name, type });

    if (kind === "logo" && !preview) {
        // Figma 66:4330 — monogram stand-in for the client's logo file.
        return (
            <div className="flex size-full items-center justify-center bg-[#f9f4ec]">
                <div className="flex size-10 items-center justify-center rounded-[10px] bg-[#1f3a2e] text-xl font-semibold text-[#f9f4ec]">
                    {(monogram || name).charAt(0).toUpperCase()}
                </div>
            </div>
        );
    }

    if (kind === "document" || !preview) {
        const ext = name.split(".").pop()?.toLowerCase() ?? "";
        return (
            <div className="flex size-full items-center justify-center bg-secondary">
                <FileIcon type={ext || type} variant="default" theme="light" className="size-10" />
            </div>
        );
    }

    return (
        <>
            {kind === "video" && preview.startsWith("blob:") ? (
                <video src={preview} muted preload="metadata" className="absolute inset-0 size-full object-cover" />
            ) : (
                <img src={preview} alt="" className={kind === "logo" ? "absolute inset-0 size-full bg-secondary object-contain p-3" : "absolute inset-0 size-full object-cover"} />
            )}
            {kind === "video" && (
                <>
                    <div className="absolute inset-0 bg-black/25" />
                    <img src={playButton} alt="" className="absolute top-6 left-1/2 size-8 -translate-x-1/2" />
                    {duration && (
                        <Badge type="pill-color" color="gray" size="sm" className="absolute right-2 bottom-1">
                            {duration}
                        </Badge>
                    )}
                </>
            )}
        </>
    );
};

/** Figma "Tile/*" (66:4329 …) — thumbnail, kind badge, file name and size or upload progress. */
export const AssetTile = (props: AssetTileProps) => {
    const { name, size, type, progress } = props;
    const badge = KIND_BADGE[kindOf({ name, type })];
    const uploading = progress !== undefined && progress < 100;

    return (
        <li className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-secondary bg-primary shadow-[0px_1px_3px_0px_rgba(15,18,31,0.05)]">
            <div className="relative h-20 w-full overflow-hidden">
                <Thumb {...props} />
                <Badge type="pill-color" color={badge.color} size="sm" className="absolute top-2 left-2">
                    {badge.label}
                </Badge>
            </div>
            {/* Reserve the uploading layout's height so the grid doesn't jump when an upload finishes. */}
            <div className="flex min-h-[62px] flex-col px-2.5 py-2 text-xs leading-[18px]">
                <p className="truncate font-medium text-primary" title={name}>
                    {name}
                </p>
                {uploading ? (
                    <>
                        <p className="text-utility-blue-600">{Math.round(progress)}%</p>
                        {/* Figma fills with grey #51525c, not the purple brand colour. */}
                        <ProgressBarBase value={progress} progressClassName="bg-fg-tertiary" />
                    </>
                ) : (
                    <p className="text-tertiary">{formatSize(size)}</p>
                )}
            </div>
        </li>
    );
};
