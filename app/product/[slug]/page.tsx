"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getProductBySlug } from "@/lib/services/product-catalog";
import { useAppState } from "@/lib/state/app-state";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const [hydrated, setHydrated] = useState(false);
  const product = getProductBySlug(params.slug);
  const { favorites, toggleFavorite } = useAppState();
  const isFavorited = favorites.includes(params.slug);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated || !product) {
    return (
      <main className="shell pb-32">
        <div className="pt-8 text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scoreColor = ((product as any).numericScore || 0) >= 80 ? "text-green-600" : ((product as any).numericScore || 0) >= 60 ? "text-yellow-600" : "text-red-600";

  return (
    <main className="shell pb-32 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Header with Back Button */}
      <div className="pt-4 px-4 mb-6">
        <Link href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
          <span className="text-sage-600 text-xl">‹</span>
        </Link>
      </div>

      {/* Product Header Section */}
      <div className="px-4 mb-8">
        <div className="flex gap-6 mb-6">
          {/* Product Image */}
          <div className="flex-shrink-0 w-32 h-40 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-black mb-2">{product.name}</h1>
            <p className="text-gray-500 text-sm mb-6">{product.brand}</p>

            {/* Score Section */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                {/* eslint-disable @typescript-eslint/no-explicit-any */}
                <span className={`text-2xl font-bold ${scoreColor}`}>
                  {Math.round((product as any).numericScore || 0)}/100
                </span>
              </div>
              <span className={`text-lg font-semibold ${scoreColor}`}>
                {(product as any).grade || "Good"}
              </span>
              {/* eslint-enable @typescript-eslint/no-explicit-any */}
            </div>

            {/* Share Button */}
            <button className="px-6 py-2 border-2 border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors">
              SHARE ⤴
            </button>
          </div>
        </div>

        {/* Add to Pantry Button */}
        <button
          onClick={() => toggleFavorite(params.slug)}
          className={`w-full py-4 rounded-full font-semibold text-lg transition-all duration-300 ${
            isFavorited
              ? "bg-sage-100 text-sage-700 border-2 border-sage-600"
              : "bg-sage-50 text-sage-600 border-2 border-sage-600 hover:bg-sage-100"
          }`}
        >
          {isFavorited ? "✓ Added to Pantry" : "Add to Pantry"} 🔖
        </button>
      </div>

      {/* Analysis Card */}
      <div className="px-4 mb-8">
        <div className="bg-sage-50 rounded-2xl p-6 border border-sage-200">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">🍐</span>
            <h2 className="text-2xl font-bold text-black">Heirloom&apos;s Analysis</h2>
            <span className="text-orange-500 text-xl ml-auto">✦✦</span>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm">
            This product has been analyzed by our Heirloom team. Check the nutrition facts and ingredients below for more details.
          </p>
        </div>
      </div>

      {/* Nutrition Facts */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-bold text-black mb-4">NUTRITION FACTS</h3>
        <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Calories</span>
            <span className="font-semibold text-black">{product.calories}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Added Sugar</span>
            <span className="font-semibold text-black">{product.addedSugarG}g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Sugar</span>
            <span className="font-semibold text-black">{product.totalSugarG}g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Protein</span>
            <span className="font-semibold text-black">{product.proteinG}g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sodium</span>
            <span className="font-semibold text-black">{product.sodiumMg}mg</span>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-bold text-black mb-4">INGREDIENTS</h3>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-700 text-sm leading-relaxed">
            {product.ingredients.join(", ")}
          </p>
        </div>
      </div>

      {/* Allergens */}
      {product.allergens.length > 0 && (
        <div className="px-4 mb-8">
          <h3 className="text-lg font-bold text-black mb-4">ALLERGENS</h3>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-700 text-sm">
              {product.allergens.join(", ")}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
