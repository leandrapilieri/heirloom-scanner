"use client";

import Link from "next/link";
import Image from "next/image";
import { listProducts } from "@/lib/services/product-catalog";

export default function HomePage() {
  const products = listProducts().slice(0, 6);

  return (
    <main className="shell section-gap pb-32">
      {/* Header Section */}
      <section className="flex items-start justify-between pt-4">
        <div>
          <p className="text-sm text-ink-light">Good afternoon</p>
          <h1 className="display text-3xl font-bold text-ink">Leandra Pilieri</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-white/70 backdrop-blur-xs px-3 py-2 shadow-soft">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-semibold text-ink">0</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-accent-warm/30 flex items-center justify-center text-2xl">
            🍐
          </div>
        </div>
      </section>

      {/* Current Rank Card */}
      <section className="rounded-[28px] bg-gradient-to-br from-accent to-accent/80 p-6 text-white shadow-premium">
        <p className="text-xs font-bold uppercase tracking-widest opacity-90">Current Rank</p>
        <h2 className="display text-3xl font-bold mt-2">Heirloom Guardian</h2>
        
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">0 Scans</p>
            <div className="mt-3 w-40 h-2 rounded-full bg-white/30">
              <div className="h-full w-0 rounded-full bg-white transition-all" />
            </div>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-accent/50 text-3xl">
            🛡️
          </div>
        </div>
        
        <p className="text-xs mt-4 opacity-90">Next: Wellness Expert</p>
      </section>

      {/* Heirloom Score Section */}
      <section className="card-narrative">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-light">Heirloom Score</p>
        <p className="text-sm text-ink-light mt-2">Add a product to your pantry to start</p>
      </section>

      {/* Lab Tested Products Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="display text-2xl font-bold text-ink">Lab Tested Products</h3>
          <Link href="/search" className="text-sm font-medium text-accent hover:text-accent/80">
            See all →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {products.slice(0, 3).map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="flex-shrink-0 w-40 space-y-2"
            >
              <div className="relative h-40 rounded-[20px] overflow-hidden bg-stone/30 shadow-soft">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 w-5 h-5 rounded-full bg-accent shadow-soft" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink line-clamp-2">{product.name}</p>
                <p className="text-xs text-ink-light">{product.brand}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="display text-2xl font-bold text-ink">Latest Articles</h3>
          <Link href="/search" className="text-sm font-medium text-accent hover:text-accent/80">
            See all →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 h-32 rounded-[20px] overflow-hidden bg-gradient-to-br from-stone to-accent/20 shadow-soft"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
