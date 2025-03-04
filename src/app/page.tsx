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
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <FaChartLine className="text-4xl text-themecolor mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Live-Score</h3>
            <p className="mt-2 text-gray-600">
              Sieh sofort, wie gut du beim Üben bist – mit Echtzeit-Feedback zu jeder Aufgabe.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <FaClock className="text-4xl text-themecolor mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Deine History</h3>
            <p className="mt-2 text-gray-600">
              Schau dir vergangene Tests an, analysiere deine Ergebnisse und verbessere dich.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <FaFolderPlus className="text-4xl text-themecolor mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Eigene Tests</h3>
            <p className="mt-2 text-gray-600">
              Stelle dir aus verschiedenen Themenbereiche deinen perfekten Übungstest zusammen.
            </p>
          </motion.div>
        </div>

        <div className="text-center mt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Bereit, dein Wissen zu testen?
          </h2>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Übe mit Lückentexten, Multiple Choice oder Drag & Drop – alles mit persönlicher Auswertung und verlässlichen Aufgaben von Lehrkräften.
          </p>
          <Link href="/train">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover"
            >
              Training beginnen <IoArrowForwardSharp className="text-xl" />
            </motion.div>
          </Link>
        </div>
      </section>
    </div>
  );
}