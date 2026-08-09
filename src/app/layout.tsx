import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";

export const metadata: Metadata = {
  title: "Snapcart | 10 minutes delivery app",
  description: "The ultimate 10-minutes delivery app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen bg-linear-to-b from-green-100 to-white">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
