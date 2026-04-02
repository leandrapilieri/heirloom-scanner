"use client";

import { ProductCard } from "@/components/product-card";
import { CatalogProduct, listProducts } from "@/lib/services/product-catalog";
import { useAppState } from "@/lib/state/app-state";

export default function FavoritesPage() {
  const { favorites, recentScans, shoppingList } = useAppState();
  const all = listProducts();

  const favoriteProducts = favorites.map((slug) => all.find((product) => product.slug === slug)).filter((product): product is CatalogProduct => Boolean(product));
  const recentProducts = recentScans.map((slug) => all.find((product) => product.slug === slug)).filter((product): product is CatalogProduct => Boolean(product));

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
        {(favoriteProducts.length ? favoriteProducts : all.slice(0, 4)).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      <section className="card-narrative text-sm">
        <h2 className="display text-xl">Recent scans</h2>
        <p className="mt-1 leading-relaxed text-ink/75">{(recentProducts.length ? recentProducts : all.slice(0, 4)).map((item) => item.name).join(" · ")}</p>
      </section>
    </main>
  );
}
