import type { Metadata } from "next";
import { Toaster } from "@/lib/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taxmate | Modern Tax Compliance for Nigerians",
  description: "Taxmate is a secure, Web3-powered platform specifically tailored to help Nigerians seamlessly manage and fulfill their tax obligations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-background text-foreground"
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
