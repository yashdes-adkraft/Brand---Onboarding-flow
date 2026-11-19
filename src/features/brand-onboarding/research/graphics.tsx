import type { CSSProperties, ReactNode } from "react";
import { type MotionStyle, motion, useReducedMotion } from "motion/react";
import { cx } from "@/utils/cx";
import avatar1 from "@/assets/research/avatar-1.png";
import avatar2 from "@/assets/research/avatar-2.png";
import avatar3 from "@/assets/research/avatar-3.png";
import avatarFinding from "@/assets/research/avatar-finding.png";
import averageLine from "@/assets/research/average-line.svg";
import logo from "@/assets/research/brewbloom-logo.png";
import clientEllipse from "@/assets/research/client-ellipse.svg";
import connectorAudience from "@/assets/research/connector-audience.svg";
import connectorGoal from "@/assets/research/connector-goal.svg";
import connectorProduct from "@/assets/research/connector-product.svg";
import connectorTone from "@/assets/research/connector-tone.svg";
import found from "@/assets/research/found.svg";
import halo from "@/assets/research/halo.svg";
import instagram from "@/assets/research/instagram.svg";
import lineDown from "@/assets/research/line-down.svg";
import lineLeft from "@/assets/research/line-left.svg";
import lineRight from "@/assets/research/line-right.svg";
import lineVBottom from "@/assets/research/line-v-bottom.svg";
import lineVTop from "@/assets/research/line-v-top.svg";
import linkedinGray from "@/assets/research/linkedin-gray.svg";
import logoBlueTokai from "@/assets/research/logo-blue-tokai.svg";
import logoRage from "@/assets/research/logo-rage.svg";
import logoSleepyOwl from "@/assets/research/logo-sleepy-owl.svg";
import logoThirdWave from "@/assets/research/logo-third-wave.svg";
import node from "@/assets/research/node.svg";
import photo1 from "@/assets/research/photo-1.png";
import photo2 from "@/assets/research/photo-2.png";
import photo3 from "@/assets/research/photo-3.png";
import radarSweep from "@/assets/research/radar-sweep.png";
import ring36 from "@/assets/research/ring-36.svg";
import ring64 from "@/assets/research/ring-64.svg";
import ring92 from "@/assets/research/ring-92.png";
import spinner from "@/assets/research/spinner.svg";
import tileBg from "@/assets/research/tile-bg.svg";
import tileFb from "@/assets/research/tile-fb.svg";
import tileTt from "@/assets/research/tile-tt.svg";
import tileYt from "@/assets/research/tile-yt.svg";
import xGray from "@/assets/research/x-gray.svg";

/*
 * The six research card artworks (438×206), one per Figma "AB-05 v8/v9 · Research · …" frame.
 * Positions are Figma's; rotated layers are placed at their unrotated box and rotated in CSS.
 *
 * Motion ("open → fill"): when a card opens, each layer pops in from 72% scale (the carousel's
 * "Open 0" state) one after another, then small loops (spinners, radar sweep, scan line, cursor) run.
 */

const POP_EASE = [0.22, 1, 0.36, 1] as const;

interface PopProps {
    /** Order in the fill sequence. */
    i: number;
    className?: string;
    style?: MotionStyle;
    children?: ReactNode;
}

/** One artwork layer: fades/scales in on open, staggered by `i`. */
const Pop = ({ i, className, style, children }: PopProps) => {
    const reduce = useReducedMotion();
    return (
        <motion.div
            className={cx("absolute", className)}
            style={style}
            initial={reduce ? false : { opacity: 0, scale: 0.72 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.2 + i * 0.12, ease: POP_EASE }}
        >
            {children}
        </motion.div>
    );
};

/** A plain image layer that does not take part in the pop sequence. */
const Img = ({ src, className, style }: { src: string; className?: string; style?: CSSProperties }) => (
    <img src={src} alt="" aria-hidden className={cx("absolute block max-w-none", className)} style={style} />
);

/** Green "found" check — Figma 14px box, exported with a 2px white ring (18px). */
const Found = ({ left, top }: { left: number; top: number }) => (
    <img src={found} alt="" aria-hidden className="absolute block size-[18px] max-w-none" style={{ left: left - 2, top: top - 2 }} />
);

/** Gradient arc spinner (Figma "Anim · Spinner"). */
const Spinner = ({ className, style }: { className?: string; style?: CSSProperties }) => {
    const reduce = useReducedMotion();
    return (
        <motion.img
            src={spinner}
            alt=""
            aria-hidden
            className={cx("absolute block max-w-none", className)}
            style={style}
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
        />
    );
};

