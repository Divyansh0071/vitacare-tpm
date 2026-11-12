import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VitaCare – Quarantine Management System",
  description: "Comprehensive quarantine and patient monitoring system for healthcare and safety personnel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {children}
      </body>
    </html>
  );
}
