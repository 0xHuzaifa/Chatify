import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
//@ts-ignore
import "@/app/globals.css";
import Providers from "./providers";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Messenger - Chat with Anyone",
  description: "Modern messaging app for seamless communication",
  icons: "/favicon.ico",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
