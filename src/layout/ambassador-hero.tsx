import type { FC, ReactNode } from "react";

/**
 * The modal's header art. Brand colours (blue, mauve, pink, a touch of orange) as soft blurred waves over a light base,
 * a film grain on top, and a light mist at the top edge — the light-mode take on a dark glass-and-gradient banner.
 * The waves drift slowly; reduced-motion users get them still.
 */
/** Where the floating logos sit, as percentages of the banner, with a slight tilt each. */
const FLOAT_SPOTS = [
    { x: 13, y: 30, r: -8 },
    { x: 26, y: 70, r: 6 },
    { x: 35, y: 16, r: -4 },
    { x: 87, y: 32, r: 8 },
    { x: 74, y: 70, r: -6 },
    { x: 65, y: 16, r: 4 },
];

export const AmbassadorHero = ({
    icon: Icon,
    logos = [],
    tiles = [],
}: {
    icon: FC<{ className?: string }>;
    /** Logo images that float around the badge (up to six). */
    logos?: string[];
    /** Or any small graphics (icons) to float in white tiles instead of logos. */
    tiles?: ReactNode[];
}) => (
    <div aria-hidden className="relative h-[176px] w-full overflow-hidden bg-[#f5f3ff]">
        <svg className="absolute inset-0 size-full" viewBox="0 0 560 176" preserveAspectRatio="xMidYMid slice">
            <defs>
                <filter id="amb-blur" x="-30%" y="-60%" width="160%" height="220%">
                    <feGaussianBlur stdDeviation="26" />
                </filter>
                <filter id="amb-grain" x="0" y="0" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <linearGradient id="amb-mist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.8" />
                    <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
            </defs>
            <g filter="url(#amb-blur)">
                <path className="amb-drift-a" d="M-60 120 C 60 40, 170 60, 260 110 S 430 170, 620 90 L 620 220 L -60 220 Z" fill="#5b8cff" />
                <path className="amb-drift-b" d="M-40 170 C 90 110, 200 150, 300 150 S 470 100, 620 140 L 620 230 L -40 230 Z" fill="#f57489" />
                <ellipse className="amb-drift-a" cx="60" cy="170" rx="110" ry="46" fill="#ff9a5c" />
                <ellipse className="amb-drift-b" cx="470" cy="60" rx="120" ry="52" fill="#9b8cff" fillOpacity="0.9" />
            </g>
            <rect width="560" height="176" fill="url(#amb-mist)" />
            <rect width="560" height="176" filter="url(#amb-grain)" opacity="0.16" style={{ mixBlendMode: "soft-light" }} />
        </svg>

        {[...logos.map((src) => <img key={src} src={src} alt="" className="size-full object-contain" />), ...tiles].slice(0, FLOAT_SPOTS.length).map((node, i) => (
            <span
                key={i}
                className="amb-float absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-white/70 bg-white p-2.5 shadow-[0_8px_24px_rgba(60,70,140,0.25)]"
                style={{ left: `${FLOAT_SPOTS[i].x}%`, top: `${FLOAT_SPOTS[i].y}%`, rotate: `${FLOAT_SPOTS[i].r}deg`, animationDelay: `${i * -0.9}s` }}
            >
                {node}
            </span>
        ))}

        {/* Glass badge: the ambassador mark with two echoes behind it */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="absolute -top-5 left-1/2 size-[104px] -translate-x-1/2 rounded-[30px] border border-white/55" />
            <span className="absolute -top-2.5 left-1/2 size-[92px] -translate-x-1/2 rounded-[28px] border border-white/75" />
            <span className="relative flex size-20 items-center justify-center rounded-[26px] border border-white/80 bg-white/20 shadow-[0_8px_32px_rgba(91,140,255,0.35),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md">
                <Icon className="size-9 text-white drop-shadow-[0_2px_6px_rgba(60,70,140,0.45)]" />
            </span>
        </div>
    </div>
);

