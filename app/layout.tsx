import type { Metadata } from "next";
import "@reactor-team/ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "First Day — Alden Hall",
  description:
    "A first day at Alden Hall. Talk to the people on the grounds — live Vidu S2 avatars on Reactor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0c1210] text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
