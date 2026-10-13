import type { Metadata } from "next";
import "./globals.css";
import "./styles/markdownStyles.css";
import { Analytics } from "@vercel/analytics/next";
import SakuraPetals from "@/../components/SakuraPetals";
import Splash from "@/../components/Splash";
import CowAbduction from "@/../components/CowAbduction";
import { getProfile } from "@/../lib/profile";
import { avatarSpec } from "@/../lib/catalog";

export const metadata: Metadata = {
  title: "Julia Lazar's miscellaneous blog",
  description:
    "Personal notes on QA, test automation, frontend and whatever I am learning lately, from a Genin Tester in training.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const spec = avatarSpec(getProfile());

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&family=Press+Start+2P&family=JetBrains+Mono:wght@400;600&family=Noto+Sans+JP:wght@500;700;900&display=swap"
        />
      </head>
      <body>
        <SakuraPetals />
        <Splash spec={spec} />
        <CowAbduction />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
