import type { Metadata } from "next";
import { DM_Sans, Fredoka } from "next/font/google";
import { StoreProvider } from "@/components/store-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const body = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
const display = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });

export const metadata: Metadata = {
  title: { default: "LittleJoy Toys | Little things, big joy", template: "%s | LittleJoy Toys" },
  description: "Thoughtful toys for curious little minds. Shop joyful, safe toys with delivery across Bangladesh.",
  openGraph: { title: "LittleJoy Toys", description: "Little things, big joy.", type: "website" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable}`}>
        <StoreProvider>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
