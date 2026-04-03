export const PREMIUM_PROMPT_COOLDOWN_DAYS = 7;
export const PREMIUM_PROMPT_COOLDOWN_MS = PREMIUM_PROMPT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export const PREMIUM_TRIGGER_SOURCES = [
  "report",
  "compare_insights",
  "extended_swaps",
  "retailer_intel"
] as const;

export type PremiumTriggerSource = (typeof PREMIUM_TRIGGER_SOURCES)[number];
