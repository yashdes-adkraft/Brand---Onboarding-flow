import type { StepDefinition, StepId } from "../flow";
import { websiteStep } from "./website";
import { categoryStep } from "./category";
import { audienceStep } from "./audience";
import { assetsStep } from "./assets";
import { researchStep } from "./research";
import { reviewStep } from "./review";
import { competitorsStep } from "./competitors";
import { trendsStep } from "./trends";
import { readyStep } from "./ready";
import { manualStep } from "./manual";

/** One entry per step id in STEP_ORDER. Each step file owns its own definition. */
export const STEPS: Record<StepId, StepDefinition> = {
    website: websiteStep,
    category: categoryStep,
    audience: audienceStep,
    assets: assetsStep,
    research: researchStep,
    review: reviewStep,
    competitors: competitorsStep,
    trends: trendsStep,
    ready: readyStep,
    manual: manualStep,
};
