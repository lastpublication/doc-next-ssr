import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Doc SSR Demo",
  description: "Demo Next.js app showing the @todo/doc-next-ssr package.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-stone-900 antialiased">
        <main>{children}</main>
      </body>
    </html>
  );
}
