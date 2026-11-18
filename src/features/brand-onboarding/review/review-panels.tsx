import type { ReactNode } from "react";
import { Edit02, Plus } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { AudienceEditForm, BrandEditForm, LogoPicker, LogoTile, VoiceEditForm } from "./edit-forms";
import { type AudienceValues, type BrandValues, type EditableSection, type VoiceValues, saveSection, useReviewEdits } from "./edit-store";
import { BRAND } from "./review-data";

/** Figma "Panel" (72:4831): 756×426 gradient container on the right of the review screen. */
export const ReviewPanelFrame = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cx("flex h-[426px] w-[756px] flex-col items-start gap-4 overflow-clip rounded-2xl border border-secondary bg-linear-to-r from-[#eff4ff] to-[#fcf0f9] p-5", className)}>
        {children}
    </div>
);

/** Figma "Bar": source badge (+ "Edited by you" / "n not found") + Edit button. */
const SourceBar = ({ onEdit, edited, missing = 0 }: { onEdit: () => void; edited: boolean; missing?: number }) => (
    <div className="flex w-full items-center gap-2">
        <div className="flex items-center gap-1.5">
            <Badge type="modern" size="sm">
                From {BRAND.domain}
            </Badge>
            {edited && (
                <Badge type="pill-color" size="sm" color="gray">
                    Edited by you
                </Badge>
            )}
            {missing > 0 && (
                <Badge type="pill-color" size="sm" color="warning">
                    {missing} not found
                </Badge>
            )}
        </div>
        <div className="h-px flex-1" />
        <Button color="secondary" size="sm" onClick={onEdit}>
            Edit
        </Button>
    </div>
);

/** Figma "Card/…": white 332px card with 12px padding. */
const Card = ({ children }: { children: ReactNode }) => (
    <div className="flex h-[332px] w-full shrink-0 flex-col items-start overflow-clip rounded-[18px] border border-secondary bg-primary p-3 shadow-xs">{children}</div>
);

/** View row. With `onEdit`, hovering (or focusing) shows the Figma "Hover" state: grey row + pencil button. */
const Row = ({ label, children, height = "h-12", onEdit }: { label: string; children: ReactNode; height?: string; onEdit?: () => void }) => (
    <div className={cx("group flex w-full items-center justify-between gap-4 rounded-lg px-3 transition-colors duration-100", height, onEdit && "hover:bg-secondary focus-within:bg-secondary")}>
        <dt className="text-sm leading-[1.45] whitespace-nowrap text-tertiary">{label}</dt>
        <dd className="flex items-center gap-2">
            {children}
            {onEdit && (
                <span className="sr-only group-focus-within:not-sr-only group-hover:not-sr-only">
                    <Button color="tertiary" size="sm" iconLeading={Edit02} aria-label={`Edit ${label.toLowerCase()}`} onClick={onEdit} />
                </span>
            )}
        </dd>
    </div>
);

const Value = ({ children }: { children: ReactNode }) => <span className="text-sm leading-[1.45] font-medium whitespace-nowrap text-primary">{children}</span>;

const BadgeList = ({ items }: { items: string[] }) => (
    <ul className="flex items-start gap-1.5">
        {items.map((item) => (
            <li key={item}>
                <Badge size="sm" color="gray">
                    {item}
                </Badge>
            </li>
        ))}
    </ul>
);

/** Edit-mode wiring shared by the three panels (state lives in steps/review.tsx so leaving can be guarded). */
export interface PanelEditProps {
    isEditing: boolean;
    focusField?: string;
    onEdit: (field?: string) => void;
    onCancel: () => void;
    onDirtyChange: (dirty: boolean) => void;
    /** Called after the values are stored. */
    onSaved: (section: EditableSection) => void;
}

const Swatches = ({ colours }: { colours: string[] }) => (
    <ul aria-label={`Brand colours: ${colours.join(", ")}`} className="flex items-center gap-2">
        {colours.map((hex) => (
            <li key={hex} className="size-6 rounded-full border border-secondary" style={{ backgroundColor: hex }} />
        ))}
    </ul>
);

