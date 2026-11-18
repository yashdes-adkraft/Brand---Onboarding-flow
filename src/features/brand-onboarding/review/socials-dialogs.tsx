import { useState } from "react";
import { AlertTriangle } from "@untitledui/icons";
import { Heading, Radio, RadioGroup } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { RadioButtonBase } from "@/components/base/radio-buttons/radio-buttons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";
import { FACEBOOK_PAGES } from "./socials-data";

const modalClass = "rounded-xl shadow-2xl sm:rounded-xl";

interface FacebookPageDialogProps {
    isOpen: boolean;
    icon: string;
    defaultPageId: string;
    onCancel: () => void;
    onConnect: (pageId: string) => void;
}

/** Figma 8933:14872 — "Choose a Facebook Page". */
export const FacebookPageDialog = ({ isOpen, icon, defaultPageId, onCancel, onConnect }: FacebookPageDialogProps) => {
    const [pageId, setPageId] = useState(defaultPageId);

    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && onCancel()} isDismissable>
            <Modal className={cx(modalClass, "max-w-[440px]")}>
                <Dialog aria-label="Choose a Facebook Page" className="flex flex-col gap-5 p-6">
                    <Heading slot="title" className="text-lg leading-[1.45] font-semibold text-primary">
                        Choose a Facebook Page
                    </Heading>
                    <RadioGroup aria-label="Facebook Page" value={pageId} onChange={setPageId} className="flex flex-col gap-3">
                        {FACEBOOK_PAGES.map((page) => (
                            <Radio
                                key={page.id}
                                value={page.id}
                                className={({ isSelected }) =>
                                    cx(
                                        "flex cursor-pointer items-center gap-3 rounded-[10px] p-3.5 outline-hidden",
                                        isSelected ? "ring-[1.5px] ring-fg-primary ring-inset" : "ring-1 ring-secondary ring-inset",
                                    )
                                }
                            >
                                {({ isSelected, isFocusVisible }) => (
                                    <>
                                        <img src={icon} alt="" className="size-7 shrink-0" />
                                        <div className="flex min-w-0 flex-1 flex-col text-sm leading-[1.45] whitespace-nowrap">
                                            <p className="font-medium text-primary">{page.name}</p>
                                            <p className="text-tertiary">{page.audience}</p>
                                        </div>
                                        <RadioButtonBase
                                            isSelected={isSelected}
                                            isFocusVisible={isFocusVisible}
                                            // Figma radio fill is #51525c; the app's bg-brand-solid is pure black.
                                            className={cx(isSelected && "bg-[#51525c] ring-[#51525c]")}
                                        />
                                    </>
                                )}
                            </Radio>
                        ))}
                    </RadioGroup>
                    <div className="flex gap-3">
                        <Button color="secondary" size="lg" className="flex-1" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button size="lg" className="flex-1" onClick={() => onConnect(pageId)}>
                            Connect
                        </Button>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};

interface DisconnectDialogProps {
    isOpen: boolean;
    platformName: string;
    handle?: string;
    onCancel: () => void;
    onDisconnect: () => void;
}

/** Figma 8933:16282 — "Disconnect {platform}?" confirmation. */
export const DisconnectDialog = ({ isOpen, platformName, handle, onCancel, onDisconnect }: DisconnectDialogProps) => (
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && onCancel()} isDismissable>
        <Modal className={cx(modalClass, "max-w-[400px]")}>
            <Dialog role="alertdialog" aria-label={`Disconnect ${platformName}?`} className="flex flex-col gap-5 p-6">
                <FeaturedIcon icon={AlertTriangle} color="warning" theme="light" size="lg" />
                <div className="flex flex-col gap-1 leading-[1.45]">
                    <Heading slot="title" className="text-lg font-semibold text-primary">
                        Disconnect {platformName}?
                    </Heading>
                    <p className="text-sm text-tertiary">Scheduled posts to {handle ?? platformName} will stop.</p>
                </div>
                <div className="flex gap-3">
                    <Button color="secondary" size="lg" className="flex-1" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button size="lg" className="flex-1" onClick={onDisconnect}>
                        Disconnect
                    </Button>
                </div>
            </Dialog>
        </Modal>
    </ModalOverlay>
);
