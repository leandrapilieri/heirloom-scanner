"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: "🏠", isCenter: false },
  { href: "/search", label: "Search", icon: "🔍", isCenter: false },
  { href: "/scan", label: "Scan", icon: "📷", isCenter: true },
  { href: "/map", label: "Map", icon: "📍", isCenter: false },
  { href: "/history", label: "History", icon: "🕐", isCenter: false }
] as const;

const routeActiveMap: Record<string, string[]> = {
  "/": ["/"],
  "/search": ["/search"],
  "/scan": ["/scan", "/product", "/report", "/premium"],
  "/map": ["/map"],
  "/history": ["/history", "/favorites"]
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
      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-t border-black/5">
          {navItems.map((item) => {
            if (item.isCenter) return null;
            const isActive = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 flex-1 py-2 transition-colors ${
                  isActive ? "text-accent" : "text-ink-light"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Floating Scan Button */}
        <Link
          href="/scan"
          className="absolute left-1/2 -translate-x-1/2 -top-8 w-16 h-16 rounded-full bg-accent shadow-lg flex items-center justify-center text-2xl hover:shadow-xl transition-shadow"
        >
          📷
        </Link>
      </nav>

      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-50 mx-auto hidden w-full max-w-4xl items-center justify-center px-4 pt-4 md:flex">
        <div className="flex items-center gap-2 rounded-full border border-black/5 bg-white/70 backdrop-blur-xs px-4 py-3 shadow-soft">
          {navItems.map((item) => {
            if (item.isCenter) return null;
            const isActive = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-accent text-white shadow-soft"
                    : "text-ink-light hover:text-ink hover:bg-white/50"
                }`}
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
