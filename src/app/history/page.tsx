"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

interface TaskHistoryEntry {
    taskId: number;
    correct: boolean;
    completedAt: Date;
}

interface TestEntry {
    testThemes: string[];
    testScore: number;
    testDate: Date;
    testTasks: TaskHistoryEntry[];
}

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [testHistory, setTestHistory] = useState<TestEntry[]>([]);
    const [selectedTest, setSelectedTest] = useState<TestEntry | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        // @ts-expect-error: status should be a property.
        if (!session || status === "unauthenticated") {
            router.push("/signin");
        } else {
            const sortedHistory = [...placeholderTestHistory].sort((a, b) => b.testDate.getTime() - a.testDate.getTime());
            setTestHistory(sortedHistory);
            // TODO: Replace with real data fetch when available
            // const fetchTestHistory = async () => {
            //   const userId = Number(session.user.id);
            //   const { users } = await import("@/lib/tasks").then((m) => m.getCollections());
            //   const user = await users.findOne({ userId });
            //   setTestHistory(user?.testHistory || []);
            // };
            // fetchTestHistory();
        }
    }, [session, status, router]);

    const placeholderTestHistory: TestEntry[] = [
        {
            testThemes: ["Grundlagen der Buchhaltung", "Bilanzierung"],
            testScore: 60,
            testDate: new Date("2025-02-10T10:00:00"),
            testTasks: [
                { taskId: 1, correct: true, completedAt: new Date("2025-02-10T10:02:00") },
                { taskId: 2, correct: false, completedAt: new Date("2025-02-10T10:03:00") },
                { taskId: 3, correct: true, completedAt: new Date("2025-02-10T10:04:00") },
                { taskId: 4, correct: true, completedAt: new Date("2025-02-10T10:05:00") },
                { taskId: 5, correct: false, completedAt: new Date("2025-02-10T10:06:00") },
            ],
        },
        {
            testThemes: ["Kostenrechnung", "Jahresabschluss"],
            testScore: 60,
            testDate: new Date("2025-02-18T14:30:00"),
            testTasks: [
                { taskId: 6, correct: true, completedAt: new Date("2025-02-18T14:32:00") },
                { taskId: 7, correct: false, completedAt: new Date("2025-02-18T14:33:00") },
                { taskId: 8, correct: true, completedAt: new Date("2025-02-18T14:34:00") },
                { taskId: 9, correct: false, completedAt: new Date("2025-02-18T14:35:00") },
                { taskId: 10, correct: true, completedAt: new Date("2025-02-18T14:36:00") },
            ],
        },
        {
            testThemes: ["Mehrwertsteuer", "Finanzbuchhaltung"],
            testScore: 80,
            testDate: new Date("2025-02-25T09:00:00"),
            testTasks: [
                { taskId: 11, correct: true, completedAt: new Date("2025-02-25T09:02:00") },
                { taskId: 12, correct: true, completedAt: new Date("2025-02-25T09:03:00") },
                { taskId: 13, correct: false, completedAt: new Date("2025-02-25T09:04:00") },
                { taskId: 14, correct: true, completedAt: new Date("2025-02-25T09:05:00") },
                { taskId: 15, correct: true, completedAt: new Date("2025-02-25T09:06:00") },
            ],
        },
    ];

    // Placeholder Tasks for Display
    const placeholderTasks: { [key: number]: { question: string; type: string } } = {
        1: { question: "Buchen Sie: Kauf von Waren für 1000CHF.", type: "booking" },
        2: { question: "Was ist ein Aktivkonto?", type: "multiple-choice" },
        3: { question: "Die Umsatzerlöse erhöhen das ___.", type: "text" },
        4: { question: "Ordnen Sie die Begriffe den Bilanzpositionen zu.", type: "drag-drop" },
        5: { question: "Buchen Sie: Zahlung einer Rechnung über 500CHF.", type: "booking" },
        6: { question: "Buchen Sie: Materialeinkauf für 1200CHF.", type: "booking" },
        7: { question: "Die Kostenrechnung dient der ___ Ermittlung.", type: "text" },
        8: { question: "Was bedeutet FIFO?", type: "multiple-choice" },
        9: { question: "Erstellen Sie eine Kostenstellenrechnung.", type: "drag-drop" },
        10: { question: "Buchen Sie: Verkauf von Dienstleistungen für 2000CHF.", type: "booking" },
        11: { question: "Buchen Sie: Umsatzsteuerzahlung von 600CHF.", type: "booking" },
        12: { question: "Die Körperschaftsteuer beträgt ___ Prozent.", type: "text" },
        13: { question: "Was ist die Vorsteuer?", type: "multiple-choice" },
        14: { question: "Ordnen Sie Steuerarten den Bereichen zu.", type: "drag-drop" },
        15: { question: "Buchen Sie: Warenverkauf bar 1300CHF.", type: "booking" },
    };

    if (status === "loading") {
        return <div className="text-center mt-20 text-gray-600">Loading... Bitte warten oder Seite aktualisieren.</div>;
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center py-12 px-4 mt-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-10 w-full max-w-2xl"
            >
                <h1 className="text-3xl font-semibold text-themecolor">Testhistorie</h1>
                <p className="mt-2 text-gray-600">Sieh dir deine bisherigen Tests und Ergebnisse an.</p>
            </motion.div>

            {/* Test History Overview */}
            {!selectedTest ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl"
                >
                    {testHistory.length > 0 ? (
                        <div className="space-y-4">
                            {testHistory.map((test, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    whileHover={{ y: -2 }}
                                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setSelectedTest(test)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <FaCalendarAlt className="text-themecolor text-lg" />
                                            <div>
                                                <h3 className="text-md font-medium text-gray-800">
                                                    {test.testDate.toLocaleDateString("de-DE", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </h3>
                                                <p className="text-sm text-gray-500">{test.testThemes.join(", ")}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-themecolor">{test.testScore}%</p>
                                            <p className="text-xs text-gray-500">
                                                {test.testTasks.filter((t) => t.correct).length}/{test.testTasks.length}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200 w-full"
                        >
                            <p className="text-gray-600">Noch keine Tests absolviert.</p>
                            <p className="text-sm text-gray-500 mt-1">Starte einen Test, um hier deine Ergebnisse zu sehen!</p>
                        </motion.div>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl"
                >
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setSelectedTest(null)}
                                className="flex items-center text-themecolor hover:text-themecolorhover text-sm font-medium transition-colors"
                            >
                                <FaArrowLeft className="mr-2" /> Zurück
                            </button>
                            <div className="text-right">
                                <p className="text-xl font-bold text-themecolor">{selectedTest.testScore}%</p>
                                <p className="text-xs text-gray-500">
                                    {selectedTest.testTasks.filter((t) => t.correct).length}/{selectedTest.testTasks.length}
                                </p>
                            </div>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            {selectedTest.testDate.toLocaleDateString("de-DE", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">{selectedTest.testThemes.join(", ")}</p>

                        {/* Task List */}
                        <div className="space-y-3">
                            {selectedTest.testTasks.map((task, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-100 rounded-md"
                                >
                                    <div>
                                        <p className="text-sm text-gray-800">
                                            {placeholderTasks[task.taskId]?.question || `Aufgabe ${task.taskId}`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {placeholderTasks[task.taskId]?.type || "Unbekannt"}
                                        </p>
                                    </div>
                                    {task.correct ? (
                                        <FaCheckCircle className="text-green-500 text-lg" />
                                    ) : (
                                        <FaTimesCircle className="text-red-500 text-lg" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}