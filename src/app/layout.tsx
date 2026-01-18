import type { Metadata } from "next";
import "./globals.css";
import { AuctionProvider } from "@/lib/store";
import { Header } from "@/components/ui/header";

export const metadata: Metadata = {
  title: "My Auction",
  description: "Advanced Player Auction System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <AuctionProvider>
          <Header />
          <main className="flex-1 w-full relative">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px]" />
            </div>
            {children}
          </main>
        </AuctionProvider>
      </body>
    </html>
  );
}
