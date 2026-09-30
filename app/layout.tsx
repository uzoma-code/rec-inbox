import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AppNav } from "@/components/app-nav";
import { AppProviders } from "@/components/app-providers";
import { hasDatabase } from "@/lib/db";
import { getSeedRecs } from "@/lib/seed";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Rec Inbox",
  description: "The inbox for movies your friends told you to watch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <AppProviders seedRecs={getSeedRecs()} hasDatabase={hasDatabase()}>
          <AppNav />
          <main className="mx-auto max-w-[720px] px-6 py-10 md:px-8">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
