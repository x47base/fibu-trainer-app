"use client";
import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskContext } from "@/app/dashboard/layout";
import { useRouter } from "next/navigation";
import { FaGlobe, FaLock } from "react-icons/fa";

interface Task {
    _id: number;
    type: "text" | "multiple-choice" | "booking" | "drag-drop";
    content: Record<string, any>;
    tags: string[];
}

interface TaskItemProps {
    task: Task;
    privacy: "öffentlich" | "privat";
    onDelete?: (id: number) => void;
}

export default function TaskItem({ task, privacy, onDelete }: TaskItemProps) {
    const { selectedTaskId, setSelectedTaskId } = useContext(TaskContext);
    const isSelected = selectedTaskId === task._id;
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Möchtest du diese Aufgabe wirklich löschen?")) return;
        const res = await fetch(`/api/tasks/${task._id}`, {
            method: "DELETE",
        });
        if (res.ok && onDelete) {
            onDelete(task._id);
        } else {
            alert("Löschen fehlgeschlagen.");
        }
    };

    return (
        <div
            className={`border border-gray-300 rounded-lg shadow-sm overflow-hidden w-full ${
                isSelected ? "ring-2 ring-themecolor" : ""
            }`}
            onClick={() => setSelectedTaskId(isSelected ? null : task._id)}
        >
            <div className="p-4 bg-white cursor-pointer hover:bg-gray-50">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-themecolor truncate">
                        {`Aufgabe #${task._id}`}
                    </h3>
                    {privacy === "öffentlich" ? (
                        <FaGlobe className="text-xl text-green-600 ml-2" aria-label="Öffentlich" />
                    ) : (
                        <FaLock className="text-xl text-gray-600 ml-2" aria-label="Privat" />
                    )}
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">
                    Typ: {task.type}; Tags: {task.tags.join("; ")}
                </p>
            </div>

            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        key={`details-${task._id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 bg-gray-50 border-t border-gray-300 text-sm overflow-x-auto"
                    >
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(task.content, null, 2)}
                        </pre>
                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={() => router.push(`/dashboard/tasks/${task._id}/edit`)}
                                className="hidden md:flex px-4 py-2 bg-themecolor text-white rounded hover:bg-themecolorhover transition-colors"
                            >
                                Aufgabe bearbeiten
                            </button>
                            <button
                                onClick={handleDelete}
                                className="hidden md:flex px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                                Aufgabe löschen
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
