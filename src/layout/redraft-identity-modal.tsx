import { useState } from "react";
import { Checkbox, CheckboxGroup, Heading, Radio, RadioGroup } from "react-aria-components";
import { AlertTriangle, Announcement01, CheckSquare, Globe02, Image03, Palette, Shield01, Stars01 } from "@untitledui/icons";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { CheckboxBase } from "@/components/base/checkbox/checkbox";
import { RadioButtonBase } from "@/components/base/radio-buttons/radio-buttons";
import credits from "@/assets/credits.png";
import { cx } from "@/utils/cx";
import { AmbassadorHero } from "./ambassador-hero";
import { IDENTITY_TABS, type IdentityTab } from "./identity-data";
import { KraftyIcon } from "./krafty-icon";

interface RedraftIdentityModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Sections the user has edited by hand: unticked by default so their changes stay. */
    edited: IdentityTab[];
    onStart: (sections: IdentityTab[]) => void;
}

const FLOATING = [Globe02, Announcement01, Palette, CheckSquare, Image03, Shield01];
const ALL = IDENTITY_TABS.map((t) => t.id);

/**
 * Re-draft identity (Figma "B-16a"): the header art, a warning when sections were edited by hand, and a choice between
 * rewriting every section or picking some. Edited sections start unticked so the user's changes stay; "All sections"
 * replaces them. The button counts what will be rewritten, with a rough credit cost.
 */
export const RedraftIdentityModal = ({ isOpen, onClose, edited, onStart }: RedraftIdentityModalProps) => {
    const [mode, setMode] = useState<"all" | "choose">("choose");
    const [picked, setPicked] = useState<string[]>(() => ALL.filter((id) => !edited.includes(id)));

    // Re-seed the ticks each time it opens, from what has been edited by now.
    const reset = () => {
        setMode("choose");
        setPicked(ALL.filter((id) => !edited.includes(id)));
    };

    const chosen = (mode === "all" ? ALL : (picked as IdentityTab[])).length;
    const cost = Math.max(1, Math.round((chosen * 8) / 3));
    const editedNames = edited.map((id) => IDENTITY_TABS.find((t) => t.id === id)!.label);

    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={(open) => (open ? reset() : onClose())} isDismissable>
            <Modal className="max-w-[480px] rounded-2xl sm:rounded-2xl">
                <Dialog aria-label="Re-draft identity" className="flex flex-col rounded-2xl">
                    <div className="relative">
                        <AmbassadorHero icon={Stars01} tiles={FLOATING.map((Icon, i) => <Icon key={i} className="size-full text-fg-secondary" />)} />
                        <CloseButton theme="dark" size="md" className="absolute top-3 right-3 text-white! hover:bg-white/25!" />
                    </div>

                    <div className="flex flex-col gap-5 px-6 pt-5 pb-6">
                        <div className="flex flex-col gap-1">
                            <Heading slot="title" className="text-lg font-semibold text-primary">
                                Re-draft identity?
                            </Heading>
                            <p className="text-sm text-tertiary">AdKraft rewrites the sections you pick from the latest research. About 1 minute.</p>
                        </div>

                        {edited.length > 0 && (
                            <div className="flex items-start gap-3 rounded-xl border border-[#fedf89] bg-[#fffaeb] p-4">
                                <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-fg-warning-primary" />
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-semibold text-[#b54708]">
                                        You edited {edited.length} {edited.length === 1 ? "section" : "sections"}
                                    </p>
                                    <p className="text-sm text-[#b54708]">{editedNames.join(", ")}. Tick them only if you want them rewritten.</p>
                                </div>
                            </div>
                        )}

                        <RadioGroup aria-label="What to re-draft" value={mode} onChange={(v) => setMode(v as "all" | "choose")} className="flex flex-col gap-3">
                            <span className="text-sm font-medium text-secondary">What to re-draft</span>
                            <Radio value="all" className="outline-none">
                                {({ isSelected, isFocusVisible }) => (
                                    <div
                                        className={cx(
                                            "flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3.5 transition duration-100",
                                            isSelected ? "border-[1.5px] border-utility-blue-500 bg-utility-blue-50" : "border border-secondary bg-primary hover:border-primary",
                                            isFocusVisible && "outline-2 outline-offset-2 outline-focus-ring",
                                        )}
                                    >
                                        <RadioButtonBase isSelected={isSelected} size="sm" className="mt-0.5" />
                                        <span className="flex flex-col">
                                            <span className="text-sm font-semibold text-primary">All sections</span>
                                            <span className="text-xs text-tertiary">
                                                Rewrites all {ALL.length}.{edited.length > 0 ? ` Replaces your ${edited.length} edited ${edited.length === 1 ? "section" : "sections"}.` : ""}
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </Radio>
                            <Radio value="choose" className="outline-none">
                                {({ isSelected, isFocusVisible }) => (
                                    <div
                                        className={cx(
                                            "flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3.5 transition duration-100",
                                            isSelected ? "border-[1.5px] border-utility-blue-500 bg-utility-blue-50" : "border border-secondary bg-primary hover:border-primary",
                                            isFocusVisible && "outline-2 outline-offset-2 outline-focus-ring",
                                        )}
                                    >
                                        <RadioButtonBase isSelected={isSelected} size="sm" className="mt-0.5" />
                                        <span className="flex min-w-0 flex-1 flex-col gap-2">
                                            <span className="flex flex-col">
                                                <span className="text-sm font-semibold text-primary">Choose sections</span>
                                                <span className="text-xs text-tertiary">Sections you edited start unticked, so your changes stay.</span>
                                            </span>
                                            <CheckboxGroup aria-label="Sections" value={picked} onChange={setPicked} isDisabled={!isSelected} className="flex flex-col gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                                                {IDENTITY_TABS.map((t) => (
                                                    <Checkbox key={t.id} value={t.id} className="group flex items-center gap-2.5 py-0.5 outline-none">
                                                        {({ isSelected: on, isFocusVisible: fv }) => (
                                                            <>
                                                                <CheckboxBase isSelected={on} isFocusVisible={fv} size="sm" />
                                                                <span className="flex-1 text-sm text-primary">{t.label}</span>
                                                                {edited.includes(t.id) && <span className="text-xs text-tertiary">Edited by you</span>}
                                                            </>
                                                        )}
                                                    </Checkbox>
                                                ))}
                                            </CheckboxGroup>
                                        </span>
                                    </div>
                                )}
                            </Radio>
                        </RadioGroup>
                    </div>

                    <div className="flex items-center gap-3 border-t border-secondary px-6 py-4">
                        <span className="flex flex-1 items-center gap-2 text-xs font-medium text-tertiary">
                            <img src={credits} alt="" className="size-4 rounded-full" />
                            About {cost} credits
                        </span>
                        <Button color="secondary" size="md" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            size="md"
                            isDisabled={chosen === 0}
                            iconLeading={() => <KraftyIcon white />}
                            onClick={() => onStart(mode === "all" ? ALL : (picked as IdentityTab[]))}
                        >
                            Re-draft {chosen} {chosen === 1 ? "section" : "sections"}
                        </Button>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};
