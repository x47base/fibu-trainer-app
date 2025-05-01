"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBook, FaQuestionCircle, FaCheckSquare, FaTextHeight, FaTasks } from "react-icons/fa";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { getCanonicalTaskType } from "@/types/taskTypes";

import Buchung from "@/components/aufgaben/Buchung";
import MultipleChoice from "@/components/aufgaben/MultipleChoice";
import DragDrop from "@/components/aufgaben/DragDrop";
import Texts from "@/components/aufgaben/Texts";

export default function TrainPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [mode, setMode] = useState<"initial" | "training" | "practice">("initial");
    const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [stats, setStats] = useState({ correct: 0, incorrect: 0, notDone: 0 });
    const [showTask, setShowTask] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (!session || status === "unauthenticated") {
            router.push("/signin");
        }
    }, [session, status, router]);

    const fetchTasks = async (taskType: string) => {
        try {
            const canonicalType = getCanonicalTaskType(taskType);
            const response = await fetch(`/api/tasks?type=${canonicalType}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch tasks: ${response.status}`);
            }
            const data = await response.json();
            if (data.length === 0) {
                setError("Keine Aufgaben für diesen Typ verfügbar.");
                setTasks([]);
                setShowTask(false);
                return;
            }
            setTasks(data);
            setStats({ correct: 0, incorrect: 0, notDone: data.length });
            setCurrentTaskIndex(0);
            setShowTask(true);
            setError(null);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setError("Fehler beim Laden der Aufgaben.");
            setTasks([]);
            setShowTask(false);
        }
    };

    useEffect(() => {
        if (selectedTaskType) {
            fetchTasks(selectedTaskType);
        }
    }, [selectedTaskType]);

    if (status === "loading") return <div>Loading... Refresh if screen stays.</div>;

    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        hover: { scale: 1.03, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)", transition: { duration: 0.3 } },
        tap: { scale: 0.98 },
        selected: { borderColor: "#4A90E2", backgroundColor: "#F0F7FF" },
    };

    const taskTypes = [
        { id: "kreuze", title: "Konten Kreuze", description: "Kontenkreuzaufgaben, bei denen ihr die richtigen Beträge im Soll beziehungsweise Haben eintragen müsst.", icon: <FaCheckSquare size={24} /> },
        { id: "buchungen", title: "Buchungen", description: "Allgemeine Buchungssätze", icon: <FaBook size={24} /> },
        { id: "multiple-choice", title: "Multiple Choice", description: "Multiple Choice Fragen zum Thema Finanz- und Rechnungswesen.", icon: <FaQuestionCircle size={24} /> },
        { id: "lueckentext", title: "Lückentext", description: "Lückentextaufgaben: Fülle die Lücken mit dem korrekten Konto.", icon: <FaTextHeight size={24} /> },
    ];

    const handleTaskStart = (type: string) => {
        setSelectedTaskType(type);
    };

    const handleTaskResult = (isCorrect: boolean) => {
        setStats((prev) => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1),
            notDone: prev.notDone - 1,
        }));
    };

    const handleNextTask = () => {
        if (currentTaskIndex < tasks.length - 1) {
            setCurrentTaskIndex((prev) => prev + 1);
        } else {
            setShowTask(false);
        }
    };

    const handleSkipTask = () => {
        handleNextTask(); // Skip to next task without affecting stats
    };

    const handleBack = () => {
        if (showTask) {
            setShowTask(false);
            setSelectedTaskType(null);
            setTasks([]);
            setError(null);
        } else {
            setMode("initial");
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center p-8">
            <main className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mt-6">
                {/* Error Message */}
                {error && (
                    <div className="text-red-500 text-center mb-4">{error}</div>
                )}

                {/* Initial Choice */}
                {mode === "initial" && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-themecolor">Willkommen zum Üben</h2>
                        <p className="text-center text-gray-500 mt-2">Wähle, ob du trainieren oder einen Praxistest machen möchtest.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {[
                                { mode: "training", title: "Trainieren", description: "Übe verschiedene Aufgabenarten, um deine Fähigkeiten zu verbessern." },
                                { mode: "practice", title: "Praxistest", description: "Teste dein Wissen mit einem simulierten Praxistest (Inhalt folgt)." },
                            ].map((option) => (
                                <motion.div
                                    key={option.mode}
                                    variants={cardVariants}
                                    initial="initial"
                                    animate="animate"
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => setMode(option.mode as any)}
                                    className="relative cursor-pointer rounded-xl bg-white p-6 shadow-lg"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <motion.div whileHover={{ rotate: 10, scale: 1.2 }} className="rounded-full bg-themecolor/10 p-3 text-themecolor">
                                            <FaTasks size={24} />
                                        </motion.div>
                                        <h3 className="text-xl font-semibold text-themecolor">{option.title}</h3>
                                        <p className="text-sm text-gray-500 text-center">{option.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {/* Task Type Selection */}
                {mode === "training" && !showTask && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-themecolor">Trainingsaufgaben auswählen</h2>
                        <p className="text-center text-gray-500 mt-2">Wähle die Art der Aufgabe, die du trainieren möchtest.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {taskTypes.map((task) => (
                                <motion.div
                                    key={task.id}
                                    variants={cardVariants}
                                    initial="initial"
                                    animate="animate"
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => handleTaskStart(task.id)}
                                    className="relative cursor-pointer rounded-xl bg-white p-6 shadow-lg border-2 border-transparent"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <motion.div whileHover={{ rotate: 10, scale: 1.2 }} className="rounded-full bg-themecolor/10 p-3 text-themecolor">
                                            {task.icon}
                                        </motion.div>
                                        <h3 className="text-xl font-semibold text-themecolor">{task.title}</h3>
                                        <p className="text-sm text-gray-500 text-center">{task.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {/* Task Display */}
                {mode === "training" && showTask && tasks.length > 0 && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-themecolor mb-4">
                            Aufgabe {currentTaskIndex + 1} von {tasks.length}
                        </h2>
                        {selectedTaskType === "buchungen" && (
                            <Buchung
                                task={tasks[currentTaskIndex]}
                                stats={stats}
                                onResult={handleTaskResult}
                                onNext={handleNextTask}
                                onSkip={handleSkipTask}
                                onBack={handleBack}
                            />
                        )}
                        {selectedTaskType === "multiple-choice" && (
                            <MultipleChoice
                                task={tasks[currentTaskIndex]}
                                stats={stats}
                                onResult={handleTaskResult}
                                onNext={handleNextTask}
                                onSkip={handleSkipTask}
                                onBack={handleBack}
                            />
                        )}
                        {selectedTaskType === "lueckentext" && (
                            <Texts
                                task={tasks[currentTaskIndex]}
                                stats={stats}
                                onResult={handleTaskResult}
                                onNext={handleNextTask}
                                onSkip={handleSkipTask}
                                onBack={handleBack}
                            />
                        )}
                        {selectedTaskType === "kreuze" && (
                            <DragDrop
                                task={tasks[currentTaskIndex]}
                                stats={stats}
                                onResult={handleTaskResult}
                                onNext={handleNextTask}
                                onSkip={handleSkipTask}
                                onBack={handleBack}
                            />
                        )}
                    </>
                )}

                {/* All Tasks Completed */}
                {mode === "training" && showTask && tasks.length > 0 && currentTaskIndex >= tasks.length && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-themecolor">Alle Aufgaben abgeschlossen!</h2>
                        <div className="flex justify-center mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-themecolor mb-2 text-center">Statistiken</h3>
                                <div className="flex justify-center">
                                    <PieChart width={80} height={80}>
                                        <Pie
                                            data={[
                                                { name: "Richtig", value: stats.correct, color: "#22C55E" },
                                                { name: "Falsch", value: stats.incorrect, color: "#EF4444" },
                                                { name: "Offen", value: stats.notDone, color: "#9CA3AF" },
                                            ]}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={35}
                                        >
                                            {[
                                                { color: "#22C55E" },
                                                { color: "#EF4444" },
                                                { color: "#9CA3AF" },
                                            ].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </div>
                                <div className="flex justify-center gap-3 mt-2 text-xs">
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span>R: {stats.correct}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        <span>F: {stats.incorrect}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                        <span>O: {stats.notDone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 mt-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBack}
                                className="px-6 py-3 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover"
                            >
                                Zurück zur Auswahl
                            </motion.button>
                        </div>
                    </>
                )}

                {/* Practice Test Placeholder */}
                {mode === "practice" && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-themecolor">Praxistest</h2>
                        <p className="text-center text-gray-500 mt-2">Der Praxistest ist noch in Entwicklung. Bitte kehre zum Training zurück oder überprüfe später erneut.</p>
                        <div className="flex justify-center mt-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setMode("initial")}
                                className="px-6 py-3 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover"
                            >
                                Zurück
                            </motion.button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}