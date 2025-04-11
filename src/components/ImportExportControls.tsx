import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaFileExport, FaFileImport } from "react-icons/fa";

interface ImportExportControlsProps {
    setTasks: (tasks: Task[]) => void;
}

export default function ImportExportControls({ setTasks }: ImportExportControlsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    const pushNotification = (message: string, type: "success" | "error") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const json = event.target?.result as string;
                try {
                    const tasks = JSON.parse(json);
                    tasks.forEach((task: Task) => {
                        if (task.type === "booking" && task.content.bookings.length > 4) {
                            throw new Error("Booking tasks dürfen max. 4 Buchungen haben.");
                        }
                    });
                    const res = await fetch("/api/tasks/importexport", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(tasks),
                    });
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.message || "Import fehlgeschlagen.");
                    }
                    const newTasks = await res.json();
                    setTasks(newTasks);
                    pushNotification("Import erfolgreich", "success");
                    setTimeout(() => {
                        router.refresh();
                    }, 750);
                } catch (error) {
                    pushNotification((error instanceof Error ? error.message : "Unbekannter Fehler beim Import") || "", "error");
                }
            };
            reader.readAsText(file);
        }
    };

    const handleExport = () => {
        window.location.href = "/api/tasks/importexport";
    };

    return (
        <>
            <div className="flex gap-4">
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-themecolor text-white rounded-lg hover:bg-themecolorhover"
                >
                    <FaFileExport /> Exportieren
                </button>
                <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleImport}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-themecolor text-white rounded-lg hover:bg-themecolorhover"
                >
                    <FaFileImport /> Importieren
                </button>
            </div>
            {/* Notification UI */}
            {notification && (
                <div
                    className={`fixed z-50 p-4 rounded shadow-lg text-white ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}
                    style={
                        isMobile
                            ? { top: "20px", left: "50%", transform: "translateX(-50%)" }
                            : { bottom: "20px", right: "20px" }
                    }
                >
                    {notification.message}
                </div>
            )}
        </>
    );
}