const chipShadow = "[filter:drop-shadow(0px_6px_7px_rgba(10,13,18,0.05))_drop-shadow(0px_1px_1px_rgba(10,13,18,0.06))]";
const chip = cx("absolute top-0 left-0 flex items-center rounded-full border border-secondary bg-white", chipShadow);
const chipText = "text-xs font-medium whitespace-nowrap text-primary";

/** Figma "Brand kit graphic" (98:5688). */
export const BrandKitGraphic = () => (
    <>
        <Pop
            i={0}
            className="h-8 w-[196px] rounded-[10px]"
            style={{
                left: 10,
                top: 62,
                backgroundImage: "linear-gradient(90deg, #307ec4 0%, #ea712f 33.333%, #f5f2eb 66.667%, #27ad5c 100%)",
            }}
        />
        <Pop i={1} className="h-[42px] w-9 rounded-xl border-2 border-white drop-shadow-[0px_2px_3px_rgba(0,0,0,0.18)]" style={{ left: 64, top: 57 }} />
        <Pop i={2} className={cx("rounded-lg border border-secondary bg-white px-2.5 py-[5px]", chipShadow)} style={{ left: 50, top: 18 }}>
            <p className={chipText}>#EA712F</p>
        </Pop>
        <Pop i={3} className="flex gap-2" style={{ left: 10, top: 118 }}>
            {["#307ec4", "#ea712f", "#f5f2eb", "#27ad5c"].map((color, idx) => (
                <span key={color} className="relative size-8">
                    <span className="absolute inset-0 rounded-[9px] border border-black/8" style={{ backgroundColor: color }} />
                    {idx === 1 && <span className="absolute -top-1 -left-1 size-10 rounded-xl border-[1.5px] border-[#181d27]" />}
                </span>
            ))}
            <span className="relative size-8">
                <span className="absolute inset-0 rounded-[9px] border border-dashed border-primary bg-[#fafafa]" />
                <Spinner className="top-2 left-2 size-4" />
            </span>
        </Pop>
        <Pop i={4} className="size-11" style={{ left: 159.48, top: 6.41, rotate: -4 }}>
            <div className={cx("absolute inset-0 rounded-xl border border-secondary bg-white", chipShadow)}>
                <div className="absolute top-[5px] left-[5px] size-8 overflow-hidden rounded-lg">
                    <img src={logo} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
                </div>
            </div>
            <Found left={33} top={-4} />
        </Pop>
        <Pop
            i={5}
            className={cx("flex gap-0.5 rounded-[10px] border border-secondary bg-white p-[3px]", "shadow-[0px_6px_14px_-4px_rgba(10,13,18,0.05),0px_1px_2px_0px_rgba(10,13,18,0.06)]")}
            style={{ left: 254, top: 14 }}
        >
            <span className="rounded-[7px] bg-[#181d27] px-2.5 py-1 text-xs font-medium text-white">Fraunces</span>
            <span className="rounded-[7px] px-2.5 py-1 text-xs font-medium text-quaternary">Inter</span>
        </Pop>
        <Pop i={6} style={{ left: 254, top: 46 }}>
            <p
                className="text-[92px] leading-[100px] font-semibold whitespace-nowrap text-[#181d27]"
                style={{ fontFamily: "Fraunces, serif", fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
            >
                A<span className="text-[#ea712f]">a</span>
            </p>
        </Pop>
        <Pop i={7} className="h-[3px] w-[34px] rounded-[2px] bg-linear-to-r from-adkraft-blue via-adkraft-mauve to-adkraft-pink" style={{ left: 258, top: 150 }} />
        <Pop
            i={8}
            className={cx("flex gap-0.5 rounded-[10px] border border-secondary bg-white p-[3px]", "shadow-[0px_6px_14px_-4px_rgba(10,13,18,0.05),0px_1px_2px_0px_rgba(10,13,18,0.06)]")}
            style={{ left: 254, top: 166 }}
        >
            {["S", "M", "L", "XL"].map((size) => (
                <span key={size} className={cx("rounded-[7px] px-2.5 py-1 text-xs font-medium", size === "M" ? "bg-[#181d27] text-white" : "text-quaternary")}>
                    {size}
                </span>
            ))}
        </Pop>
    </>
);

/** Social tile: 40px white circle (exported with its shadow) + 20px platform icon. */
const SocialTile = ({ i, left, top, icon, tile, dim, found: isFound }: { i: number; left: number; top: number; icon?: string; tile?: string; dim?: boolean; found?: boolean }) => (
    <Pop i={i} className={cx("size-10", dim && "opacity-45")} style={{ left, top }}>
        <Img src={tile ?? tileBg} className="top-[-4px] left-[-8px] h-14 w-14" />
        {icon && <Img src={icon} className="top-2.5 left-2.5 size-5" />}
        {isFound && <Found left={28} top={-2} />}
    </Pop>
);

/** Figma "Socials graphic · Radar" (98:4995). */
export const SocialsGraphic = () => {
    const reduce = useReducedMotion();
    return (
        <>
            <Pop i={0} className="size-[184px]" style={{ left: 127, top: 11 }}>
                <motion.div
                    className="absolute inset-0"
                    animate={reduce ? undefined : { rotate: 360 }}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                >
                    <Img src={radarSweep} className="top-0 left-[92px] h-[92px] w-[89.11px]" />
                </motion.div>
                <Img src={ring92} className="inset-0 size-full" />
            </Pop>
            <Pop i={1} className="size-32" style={{ left: 155, top: 39 }}>
                <Img src={ring64} className="inset-0 size-full" />
            </Pop>
            <Pop i={2} className="size-[72px]" style={{ left: 183, top: 67 }}>
                <Img src={ring36} className="inset-0 size-full" />
            </Pop>
            <Pop i={3} className="size-14" style={{ left: 191, top: 75 }}>
                <Img src={clientEllipse} className="top-[-4px] left-[-8px] size-[72px]" />
                <div className="absolute top-[12px] left-[12px] size-8 overflow-hidden rounded-full">
                    <img src={logo} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
                </div>
            </Pop>
            <SocialTile i={4} left={118} top={40} tile={tileFb} />
            <SocialTile i={5} left={280} top={40} icon={instagram} found />
            <SocialTile i={6} left={139} top={105} tile={tileYt} />
            <SocialTile i={7} left={247} top={126} tile={tileTt} />
            <SocialTile i={8} left={199} top={-9} icon={xGray} dim />
            <SocialTile i={9} left={153} top={160} icon={linkedinGray} dim />
        </>
    );
};

const BARS = [
    { label: "18–24", left: 40, top: 108, height: 64, labelLeft: 48.5 },
    { label: "25–34", left: 118, top: 40, height: 132, labelLeft: 125, active: true },
    { label: "35–44", left: 196, top: 80, height: 92, labelLeft: 203 },
    { label: "45–54", left: 274, top: 122, height: 50, labelLeft: 281.5 },
    { label: "55+", left: 352, top: 142, height: 30, labelLeft: 365.5 },
];

/** Figma "Audience graphic" (98:5924). Bars grow up from the baseline. */
export const AudienceGraphic = () => {
    const reduce = useReducedMotion();
    return (
        <>
            <Img src={averageLine} className="top-[109.5px] left-[29px] h-px w-[380px]" />
            {BARS.map((bar, idx) => (
                <motion.div
                    key={bar.label}
                    className={cx(
                        "absolute w-12 origin-bottom rounded-t-[10px] rounded-b-[4px] bg-linear-to-b",
                        bar.active ? "from-adkraft-blue to-[rgba(245,116,137,0.85)]" : "from-[#e3e8f7] to-[rgba(243,244,246,0.4)]",
                    )}
                    style={{ left: bar.left, top: bar.top, height: bar.height }}
                    initial={reduce ? false : { scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 + idx * 0.1, ease: POP_EASE }}
                />
            ))}
            {BARS.map((bar) => (
                <p
                    key={bar.label}
                    className={cx("absolute top-[176px] text-[11px] leading-[17px] whitespace-nowrap", bar.active ? "font-medium text-primary" : "text-quaternary")}
                    style={{ left: bar.labelLeft }}
                >
                    {bar.label}
                </p>
            ))}
            <Pop i={6} className={cx("rounded-lg bg-[#181d27] px-2 py-[3px]", chipShadow)} style={{ left: 121, top: 10 }}>
                <p className="text-xs font-semibold whitespace-nowrap text-white">42%</p>
            </Pop>
            <Pop i={7} className="flex items-center" style={{ left: 250, top: 14 }}>
                {[avatar1, avatar2, avatar3].map((src) => (
                    <span key={src} className="relative mr-[-8px] size-8 shrink-0">
                        <Img src={src} className="top-[-2px] left-[-2px] size-9" />
                    </span>
                ))}
                <span className="relative size-8 shrink-0">
                    <Img src={avatarFinding} className="inset-0 size-8" />
                    <Spinner className="top-[9px] left-[9px] size-3.5" />
                </span>
            </Pop>
            <Pop i={8} className="h-7 w-[81px]" style={{ left: 285.21, top: 66.1, rotate: 3 }}>
                <div className={cx(chip, "px-2.5 py-1")}>
                    <p className={chipText}>Bengaluru</p>
                </div>
                <Found left={70} top={-4} />
            </Pop>
        </>
    );
};

const Photo = ({ src, scan }: { src: string; scan?: boolean }) => {
    const reduce = useReducedMotion();
    return (
        <div className={cx("absolute inset-0 overflow-hidden rounded-xl border border-secondary bg-white", chipShadow)}>
            <img src={src} alt="" className="absolute top-[3px] left-[3px] h-[108px] w-[84px] max-w-none rounded-lg object-cover" />
            {scan && (
                <motion.div
                    className="absolute left-[3px] h-[22px] w-[84px]"
                    style={{ top: 55 }}
                    animate={reduce ? undefined : { top: [3, 89, 3] }}
                    transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
                >
                    <div className="h-5 w-full bg-linear-to-b from-white/0 to-white/60" />
                    <div className="h-0.5 w-full bg-linear-to-r from-adkraft-blue via-adkraft-mauve via-50% to-adkraft-pink" />
                </motion.div>
            )}
        </div>
    );
};

/** Figma "Assets graphic" (98:5224). */
export const AssetsGraphic = () => (
    <>
        <Img src={halo} className="top-10 left-[79px] h-[140px] w-[280px]" />
        <Pop i={0} className="h-20 w-16 opacity-60" style={{ left: 26.01, top: 66.44, rotate: -6 }}>
            <div className="absolute inset-0 rounded-[10px] border border-dashed border-primary bg-[#fafafa]" />
        </Pop>
        <Pop i={1} className="h-[116px] w-[92px]" style={{ left: 107.62, top: 39.04, rotate: -8 }}>
            <Photo src={photo1} />
            <Found left={-5} top={-5} />
        </Pop>
        <Pop i={2} className="h-[116px] w-[92px]" style={{ left: 241.48, top: 43.84, rotate: 8 }}>
            <Photo src={photo3} />
            <Found left={81} top={-4} />
        </Pop>
        <Pop i={3} className="h-[116px] w-[92px]" style={{ left: 173, top: 24 }}>
            <Photo src={photo2} scan />
        </Pop>
        <Pop i={4} className="h-20 w-16" style={{ left: 347.65, top: 87.13, rotate: 6 }}>
            <div className="absolute inset-0 rounded-[10px] border border-dashed border-primary bg-[#fafafa]" />
            <Spinner className="top-[-6px] left-[52px] size-4" />
        </Pop>
        <Pop i={5} className="h-8 w-[93px]" style={{ left: 169.41, top: 157.61, rotate: 2 }}>
            <div className={cx(chip, "gap-1.5 px-2 py-[5px]")}>
                <img src={logo} alt="" className="size-5 rounded-[5px] object-cover" />
                <p className={chipText}>logo.svg</p>
            </div>
            <Found left={82} top={-4} />
        </Pop>
    </>
);

/** Figma "Brief graphic" (98:5450). */
export const BriefGraphic = () => {
    const reduce = useReducedMotion();
    return (
        <>
            <Img src={connectorProduct} className="top-[41.5px] left-[108px] h-[21px] w-[23px]" />
            <Img src={connectorAudience} className="top-[139.5px] left-[118px] h-[13px] w-[13px]" />
            <Img src={connectorTone} className="top-[47.5px] left-[307px] h-[15px] w-[19px]" />
            <Img src={connectorGoal} className="top-[139.5px] left-[307px] h-[13px] w-[23px]" />
            <Pop i={0} className={cx("h-[150px] w-[176px] rounded-[14px] border border-secondary bg-white", chipShadow)} style={{ left: 131, top: 28 }}>
                <div className="absolute top-[13px] left-[13px] flex flex-col items-start gap-2">
                    <div className="flex items-center gap-1.5">
                        <img src={logo} alt="" className="size-[18px] rounded-[5px] object-cover" />
                        <p className="text-xs font-semibold text-primary">Aftershoot</p>
                    </div>
                    <p className="w-[148px] text-[11px] leading-[17px] text-secondary">Café-quality cold brew at home.</p>
                    <div className="flex items-center gap-0.5">
                        <motion.div
                            className="h-2 rounded-[4px] bg-linear-to-r from-[rgba(91,140,255,0.55)] via-[rgba(182,140,172,0.55)] via-50% to-[rgba(245,116,137,0.55)]"
                            initial={reduce ? false : { width: 0 }}
                            animate={{ width: 92 }}
                            transition={{ duration: 1.4, delay: 0.5, ease: "easeOut" }}
                        />
                        <motion.div
                            className="h-3.5 w-0.5 rounded-[1px] bg-adkraft-blue"
                            animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }}
                            transition={{ duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity }}
                        />
                    </div>
                    <div className="h-2 w-[148px] rounded-[4px] bg-[#eeeff1]" />
                    <div className="h-2 w-[120px] rounded-[4px] bg-[#eeeff1]" />
                    <div className="h-2 w-[136px] rounded-[4px] bg-[#eeeff1]" />
                </div>
            </Pop>
            {[
                [128, 59],
                [128, 137],
                [304, 59],
                [304, 137],
            ].map(([left, top]) => (
                <Img key={`${left}-${top}`} src={node} className="size-1.5" style={{ left, top }} />
            ))}
            <Pop i={1} className="h-[30px] w-[105px]" style={{ left: 12.83, top: 29.63, rotate: 4 }}>
                <div className={cx(chip, "gap-1.5 px-2.5 py-[5px]")}>
                    <img src={photo3} alt="" className="size-[18px] rounded-full object-cover" />
                    <p className={chipText}>Cold brew</p>
                </div>
                <Found left={94} top={-4} />
            </Pop>
            <Pop i={2} className="h-[30px] w-[91px]" style={{ left: 326.94, top: 28.79, rotate: -4 }}>
                <div className={cx(chip, "px-2.5 py-[5px]")}>
                    <p className={chipText}>Warm, witty</p>
                </div>
                <Found left={80} top={-4} />
            </Pop>
            <Pop i={3} className="h-[30px] w-[106px]" style={{ left: 14.71, top: 137.2, rotate: -3 }}>
                <div className={cx(chip, "px-2.5 py-[5px]")}>
                    <p className={chipText}>Home brewers</p>
                </div>
                <Found left={95} top={-4} />
            </Pop>
            <Pop i={4} className="h-5 w-[74px]" style={{ left: 329.42, top: 141.92, rotate: 3 }}>
                <div className={cx(chip, "px-2.5 py-[5px]")}>
                    <div className="h-2 w-[52px] rounded-[4px] bg-[#eeeff1]" />
                </div>
                <Spinner className="top-[-6px] left-[62px] size-4" />
            </Pop>
        </>
    );
};

