import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import AccountInput from "../AccountInput";

interface BuchungProps {
    task: any;
    stats: { correct: number; incorrect: number; notDone: number };
    onResult: (isCorrect: boolean, wrongValue?: any) => void;
    onNext: () => void;
    onSkip: () => void;
    onBack: () => void;
    mode: "training" | "practice";
}

export default function Buchung({ task, stats, onResult, onNext, onSkip, onBack, mode }: BuchungProps) {
    const [inputs, setInputs] = useState<any[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        if (task) {
            setInputs(getEmptyInputs(task));
            setIsCorrect(null);
            setHasChecked(false);
        }
    }, [task]);

    if (!task) {
        return <div>Lade Aufgabe...</div>;
    }

    const handleInputChange = (index: number, field: string, value: string | number) => {
        const updated = [...inputs];
        updated[index][field] = value;
        setInputs(updated);
    };

    const handleValidate = async () => {
        const isValid = await Validate(task, inputs);
        setIsCorrect(isValid);
        setHasChecked(true);
        onResult(isValid, isValid ? undefined : inputs);
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
                    <h2 className="text-3xl font-semibold mb-6 text-center md:text-left">Buchungsaufgabe</h2>
                    <span className="block mb-6 text-center md:text-left">{task.content.scenario}</span>
                    {task.content.bookings.map((_, index: number) => (
                        <div key={index} className="flex items-center gap-4 mb-4">
                            <AccountInput
                                field="soll"
                                value={inputs[index]?.soll || ""}
                                onChange={(value) => handleInputChange(index, "soll", value)}
                                className="w-48 px-4 py-2 border rounded-lg"
                            />
                            <AccountInput
                                field="haben"
                                value={inputs[index]?.haben || ""}
                                onChange={(value) => handleInputChange(index, "haben", value)}
                                className="w-48 px-4 py-2 border rounded-lg"
                            />
                            <input
                                type="number"
                                placeholder="Betrag"
                                value={inputs[index]?.betrag || ""}
                                onChange={(e) => handleInputChange(index, "betrag", e.target.value)}
                                className="w-48 px-4 py-2 border rounded-lg"
                            />
                        </div>
                    ))}
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
                {mode === "training" && !hasChecked && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onSkip}
                        className="px-3 py-2 bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-md hover:bg-gray-400"
                    >
                        Überspringen
                    </motion.button>
                )}
                {(mode === "practice" || (mode === "training" && !isCorrect)) && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleValidate}
                        className="px-3 py-2 bg-themecolor text-white text-sm font-semibold rounded-lg shadow-md hover:bg-themecolorhover"
                        disabled={mode === "practice" && hasChecked}
                    >
                        Prüfen
                    </motion.button>
                )}
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
                    {isCorrect ? "Richtige Buchung!" : "Falsche Buchung. Bitte überprüfen."}
                </div>
            )}
        </div>
    );
}

function getEmptyInputs(task: any) {
    return task.content.bookings.map(() => ({
        soll: "",
        haben: "",
        betrag: "",
    }));
}

async function Validate(task: any, inputs: any[]) {
    let isValid = true;

    task.content.bookings.forEach((booking: any, index: number) => {
        const user = inputs[index];
        if (
            user.soll.trim() !== booking.soll ||
            user.haben.trim() !== booking.haben ||
            parseFloat(user.betrag) !== booking.betrag
        ) {
            isValid = false;
        }
    });

    return isValid;
}