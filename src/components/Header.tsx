"use client";
import links from "@/lib/links";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import UserHead from "./UserHead";
import { CgMenuGridO } from "react-icons/cg";
import { FiX } from "react-icons/fi";
import MobileNavFull from "./MobileNavFull";
import { useState } from "react";

export default function Header() {
    const pathname = usePathname();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const toggleMobileNav = () => setMobileNavOpen((prev) => !prev);

    return (
        <header className="flex items-center h-16 px-8 z-40">
            <div className="flex-1">
                <Link href="/">
                    {/* Desktop Title */}
                    <h1 className="hidden md:block font-bold text-themecolor text-2xl">
                        FiBu-Trainer
                    </h1>
                    {/* Mobile Title */}
                    <h1 className="block md:hidden font-bold text-themecolor text-2xl">
                        FiBu-Trainer
                    </h1>
                </Link>
            </div>
            {/* Desktop Nav Links */}
            <div className="hidden md:flex flex-1 justify-center">
                <nav className="flex gap-10">
                    {links.map((link, index) => {
                        const isActive = pathname === link.path;

                        return (
                            <Link key={index} href={link.path} className="relative group">
                                <motion.span
                                    className={`font-medium text-gray-700 ${isActive
                                            ? "text-themecolor font-semibold"
                                            : "hover:text-themecolorhover"
                                        } relative z-10`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    {link.name}
                                </motion.span>
                                {/* Gamified Hintergrund-Animation */}
                                <motion.span
                                    className="absolute inset-0 bg-themecolor/20 rounded-md z-0" // Hellerer Farbton für Kontrast
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileHover={{ scale: 1.2, opacity: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                                {/* Aktiver Zustand: Unterstrich */}
                                {isActive && (
                                    <motion.span
                                        className="absolute bottom-[-8px] left-0 w-full h-1 bg-themecolor rounded-full"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        exit={{ scaleX: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            {/* Desktop UserHead Nav */}
            <div className="hidden md:flex flex-1 justify-end">
                <UserHead />
            </div>
            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden flex-1 justify-end">
                <button onClick={toggleMobileNav}>
                    {mobileNavOpen ? (
                        <FiX className="h-7 w-7 text-themecolor" />
                    ) : (
                        <CgMenuGridO className="h-7 w-7 text-themecolor" />
                    )}
                </button>
            </div>
            <MobileNavFull isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        </header>
    );
}