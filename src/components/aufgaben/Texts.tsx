import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

interface TextsProps {
    task: any;
    stats: { correct: number; incorrect: number; notDone: number };
    onResult: (isCorrect: boolean) => void;
    onNext: () => void;
    onSkip: () => void;
    onBack: () => void;
}

export default function Texts({ task, stats, onResult, onNext, onSkip, onBack }: TextsProps) {
    const [inputValue, setInputValue] = useState("");
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    useEffect(() => {
        setInputValue("");
        setIsCorrect(null);
    }, [task]);

    if (!task) {
        return <div>Loading...</div>;
    }

    const handleValidate = async () => {
        const isValid = await Validate(task.content.answers, inputValue);
        setIsCorrect(isValid);
        onResult(isValid);
    };

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
                    <h2 className="text-3xl font-semibold mb-6 text-center md:text-left">Lückentext-Aufgabe</h2>
                    <span className="block mb-6 text-center md:text-left">{task.content.text || "Keine Szenario-Beschreibung verfügbar."}</span>
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <label htmlFor="Lueckentext" className="block text-sm font-medium text-gray-700 mb-1">
                            Antwort:
                        </label>
                        <input
                            type="text"
                            id="Lueckentext"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            required
                            className="w-48 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themecolorhover focus:border-themecolor transition-colors duration-200"
                            placeholder="Antwort eingeben"
                        />
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
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onSkip}
                    className="px-3 py-2 bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-md hover:bg-gray-400"
                >
                    Überspringen
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleValidate}
                    className="px-3 py-2 bg-themecolor text-white text-sm font-semibold rounded-lg shadow-md hover:bg-themecolorhover"
                >
                    Prüfen
                </motion.button>
                {isCorrect && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNext}
                        className="px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700"
                    >
                        Nächste Aufgabe
                    </motion.button>
                )}
            </div>

            {/* Feedback */}
            {isCorrect !== null && (
                <div className={`mt-4 px-4 py-2 rounded-lg text-white text-center ${isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                    {isCorrect ? "Richtige Antwort!" : "Falsche Antwort. Bitte überprüfen."}
                </div>
            )}
        </div>
    );
}

async function Validate(correctAnswers: string[], enteredValue: string) {
    if (!correctAnswers || correctAnswers.length === 0) {
        console.error("Es gibt keine richtigen Antworten zum Vergleich.");
        return false;
    }

    return correctAnswers.some((ans) => ans.toLowerCase() === enteredValue.trim().toLowerCase());
}