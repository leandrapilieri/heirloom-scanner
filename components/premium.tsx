import Image from "next/image";
import Link from "next/link";
import { scoreProduct } from "@/lib/scoring";
import { GuardianPreferences, Product } from "@/lib/types";

type Severity = "clean" | "caution" | "concern";

export function SeverityChip({ label, severity }: { label: string; severity: Severity }) {
  const tone = {
    clean: "border-sage/25 bg-sage/15 text-sage",
    caution: "border-amber-500/25 bg-amber-100 text-amber-800",
    concern: "border-accent/25 bg-accent/10 text-accent"
  }[severity];

  return <span className={`rounded-full border px-3 py-1 text-xs ${tone}`}>{label}</span>;
}

export function ReasonChip({ reason }: { reason: string }) {
  return <span className="pill">{reason}</span>;
}

export function InterpretationCard({
  title,
  summary,
  children
}: {
  title: string;
  summary: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="card-narrative space-y-3">
      <div>
        <p className="eyebrow">Interpretation</p>
        <h3 className="display text-xl">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink/75">{summary}</p>
      </div>
      {children}
    </article>
  );
}

export function RetailerRow({
  retailer,
  price,
  inStock
}: {
  retailer: string;
  price: string;
  inStock: boolean;
}) {
  return (
    <div className="card-retailer flex items-center justify-between text-sm">
      <p>{retailer}</p>
      <p className="text-ink/70">
        {price} · {inStock ? "In stock" : "Limited"}
      </p>
    </div>
  );
}

export function RecommendationModule({
  product,
  primaryHref,
  ctaLabel = "View healthier result",
  preferences
}: {
  product: Product;
  primaryHref: string;
  ctaLabel?: string;
  preferences?: GuardianPreferences;
}) {
  const score = scoreProduct(product, preferences);
  const reasons = [
    product.addedSugarG <= 5 ? "Lower added sugar" : "Moderate sugar profile",
    product.additives.length <= 1 ? "Cleaner ingredient list" : "Contains a few additives",
    product.fiberG >= 3 ? "Better lunchbox support" : "Lighter on fiber"
  ];

  return (
    <article className="card-recommendation space-y-3">
      <div className="relative h-36 overflow-hidden rounded-2xl">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Same product family</p>
          <h3 className="text-sm font-medium">{product.name}</h3>
          <p className="text-xs text-ink/65">{product.brand}</p>
        </div>
        <div className="rounded-2xl border border-accent/20 bg-white px-3 py-2 text-center">
          <p className="display text-2xl text-accent">{score.grade}</p>
          <p className="text-[11px] text-ink/60">{score.numericScore}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {reasons.map((reason) => (
          <ReasonChip key={reason} reason={reason} />
        ))}
      </div>
      <Link href={primaryHref} className="btn-secondary block text-center text-xs">
        {ctaLabel}
      </Link>
    </article>
  );
}

export function PreferenceToggle({
  title,
  description,
  enabled,
  onToggle,
  disabled
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="card-metric flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-ink/65">{description}</p>
      </div>
      <button
        className={`relative h-7 w-12 rounded-full transition ${enabled ? "bg-sage/70" : "bg-ink/15"}`}
        type="button"
        aria-pressed={enabled}
        onClick={onToggle}
        disabled={disabled}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${enabled ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

export function ComparisonMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="card-metric space-y-1">
      <p className="eyebrow">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-ink/60">{note}</p>
    </article>
  );
}
