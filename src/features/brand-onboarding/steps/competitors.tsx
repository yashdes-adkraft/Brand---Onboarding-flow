import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/base/avatar/avatar";
import facebook from "@/assets/market/facebook.svg";
import instagram from "@/assets/market/instagram.svg";
import youtube from "@/assets/market/youtube.svg";
import type { StepDefinition, StepProps } from "../flow";
import { CompetitorAdd, FindingRow } from "../market/competitor-add";
import { CompetitorEditDialog, initials } from "../market/competitor-edit-dialog";
import { type SocialPlatform, marketActions, useMarket } from "../market/market-store";
import { ReviewRow, ReviewScreen } from "../market/review-list";

const SOCIAL_ICONS: Record<SocialPlatform, { src: string; label: string }> = {
    instagram: { src: instagram, label: "Instagram" },
    facebook: { src: facebook, label: "Facebook" },
    youtube: { src: youtube, label: "YouTube" },
};

/** Figma "Competitors · 01 · Review" (72:5680) + states 8940:11483 … 8940:14117. */
const CompetitorsStep = ({ next, back }: StepProps) => {
    const { competitors } = useMarket();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [portal, setPortal] = useState<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Figma "04 · Finding": the list scrolls to the new row.
    const count = competitors.length;
    const prevCount = useRef(count);
    useEffect(() => {
        if (count > prevCount.current) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
        prevCount.current = count;
    }, [count]);

    const editing = competitors.find((c) => c.id === editingId) ?? null;

    return (
        <>
            <ReviewScreen
                title="Are these their competitors?"
                listLabel="Competitors"
                addLabel="Add a competitor"
                addPlaceholder="Competitor name or website"
                onAdd={marketActions.lookupCompetitor}
                addSlot={<CompetitorAdd addLabel="Add a competitor" placeholder="Competitor name or website" />}
                // Figma "08 · None selected": Continue is disabled until at least one competitor is kept.
                continueDisabled={!competitors.some((c) => c.kept)}
                listRef={listRef}
                onBack={back}
                onContinue={next}
            >
                {competitors.map((c) =>
                    c.finding ? (
                        <FindingRow key={c.id} website={c.website} />
                    ) : (
                        <ReviewRow
                            key={c.id}
                            title={c.name}
                            meta={c.website}
                            kept={c.kept}
                            onChange={(kept) => marketActions.toggleCompetitor(c.id, kept)}
                            onEdit={() => setEditingId(c.id)}
                            editLabel={`Edit ${c.name}`}
                            leading={
                                c.logo ? (
                                    <img src={c.logo} alt="" className="size-10 rounded-[10px] object-cover" />
                                ) : (
                                    <Avatar size="md" initials={initials(c.name)} className="rounded-[10px]" />
                                )
                            }
                            trailing={
                                c.socials.length > 0 && (
                                    <span className="flex items-center gap-3">
                                        {c.socials.map((s) => (
                                            <img key={s} src={SOCIAL_ICONS[s].src} alt={SOCIAL_ICONS[s].label} className="size-[18px]" />
                                        ))}
                                    </span>
                                )
                            }
                        />
                    ),
                )}
            </ReviewScreen>

            {/* Portal target for the edit dialog: covers the onboarding modal only, above its chrome. */}
            <div ref={setPortal} className="pointer-events-none absolute inset-0 z-20" />
            <CompetitorEditDialog competitor={editing} onClose={() => setEditingId(null)} portalContainer={portal} />
        </>
    );
};

export const competitorsStep: StepDefinition = {
    id: "competitors",
    ariaLabel: "New brand: competitors",
    phase: 2,
    phaseFill: 86 / 192,
    glow: "top",
    Component: CompetitorsStep,
};
