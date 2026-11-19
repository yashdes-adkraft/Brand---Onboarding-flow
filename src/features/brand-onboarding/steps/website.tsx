import { useEffect, useState } from "react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { InputBase } from "@/components/base/input/input";
import { InputGroup, InputPrefix } from "@/components/base/input/input-group";
import { cx } from "@/utils/cx";
import credits from "@/assets/credits.png";
import { BeamLap } from "../beam-lap";
import type { StepDefinition, StepProps } from "../flow";

/** Strips scheme and trailing slashes: "https://aftershoot.com/" -> "aftershoot.com" */
export const normalizeDomain = (raw: string) =>
    raw
        .trim()
        .replace(/^https?:\/\//i, "")
        .replace(/\/+$/, "");

export const isValidDomain = (raw: string) => /^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(normalizeDomain(raw));

/** One full trip of the beam around the field. The short delay lets the modal finish fading in first. */
const BEAM_LAP_S = 5;
const BEAM_DELAY_MS = 400;

const CREDITS_COST = 40;
const CREDITS_BALANCE = 2000;

/** Figma "Onboarding 1" (66:2225) — step 1, the client's website. */
const WebsiteStep = ({ draft, update, next, notify }: StepProps) => {
    const [url, setUrl] = useState(draft.website);
    const [error, setError] = useState<string>();
    const [isSubmitting, setSubmitting] = useState(false);
    // The beam runs one lap when the screen opens, then stays off — and any click or focus in the field stops it for good.
    const [beam, setBeam] = useState<"wait" | "run" | "done">("wait");
    useEffect(() => {
        const start = setTimeout(() => setBeam((b) => (b === "wait" ? "run" : b)), BEAM_DELAY_MS);
        const end = setTimeout(() => setBeam("done"), BEAM_DELAY_MS + BEAM_LAP_S * 1000);
        return () => {
            clearTimeout(start);
            clearTimeout(end);
        };
    }, []);

    const submit = async () => {
        if (!isValidDomain(url)) {
            setError(url.trim() ? "That doesn’t look like a website. Try something like aftershoot.com" : "Enter the client’s website to start research.");
            return;
        }
        setError(undefined);
        setSubmitting(true);
        try {
            update({ website: normalizeDomain(url) });
            // Prototype: research kicks off in the background; the intake questions continue meanwhile.
            await new Promise((r) => setTimeout(r, 900));
            next();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Body */}
            <div className="absolute top-[calc(50%+0.5px)] left-1/2 flex w-max max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6">
                <div className="flex h-[76px] flex-col items-center gap-2 text-center font-medium">
                    <Heading slot="title" className="font-display text-[30px] leading-[44px] tracking-[-0.6px] text-primary">
                        What's the client's website?
                    </Heading>
                    <p className="text-sm text-secondary">AdKraft reads the client's website and setup the brand identity.</p>
                </div>

                <form
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                    className="flex flex-col gap-1.5"
                >
                    <div className="flex items-end gap-3 max-sm:flex-col max-sm:items-stretch">
                        {/* One lap on landing; a click or focus in the field stops it for good. */}
                        <BeamLap
                            active={beam === "run"}
                            lapSeconds={BEAM_LAP_S}
                            radius={8}
                            className="max-w-full"
                            onPointerDown={() => setBeam("done")}
                            onFocus={() => setBeam("done")}
                        >
                            <InputGroup
                                aria-label="Client website"
                                size="lg"
                                className="w-[460px] max-w-full"
                                leadingAddon={<InputPrefix>https://</InputPrefix>}
                                value={url}
                                onChange={(v) => {
                                    // Pasted URLs drop their scheme — the add-on already shows https://
                                    setUrl(v.replace(/^https?:\/\//i, ""));
                                    setError(undefined);
                                }}
                                isInvalid={!!error}
                                isDisabled={isSubmitting}
                            >
                                <InputBase
                                    placeholder="aftershoot.com"
                                    inputMode="url"
                                    autoComplete="url"
                                    spellCheck={false}
                                    inputClassName="font-medium placeholder:font-normal"
                                />
                            </InputGroup>
                        </BeamLap>
                        <Button
                            type="submit"
                            size="lg"
                            isLoading={isSubmitting}
                            showTextWhileLoading
                            iconLeading={<img src={credits} alt="" data-icon="leading" className={cx("size-5 shrink-0", isSubmitting && "hidden")} />}
                        >
                            {isSubmitting ? "Starting research…" : "Start research"}
                        </Button>
                    </div>
                    {error && (
                        <p role="alert" className="text-sm text-error-primary">
                            {error}
                        </p>
                    )}
                </form>

                <div aria-hidden className="flex w-[400px] max-w-full items-center gap-2">
                    <span className="h-px flex-1 bg-border-secondary" />
                    <span className="text-sm font-medium text-tertiary">or</span>
                    <span className="h-px flex-1 bg-border-secondary" />
                </div>

                {/* Figma: link button, text-quaternary, always underlined */}
                <Button color="link-gray" size="sm" onClick={() => notify("Manual setup isn’t in this prototype yet.")} className="text-quaternary *:data-text:decoration-current hover:text-tertiary">
                    Set up manually
                </Button>
            </div>

            {/* Credits footnote */}
            <div className="absolute top-[694px] left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap">
                <img src={credits} alt="" className="size-7" />
                <p className="text-xs font-medium text-tertiary opacity-70">
                    Research uses about {CREDITS_COST} credits out of {CREDITS_BALANCE.toLocaleString("en-US")}
                </p>
            </div>
        </>
    );
};

export const websiteStep: StepDefinition = {
    id: "website",
    ariaLabel: "New brand: client website",
    phase: 0,
    phaseFill: 29 / 192,
    glow: "center",
    Component: WebsiteStep,
};
