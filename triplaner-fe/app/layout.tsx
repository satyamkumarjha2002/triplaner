import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModalProvider } from "@/context/ModalContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { HealthChecker } from "@/components/HealthChecker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Planit - Collaborative Trip Planning",
  description: "Plan your trips together with friends and family",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <ModalProvider>
              {children}
            </ModalProvider>
          </AuthProvider>
          <HealthChecker />
          <ConnectionStatus />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
