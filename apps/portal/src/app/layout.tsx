import type { Metadata } from "next";
import "./globals.css";
import RootProvider from "@/components/providers/RootProvider";

export const metadata: Metadata = {
  title: "Sahab Digital",
  description: "Sahab Management System",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
