import { GuardianPreferences, Grade, Product, ScoreResult } from "@/lib/types";

const wholeGrainSignals = ["whole grain", "whole wheat", "oats"];
const simpleFoodSignals = ["banana", "apple", "dates", "chia", "berries", "spinach"];
const artificialSweeteners = ["sucralose", "aspartame", "acesulfame potassium"];

const gradeFromScore = (score: number): Grade => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 68) return "B";
  if (score >= 52) return "C";
  return "D";
};

export function scoreProduct(product: Product, preferences?: GuardianPreferences): ScoreResult {
  let score = 100;
  const reasons: string[] = [];
  const flags: string[] = [...product.additives];

  score -= product.addedSugarG * 2.8;
  if (product.addedSugarG > 8) reasons.push("higher added sugar");

  score += product.fiberG * 2.2;
  if (product.fiberG >= 3) reasons.push("good fiber support");

  score += product.proteinG * 1.1;
  if (product.proteinG >= 4) reasons.push("useful protein");

  score -= Math.max(0, (product.sodiumMg - 120) / 18);
  if (product.sodiumMg > 220) reasons.push("elevated sodium");

  if (product.additives.length > 0) {
    score -= product.additives.length * 4;
    reasons.push("contains additives");
  }

  if (product.processingLevel === "high") {
    score -= 10;
    reasons.push("highly processed profile");
  }

  const joinedIngredients = product.ingredients.join(" ").toLowerCase();
  if (wholeGrainSignals.some((signal) => joinedIngredients.includes(signal))) {
    score += 5;
    reasons.push("whole grain signals");
  }

  if (simpleFoodSignals.some((signal) => joinedIngredients.includes(signal))) {
    score += 4;
    reasons.push("simple-food ingredient cues");
  }

  if (product.ingredients.length <= 9) {
    score += 4;
    reasons.push("short ingredient list");
  }

  if (preferences) {
    if (preferences.lowSugar && product.addedSugarG > 6) score -= 8;
    if (preferences.nutFree && product.allergens.some((a) => a.toLowerCase().includes("nut"))) score -= 12;
    if (preferences.dairyFree && product.allergens.includes("Milk")) score -= 8;
    if (preferences.dyeFree && product.additives.some((a) => a.toLowerCase().includes("red") || a.toLowerCase().includes("yellow") || a.toLowerCase().includes("blue"))) score -= 10;
    if (preferences.proteinFocused && product.proteinG >= 6) score += 6;
    if (preferences.noArtificialSweeteners && product.ingredients.some((item) => artificialSweeteners.some((sw) => item.toLowerCase().includes(sw)))) score -= 10;
    if (preferences.toddlerFriendly && product.sodiumMg <= 130 && product.addedSugarG <= 5) score += 4;
  }

  const numericScore = Math.max(0, Math.min(100, Math.round(score)));
  const grade = gradeFromScore(numericScore);

  const standardsBadges = [
    product.addedSugarG <= 5 ? "Lower Added Sugar" : null,
    product.fiberG >= 3 ? "Fiber Friendly" : null,
    product.processingLevel !== "high" ? "Mindful Processing" : null,
    product.additives.length === 0 ? "No Listed Additives" : null
  ].filter(Boolean) as string[];

  const ingredientFlags = [...new Set(flags)].slice(0, 4);
  const allergenFlags = product.allergens.length ? product.allergens : ["No major allergens flagged"];

  const tone = grade === "A+" || grade === "A" ? "A strong everyday pick" : grade === "B" ? "A balanced option with a few tradeoffs" : "An occasional treat with notable tradeoffs";
  const explanation = `${tone}: ${reasons.slice(0, 2).join(" and ") || "limited nutrition data"}.`;

  return {
    numericScore,
    grade,
    explanation,
    topReasons: reasons.slice(0, 4),
    standardsBadges,
    ingredientFlags,
    allergenFlags
  };
}
