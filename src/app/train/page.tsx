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
import BadgePopup from "@/components/BadgePopup";

interface Badge {
    id: string;
    name: string;
    description: string;
    awardedAt: string;
}

export default function TrainPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [mode, setMode] = useState<"initial" | "training" | "practice" | "practiceSelect">("initial");
    const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [stats, setStats] = useState({ correct: 0, incorrect: 0, notDone: 0 });
    const [showTask, setShowTask] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedTaskTypes, setSelectedTaskTypes] = useState<string[]>([]);
    const [examResults, setExamResults] = useState<any[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [taskAttempts, setTaskAttempts] = useState<Set<string>>(new Set());
    const [newBadges, setNewBadges] = useState<Badge[]>([]);
    const [taskResultProcessed, setTaskResultProcessed] = useState(false);
    const [isExamComplete, setIsExamComplete] = useState(false);

    useEffect(() => {
        if (status === "loading") return;
        if (!session || status === "unauthenticated") {
            router.push("/signin");
        } else {
            fetchTags();
        }
    }, [session, status, router]);

    const fetchTags = async () => {
        try {
            const response = await fetch("/api/tasks?tags=true");
            if (!response.ok) throw new Error(`Failed to fetch tags: ${response.status}`);
            const tags = await response.json();
            console.log("Fetched tags:", tags);
            const validTags = Array.from(new Set(tags.filter((tag: any) => typeof tag === "string" && tag.trim())));
            setAvailableTags(validTags);
        } catch (error) {
            console.error("Error fetching tags:", error);
            setError("Fehler beim Laden der Tags.");
        }
    };

    const fetchTasks = async (taskType: string) => {
        try {
            const canonicalType = getCanonicalTaskType(taskType);
            const response = await fetch(`/api/tasks?type=${canonicalType}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch tasks: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched tasks for type", canonicalType, ":", data);
            if (data.length === 0) {
                setError("Keine Aufgaben für diesen Typ verfügbar.");
                setTasks([]);
                setShowTask(false);
                return;
            }
            setTasks(data);
            setStats({ correct: 0, incorrect: 0, notDone: data.length });
            setSelectedTaskType(taskType);
            setCurrentTaskIndex(0);
            setShowTask(true);
            setError(null);
            setExamResults([]);
            setTaskAttempts(new Set());
            setTaskResultProcessed(false);
            setIsExamComplete(false);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setError("Fehler beim Laden der Aufgaben.");
            setTasks([]);
            setShowTask(false);
        }
    };

    const fetchPracticeTasks = async () => {
        try {
            if (selectedTaskTypes.length === 0) {
                setError("Bitte wähle mindestens einen Aufgabentyp aus.");
                setTasks([]);
                setShowTask(false);
                return;
            }
            const tagsQuery = selectedTags.join(",");
            const typesQuery = selectedTaskTypes.map((type) => getCanonicalTaskType(type)).join(",");
            console.log("Fetching practice tasks with tags:", tagsQuery, "and types:", typesQuery);
            const response = await fetch(
                `/api/tasks?tags=${encodeURIComponent(tagsQuery)}&types=${encodeURIComponent(typesQuery)}`
            );
            if (!response.ok) {
                throw new Error(`Failed to fetch practice tasks: ${response.status}`);
            }
            const allTasks = await response.json();
            console.log("Fetched practice tasks:", allTasks);

            if (!Array.isArray(allTasks) || allTasks.length === 0) {
                setError("Keine Aufgaben für die ausgewählten Tags und Aufgabentypen verfügbar.");
                setTasks([]);
                setShowTask(false);
                return;
            }

            const tasksByType: { [key: string]: any[] } = {};
            selectedTaskTypes.forEach((type) => {
                tasksByType[getCanonicalTaskType(type)] = [];
            });
            allTasks.forEach((task: any) => {
                if (tasksByType[task.type]) {
                    tasksByType[task.type].push(task);
                } else {
                    console.warn(`Unknown task type: ${task.type}`, task);
                }
            });
            console.log("Tasks by type:", tasksByType);

            const selectedTasks: any[] = [];
            const types = Object.keys(tasksByType).filter((type) => tasksByType[type].length > 0);
            const maxPerType = Math.ceil(17 / (types.length || 1));

            for (const type of types) {
                const tasks = tasksByType[type];
                const shuffled = tasks.sort(() => 0.5 - Math.random());
                selectedTasks.push(...shuffled.slice(0, Math.min(maxPerType, tasks.length)));
            }

            const finalTasks = selectedTasks.sort(() => 0.5 - Math.random()).slice(0, 17);
            console.log("Final selected tasks:", finalTasks);

            if (finalTasks.length === 0) {
                setError("Keine Aufgaben für die ausgewählten Tags und Aufgabentypen verfügbar.");
                setTasks([]);
                setShowTask(false);
                return;
            }

            setTasks(finalTasks);
            setStats({ correct: 0, incorrect: 0, notDone: finalTasks.length });
            setCurrentTaskIndex(0);
            setShowTask(true);
            setError(null);
            setExamResults([]);
            setTaskAttempts(new Set());
            setTaskResultProcessed(false);
            setIsExamComplete(false);
        } catch (error) {
            console.error("Error fetching practice tasks:", error);
            setError(`Fehler beim Laden der Aufgaben: ${error.message}`);
            setTasks([]);
            setShowTask(false);
        }
    };

    const handleTaskStart = (type: string) => {
        setSelectedTaskType(type);
        fetchTasks(type);
    };

    const handleTaskResult = (isCorrect: boolean, wrongValue?: any) => {
        const taskId = tasks[currentTaskIndex]._id;
        if (taskAttempts.has(taskId)) {
            return;
        }
        setTaskAttempts((prev) => new Set(prev).add(taskId));
        setStats((prev) => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1),
            notDone: prev.notDone - 1,
        }));
        setExamResults((prev) => [
            ...prev,
            {
                taskId,
                isCorrect,
                wrongValue: isCorrect ? undefined : wrongValue,
            },
        ]);
        setTaskResultProcessed(true);
    };

    const handleNextTask = () => {
        setTaskResultProcessed(false);
        if (currentTaskIndex < tasks.length - 1) {
            setCurrentTaskIndex((prev) => prev + 1);
        } else {
            setIsExamComplete(true);
            if (mode === "practice") {
                saveExamResults();
            }
        }
    };

    const handleSkipTask = () => {
        if (mode === "practice") {
            const taskId = tasks[currentTaskIndex]._id;
            if (!taskAttempts.has(taskId)) {
                setTaskAttempts((prev) => new Set(prev).add(taskId));
                setStats((prev) => ({
                    correct: prev.correct,
                    incorrect: prev.incorrect + 1,
                    notDone: prev.notDone - 1,
                }));
                setExamResults((prev) => [
                    ...prev,
                    {
                        taskId,
                        isCorrect: false,
                        wrongValue: "skipped",
                    },
                ]);
            }
        }
        handleNextTask();
    };

    const handleBack = () => {
        if (showTask) {
            setShowTask(false);
            setSelectedTaskType(null);
            setTasks([]);
            setError(null);
            setTaskAttempts(new Set());
            setTaskResultProcessed(false);
            setIsExamComplete(false);
        } else if (mode === "practiceSelect") {
            setMode("initial");
            setSelectedTags([]);
            setSelectedTaskTypes([]);
        } else {
            setMode("initial");
        }
    };

    const saveExamResults = async () => {
        try {
            const maxPoints = tasks.length;
            const pointsReceived = stats.correct;
            const percentage = (pointsReceived / maxPoints) * 100;
            const grade = (5 / maxPoints) * pointsReceived + 1;

            const examData = {
                date: new Date().toISOString(),
                correct: pointsReceived,
                maxPoints,
                percentage,
                grade,
                tasks: examResults,
                tags: selectedTags,
            };

            console.log("Saving exam results:", examData);

            const response = await fetch("/api/user/exams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(examData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to save exam results: ${response.status} - ${errorData.message || "Unknown error"}`);
            }
            console.log("Exam results saved successfully:", examData);

            await checkAndAwardBadges(percentage, pointsReceived);
        } catch (error) {
            console.error("Error saving exam results:", error);
            setError(`Fehler beim Speichern der Prüfungsergebnisse: ${error.message}`);
        }
    };

    const checkAndAwardBadges = async (percentage: number, correct: number) => {
        try {
            const statsResponse = await fetch("/api/user/profile");
            if (!statsResponse.ok) throw new Error(`Failed to fetch user stats: ${statsResponse.status}`);
            const userStats = await statsResponse.json();

            const existingBadges = new Set(userStats.badges.map((b: Badge) => b.id));
            const newBadges: Badge[] = [];

            const badges = [
                {
                    id: "first-exam",
                    name: "Erster Test",
                    description: "Absolviere deinen ersten Test",
                    condition: () => userStats.examsTaken === 0,
                },
                {
                    id: "high-scorer",
                    name: "Hochpunktzahler",
                    description: "Erreiche 80% oder mehr in einem Test",
                    condition: () => percentage >= 80,
                },
                {
                    id: "task-master",
                    name: "Aufgabenmeister",
                    description: "Löse 50 Aufgaben korrekt",
                    condition: () => userStats.totalTasksSolved + correct >= 50,
                },
                {
                    id: "exam-veteran",
                    name: "Testveteran",
                    description: "Absolviere 5 Tests",
                    condition: () => userStats.examsTaken + 1 >= 5,
                },
                {
                    id: "perfect-score",
                    name: "Perfekte Punktzahl",
                    description: "Erreiche 100% in einem Test",
                    condition: () => percentage === 100,
                },
            ];

            for (const badge of badges) {
                if (!existingBadges.has(badge.id) && badge.condition()) {
                    const badgeData = {
                        id: badge.id,
                        name: badge.name,
                        description: badge.description,
                        awardedAt: new Date().toISOString(),
                    };
                    newBadges.push(badgeData);
                    existingBadges.add(badge.id);
                }
            }

            if (newBadges.length > 0) {
                const badgeResponse = await fetch("/api/user/badges", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ badges: newBadges }),
                });
                if (!badgeResponse.ok) throw new Error(`Failed to award badges: ${badgeResponse.status}`);
                setNewBadges(newBadges);
            }
        } catch (error) {
            console.error("Error awarding badges:", error);
            setError(`Fehler beim Vergleichen von Abzeichen: ${error.message}`);
        }
    };

    const handleTagToggle = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleTaskTypeToggle = (type: string) => {
        setSelectedTaskTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const startPracticeTest = () => {
        if (selectedTags.length === 0) {
            setError("Bitte wähle mindestens einen Tag aus.");
            return;
        }
        if (selectedTaskTypes.length === 0) {
            setError("Bitte wähle mindestens einen Aufgabentyp aus.");
            return;
        }
        setMode("practice");
        setSelectedTaskType(null);
        fetchPracticeTasks();
    };

    const renderTaskComponent = (task: any) => {
        switch (task.type) {
            case "booking":
                return (
                    <Buchung
                        task={task}
                        stats={stats}
                        onResult={handleTaskResult}
                        onNext={handleNextTask}
                        onSkip={handleSkipTask}
                        onBack={handleBack}
                        mode={mode}
                        resultProcessed={taskResultProcessed}
                    />
                );
            case "multiple-choice":
                return (
                    <MultipleChoice
                        task={task}
                        stats={stats}
                        onResult={handleTaskResult}
                        onNext={handleNextTask}
                        onSkip={handleSkipTask}
                        onBack={handleBack}
                        mode={mode}
                        resultProcessed={taskResultProcessed}
                    />
                );
            case "text":
                return (
                    <Texts
                        task={task}
                        stats={stats}
                        onResult={handleTaskResult}
                        onNext={handleNextTask}
                        onSkip={handleSkipTask}
                        onBack={handleBack}
                        mode={mode}
                        resultProcessed={taskResultProcessed}
                    />
                );
            case "drag-drop":
                return (
                    <DragDrop
                        task={task}
                        stats={stats}
                        onResult={handleTaskResult}
                        onNext={handleNextTask}
                        onSkip={handleSkipTask}
                        onBack={handleBack}
                        mode={mode}
                        resultProcessed={taskResultProcessed}
                    />
                );
            default:
                console.warn(`Unsupported task type: ${task.type}`);
                return <div>Unbekannter Aufgabentyp: {task.type}</div>;
        }
    };

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

    return (
        <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center p-8">
            {newBadges.length > 0 && (
                <BadgePopup
                    badges={newBadges}
                    onClose={() => setNewBadges([])}
                />
            )}
            <main className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mt-6">
                {error && (
                    <div className="text-red-500 text-center mb-4">{error}</div>
                )}

                {mode === "initial" && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-themecolor">Willkommen zum Üben</h2>
                        <p className="text-center text-gray-500 mt-2">Wähle, ob du trainieren oder einen Praxistest machen möchtest.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {[
                                { mode: "training", title: "Trainieren", description: "Übe verschiedene Aufgabenarten, um deine Fähigkeiten zu verbessern." },
                                { mode: "practiceSelect", title: "Praxistest", description: "Teste dein Wissen mit einem simulierten Praxistest." },
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

                {mode === "practiceSelect" && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-themecolor">Praxistest konfigurieren</h2>
                        <p className="text-center text-gray-500 mt-2">Wähle die Tags und Aufgabentypen für deinen Praxistest.</p>

                        <h3 className="text-xl font-semibold text-themecolor mt-8 mb-4">Tags auswählen</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {availableTags.map((tag, index) => (
                                <motion.div
                                    key={`${tag}-${index}`}
                                    variants={cardVariants}
                                    initial="initial"
                                    animate="animate"
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => handleTagToggle(tag)}
                                    className={`relative cursor-pointer rounded-xl bg-white p-4 shadow-lg border-2 ${
                                        selectedTags.includes(tag) ? "border-themecolor" : "border-transparent"
                                    }`}
                                >
                                    <p className="text-center text-themecolor">{tag}</p>
                                </motion.div>
                            ))}
                        </div>

                        <h3 className="text-xl font-semibold text-themecolor mt-8 mb-4">Aufgabentypen auswählen</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {taskTypes.map((task) => (
                                <motion.div
                                    key={task.id}
                                    variants={cardVariants}
                                    initial="initial"
                                    animate="animate"
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => handleTaskTypeToggle(task.id)}
                                    className={`relative cursor-pointer rounded-xl bg-white p-6 shadow-lg border-2 ${
                                        selectedTaskTypes.includes(task.id) ? "border-themecolor" : "border-transparent"
                                    }`}
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

                        <div className="flex justify-center gap-4 mt-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBack}
                                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600"
                            >
                                Zurück
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startPracticeTest}
                                className="px-6 py-3 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover"
                            >
                                Test starten
                            </motion.button>
                        </div>
                    </>
                )}

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

                {(mode === "training" || mode === "practice") && showTask && tasks.length > 0 && !isExamComplete && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-themecolor mb-4">
                            Aufgabe {currentTaskIndex + 1} von {tasks.length}
                        </h2>
                        {renderTaskComponent(tasks[currentTaskIndex])}
                    </>
                )}

                {(mode === "training" || mode === "practice") && showTask && tasks.length > 0 && isExamComplete && (
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
                                {mode === "practice" && (
                                    <div className="mt-4 text-center">
                                        <p className="text-lg font-semibold">Note: {(5 / tasks.length) * stats.correct + 1}</p>
                                        <p className="text-lg font-semibold">Prozent: {((stats.correct / tasks.length) * 100).toFixed(2)}%</p>
                                    </div>
                                )}
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
            </main>
        </div>
    );
}