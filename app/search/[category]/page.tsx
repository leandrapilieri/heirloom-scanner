import Link from "next/link";
import { products } from "@/data/products";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categoryName = decodeURIComponent(category);
  
  // Get products for this category
  const categoryProducts = products.filter(
    (p) => p.category.toLowerCase() === categoryName.toLowerCase()
  );

  return (
    <main className="shell pb-32 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="pt-6 px-4 mb-8">
        <Link href="/search" className="inline-flex items-center text-sage-600 hover:text-sage-700 mb-4">
          <span className="text-2xl">‹</span>
        </Link>
        <div className="mt-4">
          <p className="text-sm font-semibold text-sage-600 tracking-wide">BROWSING</p>
          <h1 className="text-4xl font-bold text-black mt-2">{categoryName}</h1>
        </div>
      </div>

      {/* Product List */}
      <div className="px-4 space-y-3">
        {categoryProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No products found in this category.</p>
          </div>
        ) : (
          categoryProducts.map((product, index) => (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 items-start">
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                </div>

                {/* Product Image */}
                <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-black text-sm truncate">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-xs mb-3">{product.brand}</p>

                  {/* Score */}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    {/* eslint-disable @typescript-eslint/no-explicit-any */}
                    <span className="font-bold text-black text-sm">
                      {Math.round((product as any).numericScore || 0)}/100
                    </span>
                    <span className="text-green-600 font-semibold text-sm">
                      {(product as any).grade || "Good"}
                    </span>
                    {/* eslint-enable @typescript-eslint/no-explicit-any */}
                  </div>
                </div>

                {/* Chevron */}
                <div className="flex-shrink-0 flex items-center justify-center">
                  <span className="text-gray-400 text-xl">›</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
