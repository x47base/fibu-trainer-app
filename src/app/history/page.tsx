"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

interface TaskHistoryEntry {
    taskId: string;
    isCorrect: boolean;
    wrongValue?: any;
}

interface ExamEntry {
    date: string;
    correct: number;
    maxPoints: number;
    percentage: number;
    grade: number;
    tasks: TaskHistoryEntry[];
    tags: string[];
}

interface TaskDetails {
    _id: string;
    content: { question?: string; scenario?: string };
    type: string;
}

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [examHistory, setExamHistory] = useState<ExamEntry[]>([]);
    const [selectedExam, setSelectedExam] = useState<ExamEntry | null>(null);
    const [taskDetails, setTaskDetails] = useState<{ [key: string]: TaskDetails }>({});

    useEffect(() => {
        if (status === "loading") return;
        if (!session || status === "unauthenticated") {
            router.push("/signin");
        } else {
            fetchExamHistory();
        }
    }, [session, status, router]);

    const fetchExamHistory = async () => {
        try {
            const response = await fetch("/api/user/exams");
            if (!response.ok) throw new Error(`Failed to fetch exam history: ${response.status}`);
            const exams = await response.json();
            const sortedExams = exams.sort((a: ExamEntry, b: ExamEntry) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setExamHistory(sortedExams);
            const taskIds = new Set<string>();
            exams.forEach((exam: ExamEntry) => {
                exam.tasks.forEach((task) => taskIds.add(task.taskId));
            });
            if (taskIds.size > 0) {
                const taskResponse = await fetch(`/api/tasks?ids=${Array.from(taskIds).join(",")}`);
                if (!taskResponse.ok) throw new Error(`Failed to fetch tasks: ${taskResponse.status}`);
                const tasks: TaskDetails[] = await taskResponse.json();
                const taskMap = tasks.reduce((acc, task) => {
                    acc[task._id] = task;
                    return acc;
                }, {} as { [key: string]: TaskDetails });
                setTaskDetails(taskMap);
            }
        } catch (error) {
            console.error("Error fetching exam history:", error);
        }
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

            {/* Exam History Overview */}
            {!selectedExam ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl"
                >
                    {examHistory.length > 0 ? (
                        <div className="space-y-4">
                            {examHistory.map((exam, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    whileHover={{ y: -2 }}
                                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setSelectedExam(exam)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <FaCalendarAlt className="text-themecolor text-lg" />
                                            <div>
                                                <h3 className="text-md font-medium text-gray-800">
                                                    {new Date(exam.date).toLocaleDateString("de-DE", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </h3>
                                                <p className="text-sm text-gray-500">{exam.tags.join(", ") || "Keine Tags"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-themecolor">{exam.percentage.toFixed(0)}%</p>
                                            <p className="text-xs text-gray-500">
                                                {exam.correct}/{exam.maxPoints}
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
                                onClick={() => setSelectedExam(null)}
                                className="flex items-center text-themecolor hover:text-themecolorhover text-sm font-medium transition-colors"
                            >
                                <FaArrowLeft className="mr-2" /> Zurück
                            </button>
                            <div className="text-right">
                                <p className="text-xl font-bold text-themecolor">{selectedExam.percentage.toFixed(0)}%</p>
                                <p className="text-xs text-gray-500">
                                    {selectedExam.correct}/{selectedExam.maxPoints}
                                </p>
                            </div>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            {new Date(selectedExam.date).toLocaleDateString("de-DE", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">{selectedExam.tags.join(", ") || "Keine Tags"}</p>

                        {/* Task List */}
                        <div className="space-y-3">
                            {selectedExam.tasks.map((task, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-100 rounded-md"
                                >
                                    <div>
                                        <p className="text-sm text-gray-800">
                                            {taskDetails[task.taskId]?.content?.question ||
                                             taskDetails[task.taskId]?.content?.scenario ||
                                             `Aufgabe ${task.taskId}`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {taskDetails[task.taskId]?.type || "Unbekannt"}
                                        </p>
                                    </div>
                                    {task.isCorrect ? (
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