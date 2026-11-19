import { type ReactNode, useState } from "react";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { type SocialPlatform, accountFor } from "./review-data";
import { PLATFORM_OPTIONS } from "./socials-data";

/** One stable icon component per platform (the Select and Input take component references, not elements). */
const PLATFORM_ICONS = Object.fromEntries(
    PLATFORM_OPTIONS.map(({ id }) => [id, ({ className }: { className?: string }) => <img src={accountFor(id).icon} alt="" className={className} />]),
) as Record<SocialPlatform, (props: { className?: string }) => ReactNode>;

interface AddHandlePopoverProps {
    /** The pressable trigger (Untitled UI Button). */
    children: ReactNode;
    defaultPlatform: SocialPlatform;
    defaultHandle?: string;
    placement?: "top end" | "bottom end";
    onAdd: (platform: SocialPlatform, handle: string) => void;
}

/** Figma 8933:12625 "Add handle" — Platform select + Handle input + Cancel / Add, anchored to its trigger. */
export const AddHandlePopover = ({ children, defaultPlatform, defaultHandle = "", placement = "top end", onAdd }: AddHandlePopoverProps) => {
    const [isOpen, setOpen] = useState(false);
    const [platform, setPlatform] = useState<SocialPlatform>(defaultPlatform);
    const [handle, setHandle] = useState(defaultHandle);

    const onOpenChange = (open: boolean) => {
        if (open) {
            setPlatform(defaultPlatform);
            setHandle(defaultHandle);
        }
        setOpen(open);
    };

    const canAdd = handle.trim().length > 0;
    const submit = () => {
        if (!canAdd) return;
        onAdd(platform, handle.trim());
        setOpen(false);
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            {children}
            <Popover
                placement={placement}
                offset={8}
                className="w-80 rounded-xl border border-secondary bg-primary shadow-lg outline-hidden entering:duration-150 entering:animate-in entering:fade-in entering:zoom-in-95 exiting:duration-100 exiting:animate-out exiting:fade-out"
            >
                <Dialog aria-label="Add handle" className="outline-hidden">
                    <form
                        className="flex flex-col gap-4 p-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            submit();
                        }}
                    >
                        <Select
                            label="Platform"
                            size="lg"
                            icon={PLATFORM_ICONS[platform]}
                            items={PLATFORM_OPTIONS}
                            selectedKey={platform}
                            onSelectionChange={(key) => key && setPlatform(key as SocialPlatform)}
                        >
                            {(item) => <Select.Item id={item.id} label={item.label} icon={PLATFORM_ICONS[item.id as SocialPlatform]} />}
                        </Select>
                        <Input label="Handle" size="lg" icon={PLATFORM_ICONS[platform]} value={handle} onChange={setHandle} autoFocus />
                        <div className="flex justify-end gap-2">
                            <Button color="secondary" size="sm" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" isDisabled={!canAdd}>
                                Add
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </Popover>
        </DialogTrigger>
    );
};
