"use client";

import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/favorites", label: "Pantry" },
  { href: "/preferences", label: "Settings" }
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <nav className="pointer-events-auto fixed inset-x-0 bottom-3 z-[100] mx-auto flex w-[calc(100%-1rem)] max-w-md items-center justify-between rounded-full border border-white/80 bg-[#f8f4ec]/95 px-3 py-2 shadow-halo backdrop-blur md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              type="button"
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                isActive ? "bg-white text-ink shadow-sm" : "text-ink/65"
              }`}
              onClick={() => router.push(item.href)}
              key={item.href}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
      <nav className="pointer-events-auto sticky top-0 z-[100] mx-auto hidden w-full max-w-4xl items-center justify-center px-4 pt-4 md:flex">
        <div className="flex items-center gap-2 rounded-full border border-white/80 bg-[#f8f4ec]/95 px-3 py-2 shadow-quiet backdrop-blur">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-xs transition ${
                  isActive ? "bg-white text-ink shadow-sm" : "text-ink/65 hover:text-ink"
                }`}
                onClick={() => router.push(item.href)}
                key={item.href}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
