import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { ChatWindow } from "@/components/ChatWindow";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";

import { AppSidebar } from "../components/AppSidebar";
import Navbar from "../components/Navbar";
import { ThemeProvider } from "../components/theme-provider";

import type { Metadata } from "next";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Netty",
  description: "Место для общения и поиска единомышленников",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ChatProvider>
            <AuthProvider>
              <SidebarProvider>
                <div className="flex flex-col min-h-screen w-full relative">
                  <Navbar />
                  <div className="flex flex-1">
                    <AppSidebar />
                    <main className="flex-1 w-full">{children}</main>
                  </div>
                </div>
                <ChatWindow />
                <Toaster position="top-center" theme="system" richColors />
              </SidebarProvider>
            </AuthProvider>
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
