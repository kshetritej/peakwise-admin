import { ReactNode } from "react";
import "./globals.css";
import { outfit } from "@/lib/font";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
