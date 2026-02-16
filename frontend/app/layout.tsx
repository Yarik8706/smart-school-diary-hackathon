import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart School Diary",
  description: "Frontend foundation for Smart School Diary",
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
