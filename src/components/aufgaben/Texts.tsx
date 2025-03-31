import { useState, useEffect } from "react";

// Beispiel-Daten
const placeholderData = {
    "type": "text",
    "content": {
        "scenario": "Eine Firma kauft Waren auf Rechnung für 400.-",
        "text": "Das {0} erhöht sich um Chf 400.",
        "answers": [
            "Konto"
        ]
    },
    "tags": [],
    "createdAt": "2025-03-11T12:27:47.186Z"
};

export default function Create(taskId) {
    const [data, setData] = useState(placeholderData);

    useEffect(() => {
        // fetch(`/api/tasks/${taskId}`).then(response => response.json()).then(data => setData(data));
    }, [taskId]);

    return (
        <div id={`task-${taskId}`} className="p-4 rounded-md flex flex-col justify-center items-center">
            <h2 className="text-3xl semi-bold mb-6">Aufgabenstellung</h2>
            <span className="mb-10 w-3/6">{data.content.scenario}</span>

            <div className="flex flex-col items-center gap-4">
                <label htmlFor="Lueckentext" className="block text-sm font-medium text-gray-700 mb-1">
                    {data.content.text.replace("{0}", "______")}
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
                onClick={() => Validate(data.content.answers)}
                className="mt-4 py-2 px-4 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover focus:outline-none focus:ring-2 focus:ring-themecolorhover transition-all duration-200 disabled:bg-gray-400"
            >
                Prüfen
            </button>
        </div>
    );
}

export async function Validate(correctAnswers) {
    let isValid = false;

    // Lückentext-Eingabe holen
    const input = document.querySelector("input[id='Lueckentext']");
    if (!input) return isValid;

    const enteredValue = input.value.trim().toLowerCase();
    console.log("Eingabe:", enteredValue);
    console.log("Erwartete Antworten:", correctAnswers);

    // Überprüfung der Eingabe mit den möglichen Antworten
    if (correctAnswers.map(ans => ans.toLowerCase()).includes(enteredValue)) {
        isValid = true;
    }

    alert(isValid ? "Richtige Antwort!" : "Falsche Antwort. Bitte überprüfen.");
    return isValid;
}
