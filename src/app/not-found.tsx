"use client";
import { IoArrowForwardSharp } from "react-icons/io5";
import { FaExclamationTriangle } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";
import BackgroundGrid from "@/components/BackgroundGrid";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex flex-col z-10 items-center justify-center px-6 text-center bg-white">
      {/* Background Grid */}
      <BackgroundGrid />

      {/* 404 Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center"
      >
        <FaExclamationTriangle className="text-6xl md:text-8xl text-themecolor mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold text-themecolor tracking-tight">
          404 - Seite nicht gefunden
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 text-gray-600 text-lg md:text-xl max-w-md"
        >
          Ups! Es sieht so aus, als hätten wir uns verlaufen. Diese Seite existiert nicht (mehr).
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative z-10 mt-12"
      >
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 px-6 py-3 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover cursor-pointer"
          >
            Zurück zur Startseite <IoArrowForwardSharp className="text-xl" />
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}