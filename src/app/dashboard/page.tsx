"use client";
import { useRouter } from "next/navigation";
import { FaTasks } from "react-icons/fa";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const router = useRouter();

    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } },
        hover: {
            scale: 1.03,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            transition: { duration: 0.3 },
        },
        tap: { scale: 0.98 },
    };

    return (
        <div className="text-center mt-24">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-themecolor mb-6"
            >
                Willkommen im Dashboard
            </motion.h1>
            <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                onClick={() => router.push("/dashboard/tasks")}
                className="relative mx-auto w-80 max-w-md cursor-pointer overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:bg-themecolorhover/10"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-themecolor/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative flex flex-col items-center gap-4">
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.2 }}
                        className="rounded-full bg-themecolor/10 p-3 text-themecolor"
                    >
                        <FaTasks size={24} />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-themecolor">
                        Zu den Aufgaben
                    </h2>
                    <p className="text-sm text-gray-500">
                        Verwalte und erstelle Aufgaben für dich selber oder als Admin für alle.
                    </p>
                    <motion.div
                        className="mt-2 inline-block rounded-lg bg-themecolor px-4 py-2 text-sm font-medium text-white hover:bg-themecolorhover"
                        whileHover={{ scale: 1.05 }}
                    >
                        Jetzt starten
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
