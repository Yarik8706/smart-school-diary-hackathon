import type { Metadata } from "next";
import { Inter } from "next/font/google";

import AppShell from "@/components/layout/app-shell";

import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Smart School Diary",
  description: "Учебный дневник с расписанием, домашкой и напоминаниями",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
