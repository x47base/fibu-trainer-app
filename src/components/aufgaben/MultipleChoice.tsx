import { useState, useEffect } from "react";

// Beispiel-Daten für Multiple Choice.
const placeholderData = {
    "_id": 1,
    "type": "booking",
    "content": {
        "scenario": "Die Firma zahlt eine Rechnung für CHF 400",
        "correctAnswer": "Verbindlichkeiten aus Lieferungen und Leistungen → Bank",
        "options": [
            "Verbindlichkeiten aus Lieferungen und Leistungen → Bank", // Richtig
            "Kasse → Bank",
            "Bank → Umsatzerlöse"
        ]
    },
    "tags": ["Rechnung"],
    "createdAt": "2025-03-06T12:28:12.722Z"
};

// @ts-expect-error: types
export default function MultipleChoice({ taskId }) {
    const [data, setData] = useState(placeholderData);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null); // null = noch nicht geprüft

    useEffect(() => {
        // Hier könnte ein API-Call erfolgen, wenn echte Daten verwendet werden
        // fetch(`/api/tasks/${taskId}`).then(response => response.json()).then(data => setData(data));
    }, [taskId]);

    function validateAnswer() {
        if (selectedAnswer === data.content.correctAnswer) {
            // @ts-expect-error: types
            setIsCorrect(true);
        } else {
            // @ts-expect-error: types
            setIsCorrect(false);
        }
    }

    return (
        <div id={`task-${taskId}`} className="p-4 rounded-md flex flex-col justify-center items-center">
            <h2 className="text-3xl font-semibold mb-6">Multiple-Choice Aufgabe</h2>
            <span className="mb-6 w-3/6 text-center">{data.content.scenario}</span>

            <div className="flex flex-col gap-4 mt-4">
                {data.content.options.map((option, index) => (
                    <label key={index} className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                        <input
                            type="radio"
                            name="buchung"
                            value={option}
                            checked={selectedAnswer === option}
                            // @ts-expect-error: types
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
