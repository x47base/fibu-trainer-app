import TaskItem from "@/components/TaskItem";

interface TaskListProps {
    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
}

export default function TaskList({ tasks, setTasks }: TaskListProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.length > 0 ? (
                tasks.map((task) => (
                    <div key={task._id} className="w-full">
                        <TaskItem
                            task={task}
                            onDelete={(id) =>
                                setTasks(tasks.filter((t) => t._id !== id))
                            }
                        />
                    </div>
                ))
            ) : (
                <p className="text-gray-600 col-span-full text-center">
                    Keine Aufgaben vorhanden.
                </p>
            )}
        </div>
    );
}