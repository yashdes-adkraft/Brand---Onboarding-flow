import { useState } from "react";
import { Dropper, Plus } from "@untitledui/icons";
import {
    Button as AriaButton,
    Dialog as AriaDialog,
    DialogTrigger as AriaDialogTrigger,
    Popover as AriaPopover,
    ColorArea,
    ColorSlider,
    ColorSwatch,
    ColorThumb,
    Heading,
    SliderTrack,
    parseColor,
} from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Tag, TagGroup, TagList } from "@/components/base/tags/tags";
import { cx } from "@/utils/cx";
import { COLOUR_TRAY, WEBSITE_COLOURS } from "./edit-store";
import { BRAND } from "./review-data";

const HEX = /^#?[0-9a-f]{6}$/i;
const toHex = (value: string) => "#" + value.replace("#", "").toUpperCase();

const ColourDot = ({ hex }: { hex: string }) => (
    <span aria-hidden className="size-2 shrink-0 rounded-full ring-1 ring-black/10 ring-inset" style={{ backgroundColor: hex }} />
);

/** Figma "Popover/Colour picker" (8911:31405): area, hue slider, hex row, colour tray, website colours, Cancel / Add. */
const ColourPicker = ({ onAdd, close }: { onAdd: (hex: string) => void; close: () => void }) => {
    const [color, setColor] = useState(() => parseColor(WEBSITE_COLOURS[0]).toFormat("hsb"));
    const [hexText, setHexText] = useState(WEBSITE_COLOURS[0]);

    const pick = (hex: string) => {
        setColor(parseColor(hex).toFormat("hsb"));
        setHexText(toHex(hex));
    };
    const hexValid = HEX.test(hexText);
    const canDrop = typeof window !== "undefined" && "EyeDropper" in window;

    return (
        <div className="flex w-[322px] flex-col items-start gap-3.5 p-4">
            <Heading slot="title" className="text-sm leading-[1.45] font-semibold text-primary">
                Add colour
            </Heading>

            <ColorArea
                aria-label="Saturation and brightness"
                value={color}
                onChange={(c) => {
                    setColor(c);
                    setHexText(c.toString("hex").toUpperCase());
                }}
                xChannel="saturation"
                yChannel="brightness"
                className="h-40 w-[288px] rounded-lg"
            >
                <ColorThumb className="size-4 rounded-full border-2 border-white shadow-md data-focus-visible:size-5" />
            </ColorArea>

            <ColorSlider
                aria-label="Hue"
                channel="hue"
                value={color}
                onChange={(c) => {
                    setColor(c);
                    setHexText(c.toString("hex").toUpperCase());
                }}
                className="w-[288px]"
            >
                <SliderTrack className="h-2 w-full rounded-full">
                    <ColorThumb className="top-1 size-[18px] rounded-full border-2 border-white shadow-md data-focus-visible:ring-2 data-focus-visible:ring-focus-ring" />
                </SliderTrack>
            </ColorSlider>

            <div className="flex w-full items-center gap-2">
                <Button
                    color="secondary"
                    size="sm"
                    iconLeading={Dropper}
                    aria-label="Pick a colour from the screen"
                    isDisabled={!canDrop}
                    onClick={async () => {
                        try {
                            // EyeDropper API (Chromium); the button is disabled elsewhere.
                            const result = await new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper().open();
                            pick(result.sRGBHex);
                        } catch {
                            /* cancelled */
                        }
                    }}
                />
                <Input
                    aria-label="Hex colour"
                    size="sm"
                    className="flex-1"
                    value={hexText}
                    isInvalid={!hexValid}
                    onChange={(v) => {
                        setHexText(v.toUpperCase());
                        if (HEX.test(v)) setColor(parseColor(toHex(v)).toFormat("hsb"));
                    }}
                />
                <ColorSwatch color={color} aria-hidden className="size-6 shrink-0 rounded-full ring-1 ring-black/10 ring-inset" />
            </div>

            <div className="flex w-full flex-col gap-2">
                <p className="text-xs leading-[1.45] font-medium text-tertiary">Colour tray</p>
                <div className="flex w-[288px] flex-wrap gap-x-3.5 gap-y-3">
                    {COLOUR_TRAY.map((hex) => (
                        <AriaButton
                            key={hex}
                            aria-label={hex}
                            onPress={() => pick(hex)}
                            className={({ isFocusVisible }) =>
                                cx(
                                    "size-9 cursor-pointer rounded-lg border border-secondary outline-focus-ring",
                                    isFocusVisible && "outline-2 outline-offset-2",
                                    toHex(color.toString("hex")) === hex && "ring-2 ring-fg-primary ring-offset-2",
                                )
                            }
                            style={{ backgroundColor: hex }}
                        />
                    ))}
                </div>
            </div>

            <div className="h-px w-full bg-border-secondary" />

            <div className="flex flex-col gap-2">
                <p className="text-xs leading-[1.45] font-medium text-tertiary">From {BRAND.domain}</p>
                <div className="flex gap-1.5">
                    {WEBSITE_COLOURS.map((hex) => (
                        <AriaButton
                            key={hex}
                            onPress={() => pick(hex)}
                            className="flex cursor-pointer items-center gap-[5px] rounded-md bg-primary py-0.5 pr-[9px] pl-[7px] text-sm font-medium text-secondary ring-1 ring-primary outline-focus-ring ring-inset hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            <ColourDot hex={hex} />
                            {hex}
                        </AriaButton>
                    ))}
                </div>
            </div>

            <div className="flex w-full justify-end gap-2">
                <Button color="secondary" size="sm" onClick={close}>
                    Cancel
                </Button>
                <Button
                    size="sm"
                    isDisabled={!hexValid}
                    onClick={() => {
                        onAdd(toHex(hexText));
                        close();
                    }}
                >
                    Add
                </Button>
            </div>
        </div>
    );
};

/** Colours row in brand edit mode: removable hex tags + "Add colour" popover. */
export const ColourEditor = ({ values, onChange }: { values: string[]; onChange: (values: string[]) => void }) => (
    <div className="flex flex-wrap items-center gap-2 pt-1.5">
        {values.length > 0 && (
            <TagGroup label="Colours" size="md" className="contents" onRemove={(keys) => onChange(values.filter((v) => !keys.has(v)))}>
                <TagList className="contents">
                    {values.map((hex) => (
                        <Tag key={hex} id={hex}>
                            <span className="flex items-center gap-[5px]">
                                <ColourDot hex={hex} />
                                {hex}
                            </span>
                        </Tag>
                    ))}
                </TagList>
            </TagGroup>
        )}
        <AriaDialogTrigger>
            <Button color="secondary" size="sm" iconLeading={Plus} aria-label="Add colour" />
            <AriaPopover
                placement="top end"
                offset={8}
                className="rounded-xl border border-secondary bg-primary shadow-lg outline-hidden duration-150 ease-out entering:animate-in entering:fade-in"
            >
                <AriaDialog aria-label="Add colour" className="outline-hidden">
                    {({ close }) => <ColourPicker close={close} onAdd={(hex) => !values.includes(hex) && onChange([...values, hex])} />}
                </AriaDialog>
            </AriaPopover>
        </AriaDialogTrigger>
    </div>
);
