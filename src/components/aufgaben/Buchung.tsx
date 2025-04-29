import { useState, useEffect } from "react";

export default function Create() {
    const [bookings, setBookings] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCorrect, setIsCorrect] = useState(null);

    // Neue States für Input-Werte
    const [inputs, setInputs] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch("/api/tasks?type=booking");
                if (response.ok) {
                    const data = await response.json();
                    setBookings(data);
                    setInputs(getEmptyInputs(data[0])); // Initialisieren mit erster Aufgabe
                } else {
                    console.error("Fehler beim Laden:", response.status);
                }
            } catch (error) {
                console.error("Fehler:", error);
            }
        };

        fetchBookings();
    }, []);

    const currentTask = bookings[currentIndex];

    useEffect(() => {
        if (currentTask) {
            setInputs(getEmptyInputs(currentTask));
            setIsCorrect(null);
        }
    }, [currentIndex]);

    if (!currentTask) {
        return <div>Lade Aufgaben...</div>;
    }

    const handleInputChange = (index, field, value) => {
        const updated = [...inputs];
        updated[index][field] = value;
        setInputs(updated);
    };

    return (
        <div id={`task-${currentTask._id}`} className="p-4 rounded-md flex flex-col justify-center items-center ">
            <h2 className="text-3xl semi-bold mb-6">Aufgabenstellung</h2>
            <span className="mb-10 w-3/6">{currentTask.content.scenario}</span>

            {currentTask.content.bookings.map((_, index) => (
                <div key={index} className="flex items-col gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Soll"
                        value={inputs[index]?.soll || ""}
                        onChange={e => handleInputChange(index, "soll", e.target.value)}
                        className="w-48 px-4 py-2 border rounded-lg"
                    />
                    <input
                        type="text"
                        placeholder="Haben"
                        value={inputs[index]?.haben || ""}
                        onChange={e => handleInputChange(index, "haben", e.target.value)}
                        className="w-48 px-4 py-2 border rounded-lg"
                    />
                    <input
                        type="number"
                        placeholder="Betrag"
                        value={inputs[index]?.betrag || ""}
                        onChange={e => handleInputChange(index, "betrag", e.target.value)}
                        className="w-48 px-4 py-2 border rounded-lg"
                    />
                </div>
            ))}

            <button
                onClick={() => Validate(setIsCorrect, currentTask, inputs)}
                className="mt-4 py-2 px-4 bg-themecolor text-white rounded-lg shadow-md hover:bg-themecolorhover"
            >
                Prüfen
            </button>

            {isCorrect !== null && (
                <div className={`mt-4 px-4 py-2 rounded-lg text-white ${isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                    {isCorrect ? "Richtige Buchung!" : "Falsche Buchung. Bitte überprüfen."}
                </div>
            )}

            {isCorrect && currentIndex < bookings.length - 1 && (
                <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="mt-6 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                >
                    Nächste Aufgabe
                </button>
            )}

            {isCorrect && currentIndex === bookings.length - 1 && (
                <div className="mt-6 text-xl font-semibold text-green-600">Alle Aufgaben abgeschlossen! 🎉</div>
            )}
        </div>
    );
}

function getEmptyInputs(task) {
    return task.content.bookings.map(() => ({
        soll: "",
        haben: "",
        betrag: ""
    }));
}

export async function Validate(setIsCorrect, task, inputs) {
    let isValid = true;

    task.content.bookings.forEach((booking, index) => {
        const user = inputs[index];
        if (
            user.soll.trim() !== booking.soll ||
            user.haben.trim() !== booking.haben ||
            parseFloat(user.betrag) !== booking.betrag
        ) {
            isValid = false;
        }
    });

    setIsCorrect(isValid);
}
  