"use client";
import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import UserHead from "./UserHead";
import links from "@/lib/links";

interface MobileNavFullProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileNavFull({ isOpen, onClose }: MobileNavFullProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-16 left-0 right-0 bottom-0 bg-gray-50 z-50 overflow-auto p-6 pl-8 pr-8 shadow-lg"
                >
                    <div className="flex flex-col gap-6">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.path}
                                onClick={onClose}
                                className="text-xl font-medium text-themecolor hover:text-themecolorhover transition-colors duration-200 py-2"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="border-t border-gray-200 pt-6">
                            <UserHead onLinkClick={onClose} />
                        </div>
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    );
}