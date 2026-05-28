import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOVA COMMUNITY",
  description: "Building Future Innovation Together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
