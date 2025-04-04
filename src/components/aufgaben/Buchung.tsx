import { useState, useEffect } from "react";

export default function Create({ taskId }) {
    const [data, setData] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const response = await fetch(`/api/tasks/${taskId}`);
                if (response.ok) {
                    const taskData = await response.json();
                    setData(taskData);
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
        <div id={`task-${taskId}`} className="p-4 rounded-md flex flex-col justify-center items-center ">
            <h2 className="text-3xl semi-bold mb-6">Aufgabenstellung</h2>
            <span className="mb-10 w-3/6">{data.content.scenario}</span>


            {data.content.bookings.map((booking, index) => (
                <div key={index} className="flex items-col gap-4">
                    <label htmlFor="Soll" className="block text-sm font-medium text-gray-700 mb-1">

                    </label>
                    <input
                        type="text"
                        id="Soll"

                        required
                        className="w-48 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themecolorhover focus:border-themecolor transition-colors duration-200"
                        placeholder="Soll"

                    />
                    <label htmlFor="Haben" className="block text-sm font-medium text-gray-700 mb-1">

                    </label>
                    <input
                        type="text"
                        id="Haben"

                        required
                        className="w-48 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themecolorhover focus:border-themecolor transition-colors duration-200"
                        placeholder="Haben"

                    />
                    <label htmlFor="Betrag" className="block text-sm font-medium text-gray-700 mb-1">

                    </label>
                    <input
                        type="number"
                        id="Betrag"

                        required
                        className="w-48 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themecolorhover focus:border-themecolor transition-colors duration-200"
                        placeholder="Betrag"

                    />

                </div>

            ))}

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

    const sollInputs = Array.from(document.querySelectorAll("input[id='Soll']")).map(input => input.value.trim());
    const habenInputs = Array.from(document.querySelectorAll("input[id='Haben']")).map(input => input.value.trim());
    const betragInputs = Array.from(document.querySelectorAll("input[id='Betrag']")).map(input => parseFloat(input.value));

    data.content.bookings.forEach((booking, index) => {
        if (
            sollInputs[index] !== booking.soll ||
            habenInputs[index] !== booking.haben ||
            betragInputs[index] !== booking.betrag
        ) {
            isValid = false; // Falls irgendein Wert nicht übereinstimmt
        }
    });

    setIsCorrect(isValid);
}
