import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LandTrust BD | ভূমি লেনদেন যাচাই",
  description: "A Bangla-first land verification experience with record comparison, explainable fraud-risk analysis, provisional lock and tamper-evident verification.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
