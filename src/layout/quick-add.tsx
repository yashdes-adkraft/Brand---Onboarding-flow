import { type ReactNode, useState } from "react";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";

interface QuickAddProps {
    /** The pressable trigger (an Untitled UI Button). */
    children: ReactNode;
    label: string;
    placeholder?: string;
    onAdd: (value: string) => void;
}

/** A small popover with one text field and Cancel / Add, anchored to its trigger. */
export const QuickAdd = ({ children, label, placeholder, onAdd }: QuickAddProps) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const submit = () => {
        if (!value.trim()) return;
        onAdd(value.trim());
        setValue("");
        setOpen(false);
    };
    return (
        <DialogTrigger isOpen={open} onOpenChange={setOpen}>
            {children}
            <Popover
                placement="bottom end"
                offset={8}
                className="w-80 rounded-xl border border-secondary bg-primary shadow-lg outline-hidden entering:duration-150 entering:animate-in entering:fade-in entering:zoom-in-95 exiting:duration-100 exiting:animate-out exiting:fade-out"
            >
                <Dialog aria-label={label} className="outline-hidden">
                    <form
                        className="flex flex-col gap-4 p-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            submit();
                        }}
                    >
                        <Input label={label} size="md" value={value} onChange={setValue} placeholder={placeholder} autoFocus />
                        <div className="flex justify-end gap-2">
                            <Button type="button" color="secondary" size="sm" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" isDisabled={!value.trim()}>
                                Add
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </Popover>
        </DialogTrigger>
    );
};
