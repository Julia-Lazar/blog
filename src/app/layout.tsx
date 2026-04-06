import type { Metadata } from "next";
import "./globals.css";
import "./styles/markdownStyles.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Julia Lazar's miscellaneous blog",
  description:
    "Cozy notes about web development, projects, and learning journeys in a Jigglypuff-inspired pink universe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
