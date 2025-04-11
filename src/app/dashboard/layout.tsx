"use client";
import Link from "next/link";
import { ReactNode, createContext, useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    HiOutlineClipboardList,
    HiOutlineArrowLeft,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlinePlus,
    HiOutlineDownload,
    HiOutlineUpload,
    HiOutlineViewGrid
} from "react-icons/hi";

interface TaskContextType {
    selectedTaskId: number | null;
    setSelectedTaskId: (id: number | null) => void;
}

export const TaskContext = createContext<TaskContextType>({
    selectedTaskId: null,
    setSelectedTaskId: () => { },
});

interface Task {
    _id?: number;
    type: "text" | "multiple-choice" | "booking" | "drag-drop";
    content: Record<string, any>;
    tags: string[];
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    const pushNotification = (message: string, type: "success" | "error") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const isTasksPage = pathname === "/dashboard/tasks";
    const isEditTaskPage = pathname.startsWith("/dashboard/tasks/") && pathname.endsWith("/edit");
    const isNewTaskPage = pathname === "/dashboard/tasks/new";

    const taskIdFromPath = isEditTaskPage
        ? parseInt(pathname.split('/')[3]) || null
        : null;

    if (taskIdFromPath !== null && taskIdFromPath !== selectedTaskId) {
        setSelectedTaskId(taskIdFromPath);
    }

    const handleDelete = async () => {
        if (selectedTaskId && confirm("Möchtest du diese Aufgabe wirklich löschen?")) {
            const res = await fetch(`/api/tasks/${selectedTaskId}`, { method: "DELETE" });
            if (res.ok) {
                pushNotification("Löschen erfolgreich", "success");
                setSelectedTaskId(null);
                setTimeout(() => {
                    router.refresh();
                }, 750);
            } else {
                pushNotification("Löschen fehlgeschlagen", "error");
            }
        }
    };

    const handleAddTask = () => {
        setSelectedTaskId(null);
        router.push("/dashboard/tasks/new");
    };

    const handleExport = async () => {
        try {
            const res = await fetch("/api/tasks/importexport");
            if (!res.ok) throw new Error("Export fehlgeschlagen.");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "tasks.json";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            pushNotification("Export erfolgreich", "success");
        } catch (error) {
            pushNotification((error instanceof Error ? error.message : "Unbekannter Fehler beim Export") || "", "error");
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const json = event.target?.result as string;
            try {
                const importedTasks: Task[] = JSON.parse(json);
                for (const task of importedTasks) {
                    if (task.type === "booking" && (task.content.bookings?.length || 0) > 4) {
                        throw new Error("Booking tasks dürfen max. 4 Buchungen haben.");
                    }
                    if (!task.type || !["text", "multiple-choice", "booking", "drag-drop"].includes(task.type)) {
                        throw new Error("Ungültiger Aufgabentyp.");
                    }
                    if (!task.content || !task.tags) {
                        throw new Error("Aufgabe fehlt content oder tags.");
                    }
                }
                const res = await fetch("/api/tasks/importexport", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(importedTasks),
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Import fehlgeschlagen.");
                }
                pushNotification("Import erfolgreich", "success");
                setTimeout(() => {
                    router.refresh();
                }, 750);
            } catch (error) {
                pushNotification((error instanceof Error ? error.message : "Unbekannter Fehler beim Import") || "", "error");
            }
        };
        reader.readAsText(file);
    };

    return (
        <TaskContext.Provider value={{ selectedTaskId, setSelectedTaskId }}>
            <div className="flex flex-col min-h-screen w-screen items-center">
                {/* Main Content */}
                <main className="flex-1 p-4 overflow-y-auto w-full md:w-9/12">
                    {children}
                </main>

                {/* Mobile Dashboard Navbar */}
                <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-themecolor text-white p-3 rounded-lg shadow-lg flex justify-around items-center z-50 max-w-md mx-auto">
                    {/* Core Navigation Buttons */}
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-full hover:bg-themecolorhover transition-colors"
                        title="Dashboard"
                    >
                        <HiOutlineViewGrid size={24} />
                    </Link>
                    <Link
                        href="/dashboard/tasks"
                        className="p-2 rounded-full hover:bg-themecolorhover transition-colors"
                        title="Tasks"
                    >
                        <HiOutlineClipboardList size={24} />
                    </Link>

                    {/* Conditional Action Buttons */}
                    {(isTasksPage && !selectedTaskId && !isNewTaskPage) && (
                        <button
                            onClick={handleAddTask}
                            className="p-2 rounded-full hover:bg-themecolorhover transition-colors"
                            title="Neue Aufgabe"
                        >
                            <HiOutlinePlus size={24} />
                        </button>
                    )}
                    {(isTasksPage && !selectedTaskId && !isNewTaskPage) && (
                        <button
                            onClick={handleExport}
                            className="p-2 rounded-full hover:bg-themecolorhover transition-colors"
                            title="Exportieren"
                        >
                            <HiOutlineDownload size={24} />
                        </button>
                    )}
                    {(isTasksPage && !selectedTaskId && !isNewTaskPage) && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-full hover:bg-themecolorhover transition-colors"
                            title="Importieren"
                        >
                            <HiOutlineUpload size={24} />
                        </button>
                    )}
                    {(isEditTaskPage || isNewTaskPage) && (
                        <Link
                            href="/dashboard/tasks"
                            onClick={() => setSelectedTaskId(null)}
                            className="p-2 rounded-full hover:bg-themecolorhover transition-colors"
                            title="Zurück"
                        >
                            <HiOutlineArrowLeft size={24} />
                        </Link>
                    )}
                    {(isTasksPage && selectedTaskId && !isEditTaskPage) && (
                        <Link
                            href={`/dashboard/tasks/${selectedTaskId}/edit`}
                            onClick={() => setSelectedTaskId(null)}
                            className="p-2 rounded-full hover:bg-themecolorhover transition-colors"
                            title="Bearbeiten"
                        >
                            <HiOutlinePencil size={24} />
                        </Link>
                    )}
                    {(isTasksPage && selectedTaskId && !isEditTaskPage) && (
                        <button
                            onClick={handleDelete}
                            className="p-2 rounded-full hover:bg-themecolorhover transition-colors"
                            title="Löschen"
                        >
                            <HiOutlineTrash size={24} />
                        </button>
                    )}
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleImport}
                        className="hidden"
                    />
                </nav>
                {/* Notification */}
                {notification && (
                    <div
                        className={`fixed z-50 p-4 rounded shadow-lg text-white ${
                            notification.type === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={
                            isMobile
                                ? { top: "20px", left: "50%", transform: "translateX(-50%)" }
                                : { bottom: "20px", right: "20px" }
                        }
                    >
                        {notification.message}
                    </div>
                )}
            </div>
        </TaskContext.Provider>
    );
}