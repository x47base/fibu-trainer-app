import { useEffect, useState } from "react";

const placeholderData = {
    "_id": 4,
    "type": "drag-drop",
    "content": {
        "account": "Kasse",
        "soll": [
            "AB 900",
            "200"
        ],
        "haben": [
            "75"
        ]
    },
    "tags": [],
    "createdAt": "2025-04-08T13:19:02.388Z"
};

export default function Create(taskId) {
    const [data, setData] = useState(placeholderData);
    const [isCorrect, setIsCorrect] = useState(null);

    useEffect(() => {
        // fetch(`/api/tasks/${taskId}`).then(res => res.json()).then(setData);
    }, [taskId]);



    return (
        <div className="p-4 flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6">Kontenkreuz Aufgabe</h2>
            <p className="mb-4">Trage die richtige Buchung ein:</p>

            <div className="mb-4">
                <img src="/img.png" alt="Kontenkreuz" width={400} height={400} />
            </div>

            <div className="flex gap-6">
                <div className="flex flex-col items-start">
                    <label className="text-sm font-medium mb-1">Soll-Seite</label>
                    <input
                        type="text"
                        id="konto"
                        placeholder="Konto"
                        className="w-48 px-2 py-1 border rounded mb-2"
                    />
                    <input
                        type="number"
                        id="betrag"
                        placeholder="Betrag"
                        className="w-48 px-2 py-1 border rounded"
                    />
                    <input
                        type="hidden"
                        value="Soll"
                    />
                </div>
            </div>

            <button
                onClick={() => Validate(setIsCorrect, data)}
                className="mt-4 py-2 px-4 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover"
            >
                Prüfen
            </button>

            {isCorrect !== null && (
                <div className={`mt-4 px-4 py-2 rounded-lg text-white ${isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                    {isCorrect ? "Richtige Buchung!" : "Falsche Buchung. Bitte überprüfen."}
                </div>
            )}

        </div>
    );
}

export async function Validate(setIsCorrect, data) {
    let isValid = true;

    const kontoInput = Array.from(document.querySelectorAll("input[id='konto']")).map(input => input.value.trim());
    const betragInput = Array.from(document.querySelectorAll("input[id='betrag']")).map(input => parseFloat(input.value));
    console.log(kontoInput)
    console.log(betragInput)
    console.log(data.content.entries[0].konto)
    console.log(data.content.entries[0].betrag)
    data.content.entries.forEach((entrie, index) => {
        if (
            kontoInput[index] !== entrie.konto ||
            betragInput[index] !== entrie.betrag
        ) {
            isValid = false; // Falls irgendein Wert nicht übereinstimmt
        }
    });

    setIsCorrect(isValid);
}