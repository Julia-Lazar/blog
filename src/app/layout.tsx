import type { Metadata } from "next";
import "./globals.css";
import "./styles/markdownStyles.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Julia Lazar's miscellaneous blog",
  description:
    "Personal notes on frontend, QA, projects, and whatever I am learning lately, all in a very pink corner of the internet.",
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
