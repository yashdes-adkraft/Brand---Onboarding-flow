import { useMemo, useState } from "react";
import { Checkbox, CheckboxGroup, Heading } from "react-aria-components";
import { Check, SearchLg, Users01 } from "@untitledui/icons";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";
import { AmbassadorHero } from "./ambassador-hero";
import { CHARACTERS, type Character } from "./characters-data";

interface ImportCharactersModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Names already added as ambassadors on this brand: shown but not selectable. */
    takenNames: string[];
    onImport: (characters: Character[]) => void;
}

/**
 * Import from Characters (Figma "B-42"): search the workspace's AI characters, tick the ones to add (a character that is
 * already an ambassador is greyed out), and import them. The footer counts the picks; "Import n" is off until there is one.
 */
export const ImportCharactersModal = ({ isOpen, onClose, takenNames, onImport }: ImportCharactersModalProps) => {
    const [query, setQuery] = useState("");
    const [picked, setPicked] = useState<string[]>([]);

    const q = query.trim().toLowerCase();
    const shown = useMemo(() => CHARACTERS.filter((c) => !q || `${c.name} ${c.short}`.toLowerCase().includes(q)), [q]);
    const isTaken = (c: Character) => c.taken || takenNames.includes(c.name);

    const close = () => {
        onClose();
        window.setTimeout(() => {
            setQuery("");
            setPicked([]);
        }, 250);
    };

    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && close()} isDismissable>
            <Modal className="max-w-[720px] rounded-2xl sm:rounded-2xl">
                <Dialog aria-label="Import from Characters" className="flex flex-col rounded-2xl">
                    <div className="relative">
                        <AmbassadorHero icon={Users01} />
                        <CloseButton theme="dark" size="md" className="absolute top-3 right-3 text-white! hover:bg-white/25!" />
                    </div>

                    <div className="flex flex-col gap-1 px-6 pt-5">
                        <Heading slot="title" className="text-lg font-semibold text-primary">
                            Import from Characters
                        </Heading>
                        <p className="text-sm text-tertiary">Pick AI characters your workspace owns. They stay linked, so edits in Characters show up here.</p>
                    </div>

                    <div className="px-6 pt-4">
                        <Input aria-label="Search characters" placeholder="Search characters" icon={SearchLg} size="md" value={query} onChange={setQuery} />
                    </div>

                    <CheckboxGroup aria-label="Characters" value={picked} onChange={setPicked} className="grid max-h-[300px] grid-cols-2 gap-3 overflow-y-auto px-6 py-4 sm:grid-cols-3">
                        {shown.map((c) => {
                            const taken = isTaken(c);
                            return (
                                <Checkbox key={c.id} value={c.id} isDisabled={taken} className="group relative outline-none">
                                    {({ isSelected, isFocusVisible }) => (
                                        <div
                                            className={cx(
                                                "flex h-full cursor-pointer flex-col gap-3 rounded-xl border bg-secondary p-2.5 transition duration-100 ease-linear",
                                                isSelected ? "border-utility-blue-500 ring-1 ring-utility-blue-500" : "border-secondary hover:border-primary",
                                                taken && "cursor-not-allowed opacity-70",
                                                isFocusVisible && "outline-2 outline-offset-2 outline-focus-ring",
                                            )}
                                        >
                                            <div className="relative flex h-[120px] items-center justify-center rounded-lg" style={{ backgroundImage: c.gradient }}>
                                                <span
                                                    aria-hidden
                                                    className={cx(
                                                        "absolute top-2.5 left-2.5 flex size-[18px] items-center justify-center rounded-[5px] border",
                                                        isSelected ? "border-white bg-white text-utility-blue-700" : "border-white/80 bg-white/15",
                                                        taken && "opacity-0",
                                                    )}
                                                >
                                                    {isSelected && <Check className="size-3.5" />}
                                                </span>
                                                <span aria-hidden className="flex size-[52px] items-center justify-center rounded-full bg-white/25 text-xl font-semibold text-white">
                                                    {c.initials}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1 px-0.5 pb-0.5">
                                                <span className="text-sm font-semibold text-primary">{c.name}</span>
                                                <span className="text-xs text-tertiary">{taken ? "Already an ambassador" : c.short}</span>
                                            </div>
                                        </div>
                                    )}
                                </Checkbox>
                            );
                        })}
                        {shown.length === 0 && <p className="col-span-full py-8 text-center text-sm text-tertiary">No characters match “{query.trim()}”.</p>}
                    </CheckboxGroup>

                    <div className="flex items-center gap-3 border-t border-secondary px-6 py-4">
                        <span className="flex-1 text-xs font-medium text-tertiary">{picked.length ? `${picked.length} selected` : "None selected"}</span>
                        <Button color="secondary" size="md" onClick={close}>
                            Cancel
                        </Button>
                        <Button
                            size="md"
                            isDisabled={!picked.length}
                            onClick={() => {
                                onImport(CHARACTERS.filter((c) => picked.includes(c.id)));
                                close();
                            }}
                        >
                            {picked.length ? `Import ${picked.length}` : "Import"}
                        </Button>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};
