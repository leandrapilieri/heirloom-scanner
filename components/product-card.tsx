import Image from "next/image";
import Link from "next/link";
import { scoreProduct } from "@/lib/scoring";
import { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const score = scoreProduct(product);

  // Color mapping for grades
  const gradeColors = {
    "A+": "text-accent",
    "A": "text-accent",
    "B": "text-accent-warm",
    "C": "text-amber-600",
    "D": "text-red-500",
    "F": "text-red-600"
  };

  const gradeColor = gradeColors[score.grade as keyof typeof gradeColors] || "text-accent";

  return (
    <Link 
      href={`/product/${product.slug}`} 
      className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-white/70 backdrop-blur-xs p-4 shadow-soft transition-all duration-300 hover:shadow-premium hover:-translate-y-1 hover:bg-white/80"
    >
      {/* Background gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
      
      <div className="relative flex items-center gap-4">
        {/* Product Image */}
        <div className="relative h-20 w-20 overflow-hidden rounded-[20px] flex-shrink-0 shadow-soft">
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            className="object-cover transition-transform duration-300 group-hover:scale-110" 
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-ink-light">{product.brand}</p>
          <h3 className="text-sm font-semibold leading-tight text-ink mt-1 truncate">{product.name}</h3>
          <p className="text-xs text-ink-light mt-1">{product.category}</p>
        </div>

        {/* Grade Badge */}
        <div className="flex-shrink-0 rounded-[20px] border border-black/8 bg-white/80 backdrop-blur-xs px-4 py-3 text-center shadow-soft transition-all duration-300 group-hover:shadow-quiet">
          <p className={`display text-2xl font-bold leading-none ${gradeColor}`}>{score.grade}</p>
          <p className="mt-1.5 text-[10px] font-medium text-ink-light">{score.numericScore}</p>
        </div>
      </div>
    </Link>
  );
}
