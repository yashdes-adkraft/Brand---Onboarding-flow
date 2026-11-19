import { DistortionWave } from "distortion-waves";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, File06, PlayCircle, Plus, Trash01, UserPlus01 } from "@untitledui/icons";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import type { ReactNode } from "react";
import type { Ambassador } from "./add-ambassador-modal";

interface BrandAmbassadorsProps {
    ambassadors: Ambassador[];
    onImport: () => void;
    onAdd: () => void;
    onRemove: (ambassador: Ambassador) => void;
    onAddAgreement: (ambassador: Ambassador) => void;
}

/** The colour-only wave (the library's own picture of the page looks like a wireframe while it bends), softer than the defaults. */
const COLOUR_WAVE = { rimWidth: 44, rimStrength: 0.85, hairlineOpacity: 0.6, particleCount: 36, particleSize: 2, gatherGlow: 0.5 };

/** Ambassadors whose arrival has already played, so going away and back doesn't replay it. */
const arrived = new Set<string>();

/**
 * A card that has just been added or imported arrives with a distortion wave: the colour wave sweeps the card (rising from the bottom)
 * while it sharpens up out of a blur, and imported cards follow one another by `delay`. Cards that were already there just show.
 */
const Arrival = ({ id, delay, children }: { id: string; delay: number; children: ReactNode }) => {
    const reduce = useReducedMotion();
    const isNew = useRef(!arrived.has(id)).current;
    const wait = useRef(delay).current; // fixed at first render, so the cards that arrive don't change it
    const [revealed, setRevealed] = useState(!isNew);

    useEffect(() => {
        arrived.add(id);
        if (!isNew) return;
        const t = window.setTimeout(() => setRevealed(true), wait);
        return () => window.clearTimeout(t);
    }, [id, isNew, wait]);

    if (!isNew) return <>{children}</>;
    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 14, filter: "blur(10px)" }}
            animate={revealed ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" } : undefined}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
        >
            <DistortionWave revealed={revealed} capture={false} waveStyle={COLOUR_WAVE} style={{ borderRadius: 12, height: "100%" }}>
                {children}
            </DistortionWave>
        </motion.div>
    );
};

