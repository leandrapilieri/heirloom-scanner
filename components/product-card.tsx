import Image from "next/image";
import Link from "next/link";
import { scoreProduct } from "@/lib/scoring";
import { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const score = scoreProduct(product);

  return (
    <Link href={`/product/${product.slug}`} className="card group flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-halo">
      <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      <div className="flex-1">
        <p className="eyebrow">{product.brand}</p>
        <h3 className="text-sm font-medium leading-tight">{product.name}</h3>
        <p className="text-xs text-ink/60">{product.category}</p>
      </div>
      <div className="rounded-2xl border border-accent/15 bg-white px-3 py-2 text-center">
        <p className="display text-xl leading-none text-accent">{score.grade}</p>
        <p className="mt-1 text-[11px] text-ink/60">{score.numericScore}</p>
      </div>
    </Link>
  );
}
