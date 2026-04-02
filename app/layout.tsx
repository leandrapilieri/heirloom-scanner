import type { Metadata } from "next";
import "@/app/globals.css";
import { MobileNav } from "@/components/nav";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Heirloom Scanner",
  description: "Premium snack scanner and healthier swap guide for families"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
