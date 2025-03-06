import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/NextAuthProvider";
import "./globals.css";
import BackgroundGrid from "@/components/BackgroundGrid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "FiBu-Trainer | Finance & Accounting Game",
    description: "Learn finance and accounting through an interactive game experience.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
                <AuthProvider>
                    <BackgroundGrid />
                    <Header />
                    <div className="relative z-0">{children}</div>
                    <div className="bg-white w-screen min-w-max pt-1 pb-1">
                        <Footer />
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}