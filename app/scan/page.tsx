"use client";

import { useState } from "react";
import Link from "next/link";

export default function ScanPage() {
  const [scanMode, setScanMode] = useState<"single" | "shelf">("single");

  return (
    <main className="shell pb-32 bg-gradient-to-b from-gray-100 to-gray-50 min-h-screen flex flex-col">
      {/* Header with Branding */}
      <div className="pt-6 px-4 text-center">
        <Link href="/" className="inline-block text-gray-400 hover:text-gray-600 mb-4">
          ✕
        </Link>
        <div className="flex justify-center mb-6">
          <div className="text-4xl font-bold">
            <span className="text-sage-600">🍐</span>
            <span className="text-sage-600">Heirloom</span>
          </div>
        </div>
      </div>

      {/* Scan Mode Toggle */}
      <div className="px-4 flex gap-3 justify-center mb-8">
        <button
          onClick={() => setScanMode("single")}
          className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
            scanMode === "single"
              ? "bg-white text-black shadow-sm"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Single Scan
        </button>
        <button
          onClick={() => setScanMode("shelf")}
          className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
            scanMode === "shelf"
              ? "bg-white text-black shadow-sm"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Shelf Scan™
        </button>
        <button className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors">
          ℹ
        </button>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 px-4 flex items-center justify-center mb-8">
        <div className="w-full aspect-square max-w-sm bg-gradient-to-b from-gray-300 to-gray-400 rounded-3xl border-2 border-white/50 shadow-lg flex items-center justify-center relative overflow-hidden">
          {/* Scanning frame effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/30 rounded-2xl" />
          </div>
          
          {/* Placeholder for camera feed */}
          <div className="text-center z-10">
            <p className="text-white/60 text-sm">Camera Feed</p>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="text-center pb-6 text-gray-500 text-sm">
        <p>Scanning by SCANDIT</p>
      </div>
    </main>
  );
}
