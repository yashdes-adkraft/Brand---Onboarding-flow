/** Prototype content for the Identity section (sample copy for Aftershoot) and its helpers. */

export type IdentityTab = "presence" | "voice" | "palette" | "dos" | "motifs" | "guardrails";

export const IDENTITY_TABS: { id: IdentityTab; label: string; blurb: string }[] = [
    { id: "presence", label: "Online presence", blurb: "Where {brand} lives online. Research and perception read these links." },
    { id: "voice", label: "Voice & tone", blurb: "How {brand} sounds in every script, caption and voice-over." },
    { id: "palette", label: "Colour palette", blurb: "Colours the AI uses for captions, end cards and motion graphics." },
    { id: "dos", label: "Do’s & Don’ts", blurb: "The rules every ad is checked against before it is made." },
    { id: "motifs", label: "Recurring motifs", blurb: "Visual signatures the AI repeats so every ad feels like {brand}." },
    { id: "guardrails", label: "Guardrails", blurb: "Hard limits. A script that breaks one is stopped before it renders." },
];

export const DEFAULT_VOICE = {
    brand: "Plain, confident talk from a photographer who has lived in the edit: fast results, no jargon, no hype.",
    tone: "Warm, matter-of-fact, a little proud of the craft. Short sentences. English only, with the occasional photographer’s shorthand.",
};
export const DEFAULT_KEYWORDS = ["fast", "AI-edited", "culling", "presets", "delivery", "no hype"];

export type ColourRole = "Primary" | "Secondary" | "Accent" | "Background" | "Text";
export interface BrandColour {
    id: string;
    name: string;
    hex: string;
    role: ColourRole;
}
/** Read from the Aftershoot logo. */
export const DEFAULT_COLOURS: BrandColour[] = [
    { id: "blue", name: "Studio blue", hex: "#307EC4", role: "Primary" },
    { id: "orange", name: "Sunset orange", hex: "#EA712F", role: "Secondary" },
    { id: "green", name: "Proof green", hex: "#27AD5C", role: "Accent" },
    { id: "cream", name: "Album cream", hex: "#F5F2EB", role: "Background" },
];

const ROLES: ColourRole[] = ["Primary", "Secondary", "Accent", "Background"];
/** The brand's palette: colours typed in by hand when there are any, otherwise the Aftershoot logo colours. */
export const coloursFor = (hex?: string[]): BrandColour[] =>
    hex?.length ? hex.map((h, i) => ({ id: `c${i}`, name: `Colour ${i + 1}`, hex: h.toUpperCase(), role: ROLES[i] ?? "Accent" })) : DEFAULT_COLOURS;

export const DEFAULT_DOS = ["Show the before and after side by side", "Lead with the hours saved", "Use real wedding and portrait work", "Keep captions under ten words"];
export const DEFAULT_DONTS = ["No jargon about models", "No “magic” claims", "No stock photos of cameras", "No generic festival greetings"];

export interface Motif {
    id: string;
    name: string;
    description: string;
    seen: number;
    /** The picture on the card: a CSS background, made here instead of a photo. */
    art: string;
}
const grid = "repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 28px)";
export const DEFAULT_MOTIFS: Motif[] = [
    { id: "ba", name: "Before and after", description: "A split frame: the flat shot on the left, the finished edit on the right.", seen: 9, art: "linear-gradient(90deg, #6b6f78 0 50%, transparent 50%), linear-gradient(135deg, #f2a65a 0%, #ea712f 45%, #307ec4 100%)" },
    { id: "cull", name: "Culling grid", description: "A wall of frames with the keepers lighting up one by one.", seen: 6, art: `${grid}, linear-gradient(135deg, #1f2a44 0%, #307ec4 100%)` },
    { id: "proof", name: "Album proof", description: "A finished album spread on a table, shown in the last 2 seconds.", seen: 5, art: "linear-gradient(135deg, #f5f2eb 0%, #e3d6bf 55%, #c9b58f 100%)" },
    { id: "gold", name: "Golden hour", description: "Warm backlit portraits, used as an opener and never as an ending.", seen: 3, art: "linear-gradient(160deg, #ffd9a0 0%, #ea712f 55%, #8a3b12 100%)" },
];

export type Severity = "Blocks render" | "Warns";
export interface Guardrail {
    id: string;
    text: string;
    category: string;
    severity: Severity;
}
export const DEFAULT_GUARDRAILS: Guardrail[] = [
    { id: "g1", text: "No guaranteed turnaround times in any ad", category: "Legal", severity: "Blocks render" },
    { id: "g2", text: "Show a signed release for any client face on screen", category: "Legal", severity: "Blocks render" },
    { id: "g3", text: "No comparison with named competitors", category: "Category", severity: "Warns" },
    { id: "g4", text: "Never use AI to change a real person’s likeness", category: "Safety", severity: "Blocks render" },
    { id: "g5", text: "No “cheaper than” or price-drop claims", category: "Brand", severity: "Warns" },
];

export const EVIDENCE = [
    { quote: "“Cut my culling from six hours to one.”", source: "Review · 5★" },
    { quote: "“Finally, edits that look like mine, not like a filter.”", source: "Instagram comment" },
    { quote: "Competitors lean on “revolutionary” and “magic” claims.", source: "Competitor research" },
];

/** WCAG contrast ratio of two #RRGGBB colours (1 to 21). */
export const contrast = (a: string, b: string) => {
    const lum = (hex: string) => {
        const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
        return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    };
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};
