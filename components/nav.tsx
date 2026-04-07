"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/compare", label: "Compare" },
  { href: "/favorites", label: "Pantry" },
  { href: "/preferences", label: "Settings" }
] as const;

const routeActiveMap: Record<string, string[]> = {
  "/": ["/"],
  "/scan": ["/scan", "/product", "/report", "/premium"],
  "/compare": ["/compare"],
  "/favorites": ["/favorites"],
  "/preferences": ["/preferences"]
};

function isNavItemActive(currentPath: string, navHref: (typeof navItems)[number]["href"]) {
  const scopes = routeActiveMap[navHref] ?? [navHref];

  return scopes.some((scope) => {
    if (scope === "/") {
      return currentPath === "/";
    }

    return currentPath === scope || currentPath.startsWith(`${scope}/`);
  });
}

export function MobileNav() {
  const pathname = usePathname() || "/";

  return (
    <>
      <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto flex w-[calc(100%-1rem)] max-w-md items-center justify-between rounded-full border border-black/8 bg-white/70 backdrop-blur-xs px-2 py-2.5 shadow-soft md:hidden pointer-events-none">
        {navItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);
          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex flex-1 items-center justify-center rounded-full px-3 py-2 text-xs font-medium transition-all duration-300 pointer-events-auto ${
                isActive 
                  ? "bg-accent text-white shadow-soft" 
                  : "text-ink-light hover:text-ink hover:bg-white/50"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <nav className="sticky top-0 z-50 mx-auto hidden w-full max-w-4xl items-center justify-center px-4 pt-4 md:flex">
        <div className="flex items-center gap-1.5 rounded-full border border-black/8 bg-white/70 backdrop-blur-xs px-2 py-2.5 shadow-soft">
          {navItems.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 ${
                  isActive 
                    ? "bg-accent text-white shadow-soft" 
                    : "text-ink-light hover:text-ink hover:bg-white/50"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
