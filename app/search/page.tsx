"use client";

import Link from "next/link";
import Image from "next/image";
import { listProducts } from "@/lib/services/product-catalog";
import { useState } from "react";

const CATEGORIES = [
  { id: "snacks", label: "Kids' Snacks", icon: "🍿" },
  { id: "bars", label: "Fruit Bars", icon: "🍌" },
  { id: "dairy-free", label: "Dairy-free", icon: "🥛" },
  { id: "protein", label: "Protein Bars", icon: "💪" },
  { id: "organic", label: "Organic", icon: "🌿" },
  { id: "gluten-free", label: "Gluten-free", icon: "🌾" },
  { id: "low-sugar", label: "Low Sugar", icon: "🍯" },
  { id: "drinks", label: "Water & Drinks", icon: "💧" },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const products = listProducts();

  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <main className="shell section-gap pb-32">
      {/* Search Bar */}
      <section className="pt-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-[20px] bg-white/70 backdrop-blur-xs border border-black/5 text-ink placeholder-ink-light/50 focus:outline-none focus:ring-2 focus:ring-accent/30 shadow-soft"
          />
        </div>
      </section>

      {!searchQuery && (
        <>
          {/* Top Products Categories */}
          <section className="space-y-3">
            <h3 className="display text-2xl font-bold text-ink">Top Products</h3>
            <div className="grid grid-cols-4 gap-4">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-[20px] bg-white/70 backdrop-blur-xs hover:bg-white/90 transition-colors shadow-soft"
                >
                  <div className="w-12 h-12 rounded-full bg-stone/30 flex items-center justify-center text-2xl">
                    {category.icon}
                  </div>
                  <span className="text-xs font-medium text-ink text-center leading-tight">
                    {category.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Product Sections */}
          <section className="space-y-6">
            {/* Snacks Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="display text-2xl font-bold text-ink">Snacks</h3>
                <Link href="#" className="text-sm font-medium text-accent hover:text-accent/80">
                  View All →
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
            </div>

            {/* Granola Bars Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="display text-2xl font-bold text-ink">Granola Bars</h3>
                <Link href="#" className="text-sm font-medium text-accent hover:text-accent/80">
                  View All →
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {products.slice(3, 6).map((product) => (
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
            </div>

            {/* Dairy-free Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="display text-2xl font-bold text-ink">Dairy-free Options</h3>
                <Link href="#" className="text-sm font-medium text-accent hover:text-accent/80">
                  View All →
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
            </div>
          </section>
        </>
      )}

      {/* Search Results */}
      {searchQuery && (
        <section className="space-y-3">
          <h3 className="display text-2xl font-bold text-ink">Search Results</h3>
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="space-y-2"
              >
                <div className="relative h-32 rounded-[20px] overflow-hidden bg-stone/30 shadow-soft">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-accent shadow-soft" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink line-clamp-2">{product.name}</p>
                  <p className="text-xs text-ink-light">{product.brand}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
