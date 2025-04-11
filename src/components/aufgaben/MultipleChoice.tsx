import { useState, useEffect } from "react";

export default function MultipleChoice({ taskId }) {
    const [data, setData] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const response = await fetch(`/api/tasks/${taskId}`);
                if (response.ok) {
                    const taskData = await response.json();
                    console.log("Erwarteter Typ: multiple-choice, Gelieferter Typ:", taskData.type);

                    if (taskData.type === "multiple-choice") {
                        setData(taskData);
                    } else {
                        console.warn("Diese Aufgabe ist kein Multiple-Choice.");
                    }
                } else {
                    console.error("Fehler beim Laden der Aufgabe:", response.status);
                }
            } catch (error) {
                console.error("Fehler beim Abrufen der Daten:", error);
            }
        };

        if (taskId) {
            fetchTaskData();
        }
    }, [taskId]);

    if (!data) {
        return <div>Loading...</div>;
    }

    function validateAnswer() {
        const correctAnswerIndex = String(data?.content?.correctAnswer);
        const selectedIndex = String(data?.content?.options?.indexOf(selectedAnswer));
        setIsCorrect(selectedIndex === correctAnswerIndex);
    }

    return (
        <div id={`task-${taskId}`} className="p-4 rounded-md flex flex-col justify-center items-center">
            <h2 className="text-3xl font-semibold mb-6">Multiple-Choice Aufgabe</h2>
            <span className="mb-6 w-3/6 text-center">{data?.content?.question}</span>

            <div className="flex flex-col gap-4 mt-4">
                {data?.content?.options?.map((option, index) => (
                    <label key={index} className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                        <input
                            type="radio"
                            name="buchung"
                            value={option}
                            checked={selectedAnswer === option}
                            onChange={() => setSelectedAnswer(option)}
                            className="cursor-pointer"
                        />
                        {option}
                    </label>
                ))}
            </div>

            <button
                onClick={validateAnswer}
                className="mt-4 py-2 px-4 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover focus:outline-none focus:ring-2 focus:ring-themecolorhover transition-all duration-200 disabled:bg-gray-400"
                disabled={!selectedAnswer}
            >
                Prüfen
            </button>

            {isCorrect !== null && (
                <div className={`mt-4 px-4 py-2 rounded-lg text-white ${isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                    {isCorrect ? "Richtig!" : "Falsch! Versuche es erneut."}
                </div>
            )}
        </div>
    );
}