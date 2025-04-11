"use client";
import { ReactNode, createContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface TaskContextType {
    selectedTaskId: number | null;
    setSelectedTaskId: (id: number | null) => void;
}

export const TaskContext = createContext<TaskContextType>({
    selectedTaskId: null,
    setSelectedTaskId: () => { },
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

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

    return (
        <TaskContext.Provider value={{ selectedTaskId, setSelectedTaskId }}>
            <div className="flex flex-col min-h-screen w-screen items-center">
                {/* Main Content */}
                <main className="flex-1 p-4 overflow-y-auto w-full md:w-9/12">
                    {children}
                </main>
            </div>
        </TaskContext.Provider>
    );
}