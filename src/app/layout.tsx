import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Spotlight } from "@/components/Spotlight";
import "./globals.css";

// Fraunces (OFL, see src/fonts/Fraunces-OFL.txt), self-hosted with the optical-size axis
// pinned at 72: it looks the same as the full variable font at our sizes, keeps the SOFT and
// WONK axes the design uses, and weighs 148 KB instead of 264 KB.
const fraunces = localFont({
  variable: "--font-fraunces",
  src: [
    { path: "../fonts/fraunces-opsz72-latin-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../fonts/fraunces-opsz72-latin-italic.woff2", weight: "100 900", style: "italic" },
  ],
  display: "swap",
  fallback: ["Georgia", "serif"],
});
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Have you met Ali? · No-code developer & product manager", template: "%s · Ali Farghaly" },
  description:
    "Ali Farghaly, no-code developer (Bubble.io) and product manager. Problem first: product discovery, requirements, MVP development, agile delivery, QA testing and technical documentation, one person from the problem to a product your team can run.",
  keywords: [
    "no-code developer",
    "Bubble.io developer",
    "product manager",
    "product discovery",
    "requirements gathering",
    "MVP development",
    "agile delivery",
    "sprint planning",
    "QA testing",
    "technical documentation",
    "process automation",
    "digital transformation",
    "admin dashboards",
    "web and mobile apps",
  ],
};

// Runs before paint so the theme never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem('theme')==='dark'?'dark':'light';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grain min-h-dvh">
        <SmoothScroll />
        <Spotlight />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
