import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MH Visuals — Creative Portfolio",
    template: "%s · MH Visuals",
  },
  description:
    "A home for graphic designers, 3D artists, packaging specialists and visual creators to showcase projects, get appreciated and collaborate.",
};

const themeScript = `
(function () {
  try {
    var t = localStorage.getItem("mh-theme");
    if (t === "light") document.documentElement.classList.add("light");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-bg font-sans text-text antialiased">
        <Navbar />
        <main className="mx-auto w-full max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
