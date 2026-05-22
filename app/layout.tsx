import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Niche Finder | Expert Freedom",
  description:
    "Answer 5 questions about what you've spent 20 years doing — and we'll name the consulting focus that's been hiding in plain sight.",
  openGraph: {
    title: "Free Niche Finder | Expert Freedom",
    description:
      "You already have a niche. You just can't see it yet. Takes 3 minutes.",
    siteName: "Expert Freedom",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
