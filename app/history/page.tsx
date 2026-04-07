"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAppState } from "@/lib/state/app-state";
import { getProductBySlug, CatalogProduct } from "@/lib/services/product-catalog";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<"pantry" | "history">("pantry");
  const [hydrated, setHydrated] = useState(false);
  const { favorites, recentScans } = useAppState();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const favoriteProducts = favorites
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is CatalogProduct => Boolean(p));

  const recentProducts = recentScans
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is CatalogProduct => Boolean(p));

  if (!hydrated) {
    return (
      <main className="shell pb-32">
        <div className="pt-8 text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="shell pb-32">
      {/* Tab Switcher */}
      <div className="pt-6 px-4">
        <div className="flex gap-3 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setActiveTab("pantry")}
            className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${
              activeTab === "pantry"
                ? "bg-white text-black shadow-sm"
                : "text-gray-400"
            }`}
          >
            My Pantry
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${
              activeTab === "history"
                ? "bg-white text-black shadow-sm"
                : "text-gray-400"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Pantry Tab */}
      {activeTab === "pantry" && (
        <div className="pt-12 px-4">
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-3xl font-bold mb-4">Nothing in here...</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Tap the &quot;Add to Pantry&quot; button on<br />a product to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteProducts.map((product) => (
                <Link
                  key={product.slug}
                  href={`/product/${product.slug}`}
                  className="block p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="pt-12 px-4">
          {recentProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-8 flex justify-center">
                {/* Sailboat Doodle SVG */}
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  className="text-pink-300"
                >
                  <g fill="none" stroke="currentColor" strokeWidth="3">
                    {/* Sailboat */}
                    <path d="M 60 20 L 60 80" strokeLinecap="round" />
                    <path d="M 60 25 L 35 75 Q 30 85 40 90 L 60 80 Z" />
                    <path d="M 60 40 L 75 75 Q 78 82 85 80 L 60 50 Z" />
                    {/* Water */}
                    <ellipse cx="60" cy="95" rx="40" ry="15" />
                  </g>
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                No <span className="text-pink-400">history</span> yet
              </h2>
              <p className="text-gray-400 text-lg mt-6 leading-relaxed">
                Scan a <span className="text-sage-600 font-semibold">barcode</span> to<br />
                build history
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <Link
                  key={product.slug}
                  href={`/product/${product.slug}`}
                  className="block p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
