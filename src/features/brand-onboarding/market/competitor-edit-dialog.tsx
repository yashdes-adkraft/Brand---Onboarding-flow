import { useEffect, useRef, useState } from "react";
import { Heading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { type Competitor, isValidWebsite, marketActions } from "./market-store";

export const initials = (name: string) =>
    name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");

interface CompetitorEditDialogProps {
    competitor: Competitor | null;
    onClose: () => void;
    /** Element inside the onboarding modal the dialog is portaled into, so its overlay covers only that modal (Figma 8940:14032). */
    portalContainer: Element | null;
}

/** Figma "Competitors · 07 · Edit" — Dialog 8940:14034. */
export const CompetitorEditDialog = ({ competitor, onClose, portalContainer }: CompetitorEditDialogProps) => (
    <ModalOverlay
        isOpen={!!competitor}
        onOpenChange={(open) => !open && onClose()}
        isDismissable
        UNSTABLE_portalContainer={portalContainer ?? undefined}
        className="pointer-events-auto absolute inset-0 min-h-0 items-center sm:items-center"
    >
        <Modal className="w-120 max-w-full rounded-xl shadow-2xl sm:rounded-xl">
            <Dialog aria-label="Edit competitor">{competitor && <EditForm competitor={competitor} onClose={onClose} />}</Dialog>
        </Modal>
    </ModalOverlay>
);

const EditForm = ({ competitor, onClose }: { competitor: Competitor; onClose: () => void }) => {
    const [name, setName] = useState(competitor.name);
    const [website, setWebsite] = useState(competitor.website);
    const [instagram, setInstagram] = useState(competitor.instagram ?? "");
    const [facebook, setFacebook] = useState(competitor.facebook ?? "");
    const [logo, setLogo] = useState(competitor.logo);
    const [websiteError, setWebsiteError] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // Revoke a picked-but-not-saved logo when the dialog closes.
    const savedLogo = useRef(false);
    useEffect(
        () => () => {
            if (!savedLogo.current && logo && logo !== competitor.logo && logo.startsWith("blob:")) URL.revokeObjectURL(logo);
        },
        [logo, competitor.logo],
    );

    return (
        <form
            noValidate
            className="flex flex-col items-start gap-5 p-6"
            onSubmit={(e) => {
                e.preventDefault();
                if (!isValidWebsite(website)) {
                    setWebsiteError(true);
                    return;
                }
                savedLogo.current = true;
                marketActions.updateCompetitor(competitor.id, { name, website, instagram, facebook, logo });
                onClose();
            }}
        >
            <Heading slot="title" className="text-lg font-semibold text-primary">
                Edit competitor
            </Heading>

            <div className="flex items-center gap-4">
                {logo ? (
                    <img src={logo} alt="" className="size-14 rounded-[14px] object-cover" />
                ) : (
                    <Avatar size="xl" initials={initials(name || competitor.name)} className="rounded-[14px]" />
                )}
                <Button type="button" color="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                    Replace logo
                </Button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    aria-label="Replace logo"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setLogo(URL.createObjectURL(file));
                        e.target.value = "";
                    }}
                />
            </div>

            <Input size="lg" label="Name" value={name} onChange={setName} isRequired hideRequiredIndicator autoFocus />
            <Input
                size="lg"
                label="Website"
                value={website}
                onChange={(v) => {
                    setWebsite(v);
                    setWebsiteError(false);
                }}
                isInvalid={websiteError}
                hint={websiteError ? <span role="alert">Enter a valid website</span> : undefined}
            />
            <Input size="lg" label="Instagram" value={instagram} onChange={setInstagram} />
            <Input size="lg" label="Facebook" value={facebook} onChange={setFacebook} />

            <div className="flex w-full gap-3">
                <Button type="button" color="secondary" size="lg" className="flex-1" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" size="lg" className="flex-1" isDisabled={!name.trim()}>
                    Save
                </Button>
            </div>
        </form>
    );
};
