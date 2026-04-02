"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/favorites", label: "Pantry" },
  { href: "/preferences", label: "Settings" }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-3 z-20 mx-auto flex w-[calc(100%-1rem)] max-w-md items-center justify-between rounded-full border border-white/80 bg-[#f8f4ec]/95 px-3 py-2 shadow-halo backdrop-blur">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              isActive ? "bg-white text-ink shadow-sm" : "text-ink/65"
            }`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
