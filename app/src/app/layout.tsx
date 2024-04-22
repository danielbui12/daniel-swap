import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./antd.override.css";
import SolanaWalletContext from "@/app/context/SolanaWalletContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Daniel Swap",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body className={`w-full ${inter.className}`}>
            <SolanaWalletContext>
                {children}
            </SolanaWalletContext>
        </body>
    </html>
  );
}
