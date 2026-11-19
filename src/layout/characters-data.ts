/** Prototype data for the Characters workspace (Figma "B-42 · Import ambassadors from Characters"). */

export const GRADIENTS = [
    "linear-gradient(135deg, #f78a1d 0%, #ec4899 100%)",
    "linear-gradient(135deg, #16a870 0%, #0b5f2e 100%)",
    "linear-gradient(135deg, #6a5cff 0%, #2e90fa 100%)",
    "linear-gradient(135deg, #ef4a2a 0%, #f79009 100%)",
    "linear-gradient(135deg, #2e90fa 0%, #16b364 100%)",
    "linear-gradient(135deg, #2e90fa 0%, #7a5af8 100%)",
    "linear-gradient(135deg, #3b4458 0%, #181d27 100%)",
];
const GREY = "linear-gradient(135deg, #a4a7ae 0%, #858b95 100%)";

export const initialsOf = (name: string) =>
    name
        .replace(/^(mr|mrs|ms|dr)\.?\s+/i, (m) => m)
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");

/** A stable gradient per name, so a person keeps the same colours everywhere. */
export const gradientFor = (name: string) => GRADIENTS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % GRADIENTS.length];

export interface Character {
    id: string;
    name: string;
    /** Initials shown in the tile. */
    initials: string;
    gradient: string;
    /** One line on the import card. */
    short: string;
    /** Longer description once added as an ambassador. */
    bio: string;
    /** How many ads already use this character. */
    usedIn: number;
    /** Already an ambassador somewhere, so it can't be picked again. */
    taken?: boolean;
}

export const CHARACTERS: Character[] = [
    { id: "dadi-kamla", name: "Dadi Kamla", initials: "DK", gradient: GRADIENTS[0], short: "Grandmother, warm storyteller", bio: "Grandmother who tells the story of the stone chakki. Hindi, slow and warm.", usedIn: 12 },
    { id: "raghav", name: "Raghav", initials: "R", gradient: GRADIENTS[1], short: "Young farmer, plain-spoken", bio: "Young farmer from Sikar. Shows where the wheat comes from.", usedIn: 5 },
    { id: "chef-anaya", name: "Chef Anaya", initials: "CA", gradient: GRADIENTS[2], short: "Modern home chef", bio: "Modern home chef who cooks quick weeknight meals. Warm, practical, never fussy.", usedIn: 3 },
    { id: "mr-bansal", name: "Mr. Bansal", initials: "MB", gradient: GRADIENTS[3], short: "Kirana shop owner", bio: "Kirana shop owner who knows every customer by name. Dry humour, straight talk.", usedIn: 8 },
    { id: "priya", name: "Priya", initials: "P", gradient: GRADIENTS[4], short: "Fitness coach", bio: "Fitness coach who keeps it simple: real food, steady habits, no crash diets.", usedIn: 0 },
    { id: "narrator-ji", name: "Narrator Ji", initials: "NJ", gradient: GREY, short: "Already an ambassador", bio: "Calm voice-over narrator for brand films.", usedIn: 0, taken: true },
];
