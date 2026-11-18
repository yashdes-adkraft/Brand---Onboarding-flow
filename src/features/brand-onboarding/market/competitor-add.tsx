import { useId, useRef, useState } from "react";
import { Plus } from "@untitledui/icons";
import loadingCircle from "@/assets/market/c-loading-circle.svg";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";
import { isValidWebsite, marketActions, suggestCompetitors } from "./market-store";

/** Figma "Competitors · 04 · Finding" row (8940:12926): skeleton logo + meta, website as the title, spinner. */
export const FindingRow = ({ website }: { website: string }) => (
    <div
        role="status"
        aria-label={`Finding ${website}`}
        className="relative flex h-18 w-full shrink-0 items-center gap-3.5 border-b border-secondary px-5 last:border-b-0"
    >
        <span className="size-10 shrink-0 rounded-[10px] bg-tertiary" />
        <span className="flex min-w-px flex-1 flex-col items-start gap-2">
            <span className="truncate text-sm font-medium text-primary">{website}</span>
            <span className="h-2.5 w-30 rounded-[5px] bg-tertiary" />
        </span>
        <img src={loadingCircle} alt="" className="size-5 shrink-0 animate-spin" />
    </div>
);

interface CompetitorAddProps {
    addLabel: string;
    placeholder: string;
}

/**
 * Figma "Competitors · 03 · Add" → "04 · Finding" → "05 · Added", with "06 · Error" for an invalid website.
 * The link button turns into an input; typing shows matching suggestions (Menu 8940:12565); Enter or picking a
 * suggestion starts the lookup, which appears as a Finding row in the list and resolves into a kept competitor.
 */
export const CompetitorAdd = ({ addLabel, placeholder }: CompetitorAddProps) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [error, setError] = useState(false);
    const menuId = useId();
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const suggestions = error ? [] : suggestCompetitors(value);

    const close = () => {
        setOpen(false);
        setValue("");
        setError(false);
    };

    const submit = (website: string) => {
        if (!isValidWebsite(website)) {
            setError(true);
            return;
        }
        marketActions.lookupCompetitor(website);
        close();
    };

    if (!open) {
        return (
            <Button color="link-gray" size="sm" iconLeading={Plus} className="gap-1.5" onClick={() => setOpen(true)}>
                {addLabel}
            </Button>
        );
    }

    return (
        <form
            className="relative w-full"
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                if (value.trim()) submit(value);
            }}
            onKeyDown={(e) => {
                // Suggestion buttons (the input's own keydown is handled below; React Aria stops its propagation).
                if (e.key === "Escape") {
                    e.stopPropagation();
                    close();
                }
            }}
            onBlur={(e) => {
                // Collapse back to the link when focus leaves the add area with nothing typed.
                if (!e.currentTarget.contains(e.relatedTarget as Node | null) && !value.trim()) close();
            }}
        >
            <Input
                ref={inputRef}
                autoFocus
                size="lg"
                aria-label={addLabel}
                placeholder={placeholder}
                value={value}
                onChange={(v) => {
                    setValue(v);
                    setError(false);
                }}
                isInvalid={error}
                hint={error ? <span role="alert">Enter a valid website</span> : undefined}
                aria-controls={suggestions.length ? menuId : undefined}
                onKeyDown={(e) => {
                    if (e.key === "Escape") close();
                    if (e.key === "ArrowDown" && suggestions.length) {
                        e.preventDefault();
                        optionRefs.current[0]?.focus();
                    }
                }}
            />

            {suggestions.length > 0 && (
                <div
                    id={menuId}
                    role="listbox"
                    aria-label="Suggestions"
                    className="absolute top-full left-0 z-20 mt-1.5 flex w-full flex-col rounded-lg border border-secondary bg-primary p-1 shadow-lg"
                >
                    {suggestions.map((s, i) => (
                        <button
                            key={s.website}
                            ref={(el) => {
                                optionRefs.current[i] = el;
                            }}
                            type="button"
                            role="option"
                            aria-selected={i === 0}
                            onClick={() => submit(s.website)}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowDown") optionRefs.current[i + 1]?.focus();
                                if (e.key === "ArrowUp") (optionRefs.current[i - 1] ?? inputRef.current)?.focus();
                                if (e.key === "ArrowDown" || e.key === "ArrowUp") e.preventDefault();
                            }}
                            className={cx(
                                "flex w-full cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm outline-hidden hover:bg-secondary focus-visible:bg-secondary",
                                // Figma shows the top match highlighted.
                                i === 0 && "bg-secondary",
                            )}
                        >
                            {s.logo && <img src={s.logo} alt="" className="size-8 shrink-0" />}
                            <span className="flex items-center gap-2 whitespace-nowrap">
                                <span className="font-medium text-primary">{s.name}</span>
                                <span className="text-tertiary">{s.website}</span>
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </form>
    );
};
