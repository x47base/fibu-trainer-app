"use client";
import { useState, useEffect } from "react";
import TaskList from "@/components/TaskList";
import ImportExportControls from "@/components/ImportExportControls";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            const res = await fetch("/api/tasks");
            const data = await res.json();
            setTasks(data);
        };
        fetchTasks();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-themecolor mb-6">Aufgabenverwaltung</h1>
            <div className="hidden md:flex justify-between mb-6">
                <Link
                    href="/dashboard/tasks/new"
                    className="flex items-center gap-2 px-4 py-2 bg-themecolor text-white rounded-lg hover:bg-themecolorhover"
                >
                    <FaPlus /> Neue Aufgabe
                </Link>
                <ImportExportControls setTasks={setTasks} />
            </div>
            <TaskList tasks={tasks} setTasks={setTasks} />
        </div>
    );
}