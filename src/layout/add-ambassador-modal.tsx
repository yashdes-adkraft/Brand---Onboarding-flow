import { type FormEvent, useState } from "react";
import { Heading, Radio, RadioGroup } from "react-aria-components";
import { UserCheck01 } from "@untitledui/icons";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { RadioButtonBase } from "@/components/base/radio-buttons/radio-buttons";
import { cx } from "@/utils/cx";
import { AmbassadorHero } from "./ambassador-hero";
import { gradientFor, initialsOf } from "./characters-data";

export interface Ambassador {
    id: string;
    name: string;
    kind: "ai" | "real";
    description: string;
    likenessUrl: string;
    /** Real people only: who agreed to their likeness being used. Empty = agreement missing. */
    agreementWith: string;
    initials: string;
    gradient: string;
    /** How many ads use this ambassador. */
    usedIn: number;
}

const KIND_OPTIONS = [
    { id: "ai", label: "AI character we own", hint: "Made in Characters" },
    { id: "real", label: "A real person", hint: "Needs their agreement" },
] as const;

interface AddAmbassadorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (ambassador: Ambassador) => void;
}

/**
 * Add ambassador (Figma "B-41 · Add ambassador"): name, who this is (an AI character or a real person), a description,
 * a likeness image URL and — for real people — who agreed and a confirmation. "Add ambassador" stays disabled until the
 * required fields are filled; the agreement error shows once the field has been visited or a submit was attempted.
 */
export const AddAmbassadorModal = ({ isOpen, onClose, onAdd }: AddAmbassadorModalProps) => {
    const [name, setName] = useState("");
    const [kind, setKind] = useState<"ai" | "real">("ai");
    const [description, setDescription] = useState("");
    const [likenessUrl, setLikenessUrl] = useState("");
    const [agreementWith, setAgreementWith] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [touched, setTouched] = useState(false);

    const real = kind === "real";
    const agreementMissing = real && !agreementWith.trim();
    const valid = !!name.trim() && (!real || (!agreementMissing && confirmed));

    const close = () => {
        onClose();
        // Reset after the exit animation so the form doesn't flash empty while closing.
        window.setTimeout(() => {
            setName("");
            setKind("ai");
            setDescription("");
            setLikenessUrl("");
            setAgreementWith("");
            setConfirmed(false);
            setTouched(false);
        }, 250);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setTouched(true);
        if (!valid) return;
        onAdd({
            id: crypto.randomUUID(),
            name: name.trim(),
            kind,
            description: description.trim(),
            likenessUrl: likenessUrl.trim(),
            agreementWith: real ? agreementWith.trim() : "",
            initials: initialsOf(name.trim()),
            gradient: gradientFor(name.trim()),
            usedIn: 0,
        });
        close();
    };

    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && close()} isDismissable>
            <Modal className="max-w-[560px] rounded-2xl sm:rounded-2xl">
                <Dialog aria-label="Add ambassador" className="flex flex-col rounded-2xl">
                    <div className="relative">
                        <AmbassadorHero icon={UserCheck01} />
                        <CloseButton theme="dark" size="md" onPress={close} className="absolute top-3 right-3 text-white! hover:bg-white/25!" />
                    </div>

                    <form onSubmit={submit} noValidate className="flex flex-col">
                        <div className="flex flex-col gap-5 px-6 pt-5 pb-6">
                            <div className="flex flex-col gap-1">
                                <Heading slot="title" className="text-lg font-semibold text-primary">
                                    Add ambassador
                                </Heading>
                                <p className="text-sm text-tertiary">Someone who appears in this brand’s ads.</p>
                            </div>

                            <Input label="Name" isRequired size="md" value={name} onChange={setName} placeholder="e.g. Meera Sharma" autoFocus />

                            <RadioGroup aria-label="Who is this?" value={kind} onChange={(v) => setKind(v as "ai" | "real")} className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-secondary">Who is this?</span>
                                <div className="grid grid-cols-2 gap-3">
                                    {KIND_OPTIONS.map((o) => (
                                        <Radio key={o.id} value={o.id} className="outline-none">
                                            {({ isSelected, isFocusVisible }) => (
                                                <div
                                                    className={cx(
                                                        "flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3.5 transition duration-100 ease-linear",
                                                        isSelected ? "border-[1.5px] border-utility-blue-500 bg-utility-blue-50" : "border border-secondary bg-primary hover:border-primary",
                                                        isFocusVisible && "outline-2 outline-offset-2 outline-focus-ring",
                                                    )}
                                                >
                                                    <RadioButtonBase isSelected={isSelected} size="sm" className="mt-0.5" />
                                                    <span className="flex flex-col">
                                                        <span className={cx("text-sm font-semibold", isSelected ? "text-utility-blue-700" : "text-primary")}>{o.label}</span>
                                                        <span className="text-xs text-tertiary">{o.hint}</span>
                                                    </span>
                                                </div>
                                            )}
                                        </Radio>
                                    ))}
                                </div>
                            </RadioGroup>

                            <Input label="Description" size="md" value={description} onChange={setDescription} placeholder="Who they are, how they sound, what they do" />

                            <Input
                                label="Likeness image URL"
                                size="md"
                                type="url"
                                value={likenessUrl}
                                onChange={setLikenessUrl}
                                placeholder="https://"
                                hint="A clear, front-facing photo. Used only for this brand."
                            />

                            {real && (
                                <>
                                    <Input
                                        label="Agreement with"
                                        isRequired
                                        size="md"
                                        value={agreementWith}
                                        onChange={setAgreementWith}
                                        onBlur={() => setTouched(true)}
                                        isInvalid={touched && agreementMissing}
                                        placeholder="e.g. Meera Sharma, or her agency"
                                        hint={touched && agreementMissing ? "Required for real people. Name who agreed to their likeness being used." : undefined}
                                    />
                                    <div className="rounded-xl border border-secondary bg-secondary px-4 py-3.5">
                                        <Checkbox isSelected={confirmed} onChange={setConfirmed} label="I confirm we have a signed agreement for this person’s likeness and voice." />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-secondary px-6 py-4">
                            <Button type="button" color="secondary" size="md" onClick={close}>
                                Cancel
                            </Button>
                            <Button type="submit" size="md" isDisabled={!valid}>
                                Add ambassador
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};
