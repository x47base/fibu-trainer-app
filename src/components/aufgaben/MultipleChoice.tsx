import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

interface MultipleChoiceProps {
    task: any;
    stats: { correct: number; incorrect: number; notDone: number };
    onResult: (isCorrect: boolean, wrongValue?: any) => void;
    onNext: () => void;
    onSkip: () => void;
    onBack: () => void;
    mode: "training" | "practice";
    resultProcessed: boolean;
}

export default function MultipleChoice({ task, stats, onResult, onNext, onSkip, onBack, mode, resultProcessed }: MultipleChoiceProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setHasChecked(false);
    }, [task]);

    if (!task) {
        return <div>Loading...</div>;
    }

    function validateAnswer() {
        const correctAnswerIndex = String(task.content.correctAnswer);
        const selectedIndex = String(task.content.options.indexOf(selectedAnswer));
        const isValid = selectedIndex === correctAnswerIndex;
        setIsCorrect(isValid);
        setHasChecked(true);
        onResult(isValid, isValid ? undefined : selectedAnswer);
    }

    const canProceed = mode === "practice" ? (hasChecked || resultProcessed) : isCorrect;

    const chartData = [
        { name: "Richtig", value: stats.correct, color: "#22C55E" },
        { name: "Falsch", value: stats.incorrect, color: "#EF4444" },
        { name: "Offen", value: stats.notDone, color: "#9CA3AF" },
    ];

    return (
        <div id={`task-${task._id}`} className="p-4 rounded-md">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Task Content */}
                <div className="flex-1">
                    <h2 className="text-3xl font-semibold mb-6 text-center md:text-left">Multiple-Choice Aufgabe</h2>
                    <span className="block mb-6 text-center md:text-left">{task.content.question}</span>
                    <div className="flex flex-col gap-4">
                        {task.content.options.map((option: string, index: number) => (
                            <label
                                key={index}
                                className={`flex items-center gap-3 bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition ${hasChecked && index === parseInt(task.content.correctAnswer) ? "bg-green-100" : ""} ${hasChecked && selectedAnswer === option && !isCorrect ? "bg-red-100" : ""}`}
                            >
                                <input
                                    type="radio"
                                    name="buchung"
                                    value={option}
                                    checked={selectedAnswer === option}
                                    onChange={() => setSelectedAnswer(option)}
                                    className="cursor-pointer"
                                    disabled={hasChecked && mode === "practice"}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Stats UI */}
                <div className="w-full md:w-40 flex flex-col items-center">
                    <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                        <h3 className="text-sm font-semibold text-themecolor mb-2 text-center">Statistiken</h3>
                        <PieChart width={80} height={80}>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={35}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                        <div className="flex justify-center gap-2 mt-2 text-xs">
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
            </div>

            {/* Feedback */}
            {isCorrect !== null && (
                <div className={`mt-4 px-4 py-2 rounded-lg text-white text-center ${isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                    {isCorrect ? "Richtig!" : `Falsch! Die richtige Antwort ist: ${task.content.options[task.content.correctAnswer]}`}
                </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-6 flex-wrap justify-center">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="px-3 py-2 bg-gray-500 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-gray-600"
                >
                    Zurück
                </motion.button>
                {mode === "practice" && !hasChecked && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onSkip}
                        className="px-3 py-2 bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-md hover:bg-gray-400"
                    >
                        Überspringen
                    </motion.button>
                )}
                {!hasChecked && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={validateAnswer}
                        className="px-3 py-2 bg-themecolor text-white text-sm font-semibold rounded-lg shadow-md hover:bg-themecolorhover disabled:bg-gray-400"
                        disabled={!selectedAnswer}
                    >
                        Prüfen
                    </motion.button>
                )}
                {canProceed && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNext}
                        className="px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700"
                    >
                        {mode === "practice" && !isCorrect ? "Weiter" : "Nächste Aufgabe"}
                    </motion.button>
                )}
            </div>
        </div>
    );
}