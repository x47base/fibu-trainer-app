"use client";
import { IoArrowForwardSharp } from "react-icons/io5";
import { FaChartLine, FaClock, FaFolderPlus } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center pt-40 pb-24 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-10/12 md:max-w-3xl text-4xl md:text-5xl font-bold text-themecolor tracking-tight"
        >
          Dein Rechnungswesen<br />Trainer
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-10/12 md:max-w-xl mt-6 text-gray-600 text-lg md:text-xl"
        >
          Übe Buchhaltung mit Live-Feedback und baue dir deine eigenen Tests – wie ein Profi!
        </motion.p>
        <Link href="/train">
          <motion.div
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 mt-10 px-6 py-3 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover cursor-pointer"
          >
            Jetzt starten <IoArrowForwardSharp className="text-xl" />
          </motion.div>
        </Link>
      </main>

      {/* Features Section */}
      
    </div>
  );
}