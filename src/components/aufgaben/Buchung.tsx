import { useState, useEffect } from "react";

// Beispiel-Daten
const placeholderData = {
    "_id": 1,
    "type": "booking",
    "content": {
        "bookings": [
            {
                "soll": "Verbindlichkeiten aus Lieferungen und Leistungen",
                "haben": "Bank",
                "betrag": 400
            }
        ],
        "scenario": "Die Firma zahlt eine Rechnung für CHF 400"
    },
    "tags": [
        "Rechnung"
    ],
    "createdAt": "2025-03-06T12:28:12.722Z"
};

export default function Create(taskId) {
    const [data, setData] = useState(placeholderData);

    useEffect(() => {
        // fetch(`/api/tasks/${taskId}`).then(response => response.json()).then(data => setData(data));
    }, [taskId]);

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
                 onClick={Validate}
                 className="mt-4 py-2 px-4 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover focus:outline-none focus:ring-2 focus:ring-themecolorhover transition-all duration-200 disabled:bg-gray-400"
            >
                Prüfen
            </button>

        </div>
    );
}

export async function Validate() {
    let isValid = true;
    
    // Alle Buchungseingaben holen
    const sollInputs = Array.from(document.querySelectorAll("input[id='Soll']")).map(input => input.value.trim());
    const habenInputs = Array.from(document.querySelectorAll("input[id='Haben']")).map(input => input.value.trim());
    const betragInputs = Array.from(document.querySelectorAll("input[id='Betrag']")).map(input => parseFloat(input.value));
    console.log("Soll Inputs:", sollInputs);
    console.log("Haben Inputs:", habenInputs);
    console.log("Betrag Inputs:", betragInputs);
    
    placeholderData.content.bookings.forEach((booking, index) => {
        if (
            sollInputs[index] !== booking.soll || 
            habenInputs[index] !== booking.haben || 
            betragInputs[index] !== booking.betrag
        ) {
            isValid = false; // Falls irgendein Wert nicht übereinstimmt
        }
    });

    alert(isValid ? "Richtige Buchung!" : "Falsche Buchung. Bitte überprüfen.");
    return isValid;


}
