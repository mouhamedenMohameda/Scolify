import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@school-admin/ui/src/styles/globals.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "School Administration System",
  description: "SaaS multi-tenant de gestion scolaire",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