/** One ambassador (Figma "B-43"): a gradient (or photo) tile with initials, the name and menu, a type pill, the description and a footer line. */
const AmbassadorCard = ({ a, onRemove, onAddAgreement }: { a: Ambassador; onRemove: () => void; onAddAgreement: () => void }) => {
    const missing = a.kind === "real" && !a.agreementWith;
    return (
        <div className="flex h-full flex-col gap-3 rounded-xl border border-secondary bg-secondary p-3">
            <div className="flex h-[180px] items-center justify-center overflow-hidden rounded-lg" style={a.likenessUrl ? undefined : { backgroundImage: a.gradient }}>
                {a.likenessUrl ? (
                    <img src={a.likenessUrl} alt="" className="size-full object-cover" />
                ) : (
                    <span aria-hidden className="flex size-[76px] items-center justify-center rounded-full bg-white/25 text-2xl font-semibold text-white">
                        {a.initials}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3 px-1">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-md font-semibold text-primary">{a.name}</h3>
                    <Dropdown.Root>
                        <Dropdown.DotsButton aria-label={`${a.name} options`} className="-mr-2" />
                        <Dropdown.Popover className="w-44">
                            <Dropdown.Menu>
                                {missing && (
                                    <Dropdown.Item icon={File06} onAction={onAddAgreement}>
                                        Add agreement
                                    </Dropdown.Item>
                                )}
                                <Dropdown.Item icon={Trash01} onAction={onRemove}>
                                    Remove
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown.Root>
                </div>

                <div>
                    {a.kind === "ai" ? (
                        <BadgeWithDot color="brand" size="sm">
                            AI character
                        </BadgeWithDot>
                    ) : (
                        <BadgeWithDot color={missing ? "gray" : "success"} size="sm">
                            Real person
                        </BadgeWithDot>
                    )}
                </div>

                {a.description && <p className="text-sm text-tertiary">{a.description}</p>}
            </div>

            <div className="mx-1 flex items-center justify-between gap-2 border-t border-secondary pt-3 text-xs font-medium text-tertiary">
                {a.kind === "ai" ? (
                    <span className="flex items-center gap-1.5">
                        <PlayCircle aria-hidden className="size-4 text-fg-quaternary" />
                        {a.usedIn ? `Used in ${a.usedIn} ads` : "Not used in ads yet"}
                    </span>
                ) : missing ? (
                    <>
                        <span className="flex items-center gap-1.5 text-warning-primary">
                            <AlertTriangle aria-hidden className="size-4" />
                            Agreement missing
                        </span>
                        <Button size="sm" onClick={onAddAgreement}>
                            Add
                        </Button>
                    </>
                ) : (
                    <span className="flex items-center gap-1.5">
                        <File06 aria-hidden className="size-4 text-fg-quaternary" />
                        Agreement with {a.agreementWith}
                    </span>
                )}
            </div>
        </div>
    );
};

/**
 * Brand ▸ Ambassadors. Empty (Figma "B-40"): the title and its two actions, a dashed empty card and the agreement note.
 * With ambassadors (Figma "B-43"): a grid of ambassador cards, and a warning bar naming anyone
 * who can't be used in ads yet because their agreement is missing.
 */
export const BrandAmbassadors = ({ ambassadors, onImport, onAdd, onRemove, onAddAgreement }: BrandAmbassadorsProps) => {
    const needsAgreement = ambassadors.filter((a) => a.kind === "real" && !a.agreementWith);
    return (
        <>
            <div className="flex w-full flex-wrap items-end gap-4">
                <div className="flex min-w-[260px] flex-1 flex-col gap-1">
                    <h1 className="text-xl font-semibold text-primary">Ambassadors</h1>
                    <p className="text-sm text-tertiary">The faces and voices that appear in this brand’s ads.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button color="secondary" size="md" iconLeading={UserPlus01} onClick={onImport}>
                        Import from Characters
                    </Button>
                    <Button size="md" iconLeading={Plus} onClick={onAdd}>
                        Add ambassador
                    </Button>
                </div>
            </div>

            {ambassadors.length > 0 ? (
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
                    {ambassadors.map((a, i) => (
                        <li key={a.id}>
                            <Arrival id={a.id} delay={Math.max(0, i - ambassadors.filter((x) => arrived.has(x.id)).length) * 220}>
                                <AmbassadorCard a={a} onRemove={() => onRemove(a)} onAddAgreement={() => onAddAgreement(a)} />
                            </Arrival>
                        </li>
                    ))}
                </ul>
            ) : (
                <section className="flex min-h-[320px] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-secondary bg-secondary px-6 py-12 text-center">
                    <span className="flex size-12 items-center justify-center rounded-xl border border-secondary bg-primary text-fg-secondary shadow-xs">
                        <UserPlus01 aria-hidden className="size-6" />
                    </span>
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-md font-semibold text-primary">No ambassadors yet</h2>
                        <p className="max-w-[500px] text-sm text-tertiary">
                            Add an AI character you own, or a real person who has agreed to appear in your ads. Without one, ads use a generic narrator.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button color="secondary" size="md" iconLeading={UserPlus01} onClick={onImport}>
                            Import from Characters
                        </Button>
                        <Button size="md" iconLeading={Plus} onClick={onAdd}>
                            Add ambassador
                        </Button>
                    </div>
                </section>
            )}

            <div role="note" className="flex items-center gap-3 rounded-xl border border-secondary bg-secondary px-4 py-3.5 text-sm text-secondary">
                <AlertTriangle aria-hidden className="size-5 shrink-0 text-fg-warning-primary" />
                {needsAgreement.length
                    ? `${needsAgreement.map((a) => a.name).join(", ")} can’t be used in ads until an agreement is added.`
                    : "Real people need an agreement on file before they can be used. We ask who agreed when you add them."}
            </div>
        </>
    );
};
