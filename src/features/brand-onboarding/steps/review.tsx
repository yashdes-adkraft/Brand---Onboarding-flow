import { useCallback, useState } from "react";
import { Heading } from "react-aria-components";
import { TabPanel, Tabs } from "@/components/application/tabs/tabs";
import { Button } from "@/components/base/buttons/button";
import type { StepDefinition, StepProps } from "../flow";
import { BRAND, FOUND_COUNT, type SocialPlatform } from "../review/review-data";
import { DISABLED_PRIMARY, DiscardDialog, SavedToast } from "../review/edit-fields";
import { type EditableSection, INITIAL_BRAND, INITIAL_VOICE, sameValues, useReviewEdits } from "../review/edit-store";
import { AudiencePanel, BrandPanel, VoicePanel } from "../review/review-panels";
import { type ReviewSection, SectionNav } from "../review/section-nav";
import { type SocialsView, SocialsPanel } from "../review/socials-panel";

/**
 * Figma "Review Brewbloom Coffee" — one screen, four sections:
 * Brand (72:4688), Audience (72:4884), Voice (72:5081), Social accounts (Found 72:5274 / Channels 72:5470).
 */
const ReviewStep = ({ draft, update, next, back }: StepProps) => {
    const [section, setSection] = useState<ReviewSection>("brand");
    const [socialsView, setSocialsView] = useState<SocialsView>("found");

    // Brand / Audience / Voice edit mode (Figma "… edit" state frames). Leaving with unsaved changes asks first.
    const edits = useReviewEdits();
    const [editing, setEditing] = useState<{ section: EditableSection; field?: string } | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);
    const [savedToast, setSavedToast] = useState<string | null>(null);
    const closeToast = useCallback(() => setSavedToast(null), []);

    const stopEditing = () => {
        setEditing(null);
        setIsDirty(false);
    };
    /** Run `action` after leaving edit mode, prompting with the Discard dialog when there are unsaved changes. */
    const leaveEdit = (action: () => void) => {
        if (editing && isDirty) return setPendingLeave(() => action);
        stopEditing();
        action();
    };
    const editProps = (id: EditableSection) => ({
        isEditing: editing?.section === id,
        focusField: editing?.section === id ? editing.field : undefined,
        onEdit: (field?: string) => {
            setSavedToast(null);
            setEditing({ section: id, field });
        },
        onCancel: () => leaveEdit(() => {}),
        onDirtyChange: setIsDirty,
        onSaved: (s: EditableSection) => {
            stopEditing();
            setSavedToast(`${SECTION_NAMES[s]} saved`);
        },
    });

    const brandDetail =
        edits.brand.name === INITIAL_BRAND.name && edits.brand.domain === INITIAL_BRAND.domain ? `${BRAND.name} · ${BRAND.domain}` : `${edits.brand.name} · ${edits.brand.domain}`;
    const voiceDetail = sameValues(edits.voice.tone, INITIAL_VOICE.tone) ? "Warm, simple, crafted" : edits.voice.tone.join(", ");

    return (
        <>
            <Heading slot="title" className="absolute top-[109px] left-[415px] w-[378px] text-center text-display-sm font-medium whitespace-nowrap text-primary">
                Review {BRAND.name}
            </Heading>

            <Tabs orientation="vertical" selectedKey={section} onSelectionChange={(key) => key !== section && leaveEdit(() => setSection(key as ReviewSection))} className="contents">
                <SectionNav
                    className="absolute top-[213.32px] left-[43px]"
                    details={{
                        brand: brandDetail,
                        audience: "5 groups, led by office workers",
                        voice: voiceDetail,
                        socials: `${FOUND_COUNT} accounts`,
                    }}
                    counts={{ socials: FOUND_COUNT }}
                />

                <div className="absolute top-[213.32px] left-[399px]">
                    <TabPanel id="brand">
                        <BrandPanel {...editProps("brand")} />
                    </TabPanel>
                    <TabPanel id="audience">
                        <AudiencePanel {...editProps("audience")} />
                    </TabPanel>
                    <TabPanel id="voice">
                        <VoicePanel {...editProps("voice")} />
                    </TabPanel>
                    <TabPanel id="socials">
                        <SocialsPanel
                            view={socialsView}
                            onViewChange={setSocialsView}
                            connected={new Set(draft.channels as SocialPlatform[])}
                            onConnect={(platform) => update({ channels: [...new Set([...draft.channels, platform])] })}
                            onDisconnect={(platform) => update({ channels: draft.channels.filter((c) => c !== platform) })}
                        />
                    </TabPanel>
                </div>
            </Tabs>

            <div className="absolute top-[671.32px] left-[494px] flex items-start gap-3">
                <Button color="secondary" size="lg" onClick={() => leaveEdit(back)}>
                    Back
                </Button>
                {/* Figma edit states: Confirm brand is disabled while there are unsaved changes. */}
                <Button size="lg" isDisabled={!!editing} className={DISABLED_PRIMARY} onClick={() => leaveEdit(next)}>
                    Confirm brand
                </Button>
            </div>

            <DiscardDialog
                isOpen={!!pendingLeave}
                message={editing?.section === "brand" ? "Your edits to the brand won’t be saved." : `Your edits to ${editing ? SECTION_NAMES[editing.section] : ""} will be lost.`}
                onKeepEditing={() => setPendingLeave(null)}
                onDiscard={() => {
                    const action = pendingLeave;
                    setPendingLeave(null);
                    stopEditing();
                    action?.();
                }}
            />
            <SavedToast message={savedToast} onClose={closeToast} />
        </>
    );
};

const SECTION_NAMES: Record<EditableSection, string> = { brand: "Brand", audience: "Audience", voice: "Voice" };

export const reviewStep: StepDefinition = {
    id: "review",
    ariaLabel: "New brand: review brand",
    phase: 1,
    // Figma "Fill" 29px of 192 on the Brand & social bar.
    phaseFill: 29 / 192,
    // Figma: same 1100×520 glow ellipse at (49,-300) + "Top fade" as the question steps.
    glow: "top",
    topFade: true,
    Component: ReviewStep,
};