/** Figma 72:4831 — Brand section (+ edit states 8919:7394 … 8921:9438). */
export const BrandPanel = ({ isEditing, focusField, onEdit, onCancel, onDirtyChange, onSaved }: PanelEditProps) => {
    const { brand, edited } = useReviewEdits();
    const save = (values: BrandValues) => {
        saveSection("brand", values);
        onSaved("brand");
    };
    const missing = (brand.logo ? 0 : 1) + (brand.colours.length ? 0 : 1);

    if (isEditing) {
        return (
            <ReviewPanelFrame>
                <BrandEditForm initial={brand} focusField={focusField} onDirtyChange={onDirtyChange} onCancel={onCancel} onSave={save} />
            </ReviewPanelFrame>
        );
    }

    return (
        <ReviewPanelFrame>
            <SourceBar onEdit={() => onEdit()} edited={edited.brand} missing={missing} />
            <Card>
                <div className="flex w-full items-center gap-4 p-3">
                    <LogoTile logo={brand.logo} name={brand.name} />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45] whitespace-nowrap">
                        <p className="text-lg font-semibold text-primary">{brand.name}</p>
                        <p className="text-sm text-tertiary">{brand.domain}</p>
                    </div>
                    {!brand.logo && <LogoPicker onPick={(url) => saveSection("brand", { ...brand, logo: url })}>Upload logo</LogoPicker>}
                </div>
                <div className="w-full px-3 py-2">
                    <div className="h-px w-full bg-border-secondary" />
                </div>
                <dl className="w-full">
                    <Row label="Colours" onEdit={brand.colours.length ? () => onEdit("colours") : undefined}>
                        {brand.colours.length ? (
                            <Swatches colours={brand.colours} />
                        ) : (
                            <Button color="link-gray" size="sm" iconLeading={Plus} onClick={() => onEdit("colours")}>
                                Add colours
                            </Button>
                        )}
                    </Row>
                    <Row label="Category" onEdit={() => onEdit("category")}>
                        <Value>{brand.category}</Value>
                    </Row>
                    <Row label="Market" onEdit={() => onEdit("market")}>
                        <Value>{brand.market}</Value>
                    </Row>
                    <Row label="Language" onEdit={() => onEdit("language")}>
                        <Value>{brand.language}</Value>
                    </Row>
                </dl>
            </Card>
        </ReviewPanelFrame>
    );
};

type RowSpec = { label: string; value: string | string[] };

const RowsPanel = ({ rows, onEdit, edited }: { rows: RowSpec[]; onEdit: (field?: string) => void; edited: boolean }) => (
    <ReviewPanelFrame>
        <SourceBar onEdit={() => onEdit()} edited={edited} />
        <Card>
            <dl className="w-full">
                {rows.map((row) => (
                    <Row key={row.label} label={row.label} height="h-[52px]" onEdit={() => onEdit(row.label)}>
                        {Array.isArray(row.value) ? <BadgeList items={row.value} /> : <Value>{row.value}</Value>}
                    </Row>
                ))}
            </dl>
        </Card>
    </ReviewPanelFrame>
);

const audienceRows = (a: AudienceValues): RowSpec[] => [
    { label: "Who buys", value: a.whoBuys },
    { label: "Age", value: `${a.ageFrom} – ${a.ageTo}` },
    { label: "Gender", value: a.gender },
    { label: "Locations", value: a.locations },
    { label: "Interests", value: a.interests },
];

const voiceRows = (v: VoiceValues): RowSpec[] => [
    { label: "Tone", value: v.tone },
    { label: "Brand line", value: v.line },
    { label: "Words we use", value: v.use },
    { label: "Words we avoid", value: v.avoid },
];

/** Figma 72:5027 — Audience section (+ edit states 8925:7438 … 8925:9827). */
export const AudiencePanel = ({ isEditing, focusField, onEdit, onCancel, onDirtyChange, onSaved }: PanelEditProps) => {
    const { audience, edited } = useReviewEdits();
    if (isEditing) {
        return (
            <ReviewPanelFrame>
                <AudienceEditForm
                    initial={audience}
                    focusField={focusField}
                    onDirtyChange={onDirtyChange}
                    onCancel={onCancel}
                    onSave={(values) => {
                        saveSection("audience", values);
                        onSaved("audience");
                    }}
                />
            </ReviewPanelFrame>
        );
    }
    return <RowsPanel rows={audienceRows(audience)} onEdit={onEdit} edited={edited.audience} />;
};

/** Figma 72:5224 — Voice section (+ edit states 8927:8629 … 8927:11797). */
export const VoicePanel = ({ isEditing, focusField, onEdit, onCancel, onDirtyChange, onSaved }: PanelEditProps) => {
    const { voice, edited } = useReviewEdits();
    if (isEditing) {
        return (
            <ReviewPanelFrame>
                <VoiceEditForm
                    initial={voice}
                    focusField={focusField}
                    onDirtyChange={onDirtyChange}
                    onCancel={onCancel}
                    onSave={(values) => {
                        saveSection("voice", values);
                        onSaved("voice");
                    }}
                />
            </ReviewPanelFrame>
        );
    }
    return <RowsPanel rows={voiceRows(voice)} onEdit={onEdit} edited={edited.voice} />;
};
