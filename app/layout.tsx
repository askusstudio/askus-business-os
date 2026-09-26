import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

// @ts-ignore
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Best Digital Marketing Agency in Lucknow | SEO, PPC & Website Development",
  description: "Leading digital marketing agency in Lucknow providing SEO services, Google Ads, social media marketing, website development and AI automation solutions.",
};

// Mobile viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden w-full relative`}
      >
        {children}

        {/* Floating Call Now Button (Mobile friendly, desktop par smooth cornered) */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 z-50">
          <a
            href="tel:+919876543210"
            aria-label="Call Now"
            className="flex items-center gap-2 bg-[#bbf770] hover:bg-[#a8f255] text-black font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                clipRule="evenodd"
              />
            </svg>
            <span>Call Now</span>
          </a>
        </div>

        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}