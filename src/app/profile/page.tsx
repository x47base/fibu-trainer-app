"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrophy, FaMedal, FaStar, FaBook } from "react-icons/fa";
import { motion } from "framer-motion";

interface Badge {
    id: string;
    name: string;
    description: string;
    awardedAt: string;
}

interface UserStats {
    fullName: string;
    totalTasksSolved: number;
    averageAccuracy: number;
    examsTaken: number;
    averageExamScore: number;
    bestExamScore: number;
    badges: Badge[];
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userStats, setUserStats] = useState<UserStats | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (!session || status === "unauthenticated") {
            router.push("/signin");
        } else {
            fetchUserStats();
        }
    }, [session, status, router]);

    const fetchUserStats = async () => {
        try {
            const response = await fetch("/api/user/profile");
            if (!response.ok) {
                throw new Error(`Failed to fetch user stats: ${response.status}`);
            }
            const data = await response.json();
            setUserStats(data);
        } catch (error) {
            console.error("Error fetching user stats:", error);
            setUserStats({
                fullName: session?.user?.name || session?.user?.email?.split("@")[0] || "Unbekannter Nutzer",
                totalTasksSolved: 0,
                averageAccuracy: 0,
                examsTaken: 0,
                averageExamScore: 0,
                bestExamScore: 0,
                badges: [],
            });
        }
    };

    if (status === "loading") {
        return <div className="text-center mt-20 text-gray-600">Lade Profil... Bitte warten.</div>;
    }

    if (!userStats) {
        return null;
    }

    const badgeIcons: { [key: string]: JSX.Element } = {
        "first-exam": <FaStar className="text-yellow-400" />,
        "high-scorer": <FaMedal className="text-gray-400" />,
        "task-master": <FaTrophy className="text-yellow-600" />,
        "exam-veteran": <FaBook className="text-blue-600" />,
        "perfect-score": <FaTrophy className="text-yellow-500" />,
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center py-16 px-6">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-bold text-themecolor tracking-tight">
                    {userStats.fullName}
                </h1>
                <p className="mt-3 text-gray-700 text-lg md:text-xl">Dein persönlicher Fortschritt</p>
            </motion.div>

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 mb-12"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Statistiken</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center">
                        <h3 className="text-lg font-medium text-gray-700">Gelöste Aufgaben</h3>
                        <p className="mt-2 text-4xl font-bold text-themecolor">{userStats.totalTasksSolved}</p>
                        <p className="mt-1 text-gray-600 text-sm">Insgesamt</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center">
                        <h3 className="text-lg font-medium text-gray-700">Genauigkeit</h3>
                        <p className="mt-2 text-4xl font-bold text-themecolor">
                            {userStats.examsTaken > 0 ? userStats.averageAccuracy.toFixed(1) : "N/A"}%
                        </p>
                        <p className="mt-1 text-gray-600 text-sm">Durchschnitt</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center">
                        <h3 className="text-lg font-medium text-gray-700">Tests absolviert</h3>
                        <p className="mt-2 text-4xl font-bold text-themecolor">{userStats.examsTaken}</p>
                        <p className="mt-1 text-gray-600 text-sm">Insgesamt</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center">
                        <h3 className="text-lg font-medium text-gray-700">Durchschnittliche Punktzahl</h3>
                        <p className="mt-2 text-4xl font-bold text-themecolor">
                            {userStats.examsTaken > 0 ? userStats.averageExamScore.toFixed(1) : "N/A"}%
                        </p>
                        <p className="mt-1 text-gray-600 text-sm">Tests</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center">
                        <h3 className="text-lg font-medium text-gray-700">Beste Punktzahl</h3>
                        <p className="mt-2 text-4xl font-bold text-themecolor">
                            {userStats.examsTaken > 0 ? userStats.bestExamScore.toFixed(1) : "N/A"}%
                        </p>
                        <p className="mt-1 text-gray-600 text-sm">Test</p>
                    </div>
                </div>
            </motion.div>

            {/* Badges Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Deine Abzeichen</h2>
                {userStats.badges.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {userStats.badges.map((badge) => (
                            <motion.div
                                key={badge.id}
                                whileHover={{ scale: 1.1, rotate: 2 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <div className="text-3xl">{badgeIcons[badge.id] || <FaStar className="text-yellow-400" />}</div>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-themecolor">{badge.name}</h3>
                                <p className="mt-1 text-gray-600 text-sm">{badge.description}</p>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 text-center text-lg">
                        Noch keine Abzeichen? Übe weiter, um welche zu verdienen!
                    </p>
                )}
            </motion.div>
        </div>
    );
}