const COMPETITORS = [
    { name: "Blue Tokai Coffee Roasters", logo: logoBlueTokai, left: 64, top: 14 },
    { name: "Third Wave Coffee", logo: logoThirdWave, left: 326, top: 14 },
    { name: "Sleepy Owl Coffee", logo: logoSleepyOwl, left: 64, top: 142 },
    { name: "Rage Coffee", logo: logoRage, left: 326, top: 142 },
];

/** Figma "Competitors graphic" (98:6146). */
export const CompetitorsGraphic = () => (
    <>
        <Img src={lineLeft} className="top-[95.25px] left-[88px] h-[1.5px] w-[103px]" />
        <Img src={lineRight} className="top-[95.25px] left-[247px] h-[1.5px] w-[103px]" />
        <Img src={lineVTop} className="top-[62px] left-[87.25px] h-[34px] w-[1.5px]" />
        <Img src={lineVBottom} className="top-[96px] left-[87.25px] h-[46px] w-[1.5px]" />
        <Img src={lineVTop} className="top-[62px] left-[349.25px] h-[34px] w-[1.5px]" />
        <Img src={lineVBottom} className="top-[96px] left-[349.25px] h-[46px] w-[1.5px]" />
        <Img src={lineDown} className="top-[124px] left-[218.25px] h-[26px] w-[1.5px]" />
        <Pop i={0} className={cx("size-14 rounded-2xl border border-secondary bg-white", chipShadow)} style={{ left: 191, top: 68 }}>
            <img src={logo} alt="" className="absolute top-[7px] left-[7px] size-10 rounded-[10px] object-cover" />
        </Pop>
        {COMPETITORS.map((c, idx) => (
            <Pop key={c.name} i={idx + 1} className="size-12" style={{ left: c.left, top: c.top }}>
                <div className={cx("absolute inset-0 rounded-[14px] border border-secondary bg-white", chipShadow)}>
                    <img src={c.logo} alt={c.name} className="absolute top-[7px] left-[7px] size-8" />
                </div>
                <Found left={37} top={-4} />
            </Pop>
        ))}
        <Pop i={5} className="size-11 rounded-[14px] border border-dashed border-primary bg-[#fafafa]" style={{ left: 197, top: 150 }}>
            <Spinner className="top-[13px] left-[13px] size-4" />
        </Pop>
    </>
);
