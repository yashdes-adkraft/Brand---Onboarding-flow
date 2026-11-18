import type { StepDefinition, StepId } from "../flow";
import { websiteStep } from "./website";
import { categoryStep } from "./category";
import { audienceStep } from "./audience";
import { goalsStep } from "./goals";
import { assetsStep } from "./assets";
import { researchStep } from "./research";
import { reviewStep } from "./review";
import { competitorsStep } from "./competitors";
import { trendsStep } from "./trends";
import { readyStep } from "./ready";

/** One entry per step id in STEP_ORDER. Each step file owns its own definition. */
export const STEPS: Record<StepId, StepDefinition> = {
    website: websiteStep,
    category: categoryStep,
    audience: audienceStep,
    goals: goalsStep,
    assets: assetsStep,
    research: researchStep,
    review: reviewStep,
    competitors: competitorsStep,
    trends: trendsStep,
    ready: readyStep,
};
