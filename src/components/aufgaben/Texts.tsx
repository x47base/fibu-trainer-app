import { useState, useEffect } from "react";

export default function Texts({ taskId }) {
    const [data, setData] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const response = await fetch(`/api/tasks/${taskId}`);

                if (response.ok) {
                    const taskData = await response.json();
                    console.log("Erwarteter Typ: text, Gelieferter Typ:", taskData.type);


                    if (taskData.type === "text") {
                        setData(taskData);
                    } else {
                        console.warn("Diese Aufgabe ist kein Lückentext.");
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

    return (
        <div id={`task-${taskId}`} className="p-4 rounded-md flex flex-col justify-center items-center">
            <h2 className="text-3xl semi-bold mb-6">Lückentext-Aufgabe</h2>
            <span className="mb-10 w-3/6">{data.content?.text || "Keine Szenario-Beschreibung verfügbar."}</span>

            <div className="flex flex-col items-center gap-4">
                <label htmlFor="Lueckentext" className="block text-sm font-medium text-gray-700 mb-1">
                </label>
                <input
                    type="text"
                    id="Lueckentext"
                    required
                    className="w-48 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themecolorhover focus:border-themecolor transition-colors duration-200"
                    placeholder="Antwort eingeben"
                />
            </div>

            <button
                onClick={() => Validate(setIsCorrect, data.content?.answers)}
                className="mt-4 py-2 px-4 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover"
            >
                Prüfen
            </button>

            {isCorrect !== null && (
                <div className={`mt-4 px-4 py-2 rounded-lg text-white ${isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                    {isCorrect ? "Richtige Antwort!" : "Falsche Antwort. Bitte überprüfen."}
                </div>
            )}
        </div>
    );
}

export async function Validate(setIsCorrect, correctAnswers) {
    if (!correctAnswers || correctAnswers.length === 0) {
        console.error("Es gibt keine richtigen Antworten zum Vergleich.");
        setIsCorrect(false);
        return;
    }

    // Lückentext-Eingabe holen
    const input = document.querySelector("input[id='Lueckentext']");
    if (!input) {
        console.error("Eingabefeld nicht gefunden.");
        return;
    }

    const enteredValue = input.value.trim().toLowerCase();
    console.log("Eingabe:", enteredValue);
    console.log("Erwartete Antworten:", correctAnswers);

    // Überprüfung der Eingabe mit den möglichen Antworten
    setIsCorrect(correctAnswers.some(ans => ans.toLowerCase() === enteredValue));
}
