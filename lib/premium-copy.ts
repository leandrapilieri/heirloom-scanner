import { PremiumTriggerSource } from "@/lib/premium-access";

export function premiumSourceLabel(source: PremiumTriggerSource | "premium_preview") {
  switch (source) {
    case "report":
      return "advanced ingredient intelligence";
    case "compare_insights":
      return "advanced compare insights";
    case "extended_swaps":
      return "deeper swap intelligence";
    case "retailer_intel":
      return "enhanced retailer intelligence";
    default:
      return "premium intelligence";
  }
}

export function premiumSourcePrompt(source: PremiumTriggerSource) {
  switch (source) {
    case "report":
      return "You opened a deep ingredient read. Premium adds clearer additive context and family-fit guidance beyond the core report.";
    case "compare_insights":
      return "You’re comparing options in detail. Premium adds richer side-by-side insight to make tradeoffs clearer in aisle.";
    case "extended_swaps":
      return "You’re exploring healthier alternatives. Premium adds deeper same-family swap rationale and tighter preference-fit ranking.";
    case "retailer_intel":
      return "You’re checking where to buy. Premium adds richer retailer context to help with confidence and timing.";
  }
}

export function premiumSourceProof(source: PremiumTriggerSource) {
  switch (source) {
    case "report":
      return "Example unlock: additive severity ladder with everyday family-use guidance.";
    case "compare_insights":
      return "Example unlock: confidence-weighted comparison showing where one option wins by context.";
    case "extended_swaps":
      return "Example unlock: why swap #4 may beat swap #2 for your active household standards.";
    case "retailer_intel":
      return "Example unlock: retailer confidence layer with stronger buy-now guidance.";
  }
}
