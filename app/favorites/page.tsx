"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { CatalogProduct, listProducts } from "@/lib/services/product-catalog";
import { useAppState } from "@/lib/state/app-state";

export default function FavoritesPage() {
  const { favorites, recentScans, shoppingList, hydrated } = useAppState();
  const all = listProducts();

  const favoriteProducts = favorites.map((slug) => all.find((product) => product.slug === slug)).filter((product): product is CatalogProduct => Boolean(product));
  const recentProducts = recentScans.map((slug) => all.find((product) => product.slug === slug)).filter((product): product is CatalogProduct => Boolean(product));
  const hasFavorites = favoriteProducts.length > 0;
  const hasRecentScans = recentProducts.length > 0;

  if (!hydrated) {
    return (
      <main className="shell section-gap">
        <div className="card-state space-y-3 text-sm text-ink/75">
          <p className="font-medium text-ink">Loading your pantry...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="shell section-gap">
      <header className="space-y-2">
        <p className="pill-sage inline-flex">Pantry intelligence</p>
        <h1 className="display text-3xl">Saved staples</h1>
        <p className="text-sm leading-relaxed text-ink/70">Favorites and shopping list now persist locally so pantry planning survives refreshes.</p>
      </header>

      <div className="flex flex-wrap gap-2 text-xs">
        {['Grade A', 'Low sugar', 'Nut-free', `${shoppingList.length} in list`].map((tag) => (
          <span key={tag} className="pill">{tag}</span>
        ))}
      </div>

      <section className="card-state text-sm">
        <h2 className="display text-xl">Pantry insight</h2>
        <p className="mt-1 text-ink/75">{favoriteProducts.length} favorites saved · {recentProducts.length} recent scans captured on this device.</p>
      </section>

      <section className="section-gap">
        {hasFavorites ? (
          favoriteProducts.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <section className="card-state space-y-3 text-sm text-ink/75">
            <h2 className="display text-xl text-ink">No saved staples yet</h2>
            <p>Save from any product result to build your pantry shortlist.</p>
            <Link className="btn-primary inline-flex text-sm" href="/scan">
              Scan a snack
            </Link>
          </section>
        )}
      </section>

      <section className="card-narrative text-sm">
        <h2 className="display text-xl">Recent scans</h2>
        {hasRecentScans ? (
          <p className="mt-1 leading-relaxed text-ink/75">{recentProducts.map((item) => item.name).join(" · ")}</p>
        ) : (
          <p className="mt-1 leading-relaxed text-ink/75">No scans yet on this device. Start from Scan to generate your first result.</p>
        )}
      </section>
    </main>
  );
}
