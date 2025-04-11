"use client";
import { useRouter } from "next/navigation";
import { FaTasks } from "react-icons/fa";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const router = useRouter();

    return (
        <div className="text-center mt-24">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-themecolor mb-6"
            >
                Willkommen im Dashboard für Lehrpersonen
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-gray-600 mb-8"
            >
                Verwalte Aufgaben, erstelle neue Übungen und exportiere sie für deine Schüler.
            </motion.p>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/tasks")}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover"
            >
                <FaTasks /> Zu den Aufgaben
            </motion.button>
        </div>
    );
}