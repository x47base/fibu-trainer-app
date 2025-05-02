"use client";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FaTrash, FaCheck } from "react-icons/fa";
import AccountInput from "@/components/AccountInput";
import ALL_TAGS from "@/lib/tags";

interface Task {
    _id?: string;
    type: "text" | "multiple-choice" | "booking" | "drag-drop";
    content: Record<string, any>;
    tags: string[];
    isPublic: boolean;
    createdBy: string;
}

const limitTo10Lines = (value: string): string => {
    const lines = value.split("\n");
    return lines.slice(0, 10).join("\n");
};

export default function TaskForm() {
    const router = useRouter();
    const params = useParams();
    const { data: session, status } = useSession();
    const [task, setTask] = useState<Task>(() => ({
        type: "text",
        content: params.id ? {} : { bookings: [{ soll: "", haben: "", betrag: 0 }], scenario: "" },
        tags: [],
        isPublic: false,
        createdBy: "",
    }));
    const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/signin");
            return;
        }

        if (params.id) {
            const fetchTask = async () => {
                try {
                    const res = await fetch(`/api/tasks/${params.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        const isAdmin = session.user.role === "admin";
                        const isCreator = data.createdBy === session.user.id;
                        if (!isAdmin && !isCreator) {
                            setError("Sie können nur Ihre eigenen Aufgaben bearbeiten.");
                            router.push("/dashboard/tasks");
                            return;
                        }
                        setTask(data);
                    } else {
                        setError("Aufgabe nicht gefunden.");
                        router.push("/dashboard/tasks");
                    }
                } catch (err) {
                    setError("Fehler beim Laden der Aufgabe.");
                    router.push("/dashboard/tasks");
                }
            };
            fetchTask();
        } else {
            setTask((prev) => ({ ...prev, createdBy: session.user.id }));
        }
    }, [params.id, session, status, router]);

    const cleanTaskData = (task: Task): Task => {
        const baseTask = { ...task, createdBy: task.createdBy || session?.user.id };
        if (task.type === "booking") {
            return {
                ...baseTask,
                content: { bookings: task.content.bookings, scenario: task.content.scenario },
            };
        } else if (task.type === "text") {
            return {
                ...baseTask,
                content: { text: task.content.text, answers: task.content.answers },
            };
        } else if (task.type === "multiple-choice") {
            return {
                ...baseTask,
                content: {
                    question: task.content.question,
                    options: task.content.options,
                    correctAnswer: task.content.correctAnswer,
                },
            };
        } else if (task.type === "drag-drop") {
            const soll = Array.isArray(task.content.soll)
                ? task.content.soll.map((val: any) => String(val).trim()).filter(Boolean)
                : [];
            const haben = Array.isArray(task.content.haben)
                ? task.content.haben.map((val: any) => String(val).trim()).filter(Boolean)
                : [];
            const anfangsbestand = parseFloat(task.content.anfangsbestand) || 0;
            const totalSoll = soll.reduce((sum: number, val: string) => sum + (parseFloat(val) || 0), 0);
            const totalHaben = haben.reduce((sum: number, val: string) => sum + (parseFloat(val) || 0), 0);
            const saldo =
                task.content.initialSide === "soll"
                    ? anfangsbestand + totalSoll - totalHaben
                    : totalSoll - (anfangsbestand + totalHaben);
            return {
                ...baseTask,
                content: {
                    account: task.content.account,
                    scenario: task.content.scenario,
                    initialSide: task.content.initialSide || "soll",
                    anfangsbestand,
                    soll,
                    haben,
                    saldo,
                },
            };
        }
        return baseTask;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            setError("Sie müssen angemeldet sein.");
            return;
        }

        if (task.type === "drag-drop") {
            const totalItems = (task.content.soll?.length || 0) + (task.content.haben?.length || 0);
            if (totalItems < 1) {
                setError("Bitte mindestens einen Eintrag in Soll oder Haben angeben.");
                return;
            }
        }

        const cleanedTask = cleanTaskData(task);
        const method = params.id ? "PUT" : "POST";
        const url = params.id ? `/api/tasks/${params.id}` : "/api/tasks";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanedTask),
            });
            if (res.ok) {
                router.push("/dashboard/tasks");
            } else {
                const data = await res.json();
                setError(data.message || "Fehler beim Speichern der Aufgabe.");
            }
        } catch (err) {
            setError("Fehler beim Speichern der Aufgabe.");
        }
    };

    const addBooking = () => {
        if ((task.content.bookings?.length || 0) >= 4) return;
        setTask({
            ...task,
            content: {
                ...task.content,
                bookings: [...(task.content.bookings || []), { soll: "", haben: "", betrag: 0 }],
            },
        });
    };

    const removeBooking = (index: number) => {
        if ((task.content.bookings?.length || 0) <= 1) return;
        const newBookings = task.content.bookings.filter((_: any, i: number) => i !== index);
        setTask({ ...task, content: { ...task.content, bookings: newBookings } });
    };

    const handleTagSearch = (value: string) => {
        const filtered = ALL_TAGS.filter(
            (tag) => tag.toLowerCase().includes(value.toLowerCase()) && !task.tags.includes(tag)
        );
        setTagSuggestions(filtered);
    };

    const addTag = (tag: string) => {
        if (!task.tags.includes(tag)) {
            setTask({ ...task, tags: [...task.tags, tag] });
        }
        setTagSuggestions(ALL_TAGS.filter((t) => !task.tags.includes(t) && t !== tag));
    };

    const removeTag = (tag: string) => {
        setTask({ ...task, tags: task.tags.filter((t) => t !== tag) });
        setTagSuggestions([...tagSuggestions, tag].sort());
    };

    const addOption = () => {
        if ((task.content.options?.length || 0) >= 4) return;
        setTask({
            ...task,
            content: { ...task.content, options: [...(task.content.options || ["", ""]), ""] },
        });
    };

    const removeOption = (index: number) => {
        if ((task.content.options?.length || 0) <= 2) return;
        const newOptions = task.content.options.filter((_: any, i: number) => i !== index);
        const newCorrectAnswer =
            task.content.correctAnswer > index
                ? task.content.correctAnswer - 1
                : task.content.correctAnswer === index
                    ? 0
                    : task.content.correctAnswer;
        setTask({ ...task, content: { ...task.content, options: newOptions, correctAnswer: newCorrectAnswer } });
    };

    const addDragDropItem = (field: "soll" | "haben") => {
        if ((task.content[field]?.length || 0) >= 6) return;
        setTask({
            ...task,
            content: { ...task.content, [field]: [...(task.content[field] || []), ""] },
        });
    };

    const removeDragDropItem = (field: "soll" | "haben", index: number) => {
        const currentFieldLength = task.content[field]?.length || 0;
        const totalItems = (task.content.soll?.length || 0) + (task.content.haben?.length || 0);
        if (currentFieldLength === 0 || totalItems <= 1) return;
        const newItems = task.content[field].filter((_: any, i: number) => i !== index);
        setTask({ ...task, content: { ...task.content, [field]: newItems } });
    };

    const updateDragDropItem = (field: "soll" | "haben", index: number, value: string) => {
        const newItems = [...(task.content[field] || [])];
        newItems[index] = value;
        setTask({ ...task, content: { ...task.content, [field]: newItems } });
    };

    const totalSoll =
        task.type === "drag-drop" && Array.isArray(task.content.soll)
            ? task.content.soll.reduce((sum: number, val: string) => sum + (parseFloat(val) || 0), 0)
            : 0;
    const totalHaben =
        task.type === "drag-drop" && Array.isArray(task.content.haben)
            ? task.content.haben.reduce((sum: number, val: string) => sum + (parseFloat(val) || 0), 0)
            : 0;
    const saldo = totalSoll - totalHaben;

    if (status === "loading") return <div>Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 w-full max-w-lg md:max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200"
        >
            <h2 className="text-xl sm:text-2xl font-semibold text-themecolor mb-6 text-center">
                {params.id ? "Aufgabe bearbeiten" : "Neue Aufgabe erstellen"}
            </h2>

            {/* Visibility Toggle */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sichtbarkeit</label>
                <select
                    value={task.isPublic ? "public" : "private"}
                    onChange={(e) =>
                        setTask({ ...task, isPublic: e.target.value === "public" })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                >
                    <option value="private">Privat (nur für mich)</option>
                    <option value="public">Öffentlich (für alle)</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Aufgabentyp</label>
                <select
                    value={task.type}
                    onChange={(e) => {
                        const newType = e.target.value as Task["type"];
                        let newContent: Record<string, any> = {};
                        if (newType === "booking") {
                            newContent = { bookings: [{ soll: "", haben: "", betrag: 0 }], scenario: "" };
                        } else if (newType === "multiple-choice") {
                            newContent = { question: "", options: ["", ""], correctAnswer: 0 };
                        } else if (newType === "text") {
                            newContent = { text: "", answers: [] };
                        } else if (newType === "drag-drop") {
                            newContent = { account: "", soll: [], haben: [], initialSide: "soll", anfangsbestand: 0, scenario: "" };
                        }
                        setTask({ ...task, type: newType, content: newContent });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                >
                    <option value="text">Lückentext</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="booking">Buchung</option>
                    <option value="drag-drop">Drag & Drop</option>
                </select>
            </div>

            {task.type === "text" && (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Text (z.B. {'"'}Die {0} erhöhen das {1}.{'"'})</label>
                        <textarea
                            value={task.content.text || ""}
                            onChange={(e) => setTask({ ...task, content: { ...task.content, text: limitTo10Lines(e.target.value) } })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                            rows={5}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Antworten (getrennt durch {'"'};{'"'})</label>
                        <input
                            type="text"
                            value={task.content.answers?.join("; ") || ""}
                            onChange={(e) =>
                                setTask({
                                    ...task,
                                    content: { ...task.content, answers: e.target.value.split(";").map((s) => s.trim()).filter(Boolean) },
                                })
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                        />
                    </div>
                </>
            )}

            {task.type === "multiple-choice" && (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frage</label>
                        <input
                            type="text"
                            value={task.content.question || ""}
                            onChange={(e) => setTask({ ...task, content: { ...task.content, question: e.target.value } })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Optionen (min. 2, max. 4)</label>
                        {(task.content.options || ["", ""]).map((option: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                        const newOptions = [...(task.content.options || ["", ""])];
                                        newOptions[index] = e.target.value;
                                        setTask({ ...task, content: { ...task.content, options: newOptions } });
                                    }}
                                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                                    placeholder={`Option ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setTask({ ...task, content: { ...task.content, correctAnswer: index } })}
                                    className={`p-2 rounded-full ${task.content.correctAnswer === index ? "bg-themecolor text-white" : "bg-gray-200 text-gray-700"} hover:bg-themecolorhover transition-colors`}
                                >
                                    <FaCheck />
                                </button>
                                {(task.content.options?.length || 0) > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        ))}
                        {(task.content.options?.length || 0) < 4 && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={addOption}
                                className="mt-2 flex items-center gap-1 text-themecolor hover:text-themecolorhover transition-colors"
                            >
                                <span>+</span> Option hinzufügen
                            </motion.button>
                        )}
                    </div>
                </>
            )}

            {task.type === "booking" && (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Szenario</label>
                        <textarea
                            value={task.content.scenario || ""}
                            onChange={(e) => setTask({ ...task, content: { ...task.content, scenario: limitTo10Lines(e.target.value) } })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                            rows={5}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buchungen (mind. 1, max. 4)</label>
                        {(task.content.bookings || []).map((booking: any, index: number) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2 items-start">
                                <div className="relative w-full sm:flex-1">
                                    <AccountInput
                                        field="soll"
                                        value={booking.soll || ""}
                                        onChange={(newVal) => {
                                            const newBookings = [...(task.content.bookings || [])];
                                            newBookings[index].soll = newVal;
                                            setTask({ ...task, content: { ...task.content, bookings: newBookings } });
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                                    />
                                </div>
                                <div className="relative w-full sm:flex-1">
                                    <AccountInput
                                        field="haben"
                                        value={booking.haben || ""}
                                        onChange={(newVal) => {
                                            const newBookings = [...(task.content.bookings || [])];
                                            newBookings[index].haben = newVal;
                                            setTask({ ...task, content: { ...task.content, bookings: newBookings } });
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <input
                                        type="number"
                                        placeholder="Betrag"
                                        value={booking.betrag || ""}
                                        onChange={(e) => {
                                            const newBookings = [...task.content.bookings];
                                            newBookings[index].betrag = Number(e.target.value);
                                            setTask({ ...task, content: { ...task.content, bookings: newBookings } });
                                        }}
                                        className="w-full sm:w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                                    />
                                    {(task.content.bookings?.length || 0) > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeBooking(index)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(task.content.bookings?.length || 0) < 4 && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={addBooking}
                                className="mt-2 flex items-center gap-1 text-themecolor hover:text-themecolorhover transition-colors"
                            >
                                <span>+</span> Buchung hinzufügen
                            </motion.button>
                        )}
                    </div>
                </>
            )}

            {task.type === "drag-drop" && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kontoname</label>
                    <input
                        type="text"
                        value={task.content.account || ""}
                        onChange={(e) => setTask({ ...task, content: { ...task.content, account: e.target.value } })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                    />
                    <div className="mt-4 mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Anfangsbestand Seite</label>
                        <select
                            value={task.content.initialSide || "soll"}
                            onChange={(e) => setTask({ ...task, content: { ...task.content, initialSide: e.target.value } })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                        >
                            <option value="soll">Soll</option>
                            <option value="haben">Haben</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Anfangsbestand Betrag</label>
                        <input
                            type="number"
                            value={task.content.anfangsbestand || 0}
                            onChange={(e) =>
                                setTask({ ...task, content: { ...task.content, anfangsbestand: Number(e.target.value) } })
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Szenario</label>
                        <textarea
                            value={task.content.scenario || ""}
                            onChange={(e) => setTask({ ...task, content: { ...task.content, scenario: e.target.value } })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                            rows={3}
                        />
                    </div>
                    <div className="flex gap-4 mt-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Soll (0 – 6)</label>
                            {(task.content.soll || []).map((item: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateDragDropItem("soll", index, e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                                        placeholder={`Soll ${index + 1}`}
                                    />
                                    {(task.content.soll?.length || 0) > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeDragDropItem("soll", index)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {(task.content.soll?.length || 0) < 6 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => addDragDropItem("soll")}
                                    className="mt-2 flex items-center gap-1 text-themecolor hover:text-themecolorhover transition-colors"
                                >
                                    <span>+</span> Soll hinzufügen
                                </motion.button>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Haben (0 – 6)</label>
                            {(task.content.haben || []).map((item: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateDragDropItem("haben", index, e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                                        placeholder={`Haben ${index + 1}`}
                                    />
                                    {(task.content.haben?.length || 0) > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeDragDropItem("haben", index)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {(task.content.haben?.length || 0) < 6 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => addDragDropItem("haben")}
                                    className="mt-2 flex items-center gap-1 text-themecolor hover:text-themecolorhover transition-colors"
                                >
                                    <span>+</span> Haben hinzufügen
                                </motion.button>
                            )}
                        </div>
                    </div>
                    {/* Visual Account Cross */}
                    <div className="mt-4 p-4 border border-gray-400">
                        <h3 className="text-center font-bold mb-2">{task.content.account || "Kontoname"}</h3>
                        <div className="grid grid-cols-2 gap-4 border-b pb-2 mb-2">
                            <div className="text-center">
                                <p className="font-semibold">Soll</p>
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">Haben</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-b pb-2">
                            <div className="text-center">
                                {task.content.soll?.map((item: string, i: number) => (
                                    <p key={i}>{item || "-"}</p>
                                ))}
                                {totalSoll >= totalHaben && <p className="font-semibold mt-2">(S) {saldo.toFixed(2)}</p>}
                            </div>
                            <div className="text-center">
                                {task.content.haben?.map((item: string, i: number) => (
                                    <p key={i}>{item || "-"}</p>
                                ))}
                                {totalHaben > totalSoll && <p className="font-bold mt-2">(S) {Math.abs(saldo).toFixed(2)}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="font-bold mt-2">{Math.abs(totalSoll > totalHaben ? totalSoll : totalHaben).toFixed(2)}</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold mt-2">{Math.abs(totalSoll > totalHaben ? totalSoll : totalHaben).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Multi-Select)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {task.tags.map((tag) => (
                        <span
                            key={tag}
                            className="flex items-center gap-1 px-2 py-1 bg-themecolor text-white rounded-full text-sm"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="text-white hover:text-gray-200"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Tag hinzufügen..."
                    onChange={(e) => handleTagSearch(e.target.value)}
                    onFocus={() => handleTagSearch("")}
                    onBlur={() => setTimeout(() => setTagSuggestions([]), 150)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && tagSuggestions.length > 0) {
                            e.preventDefault();
                            addTag(tagSuggestions[0]);
                        }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themecolor"
                />
                {tagSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-sm max-h-40 overflow-y-auto mt-1">
                        {tagSuggestions.map((tag) => (
                            <li
                                key={tag}
                                onClick={() => addTag(tag)}
                                className="p-2 hover:bg-themecolor hover:text-white cursor-pointer"
                            >
                                {tag}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.push("/dashboard/tasks")}
                    className="w-full sm:w-auto px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition-colors"
                >
                    {params.id ? "Zurück zu Aufgaben" : "Abbrechen"}
                </button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover transition-colors"
                >
                    Aufgabe speichern
                </motion.button>
            </div>
        </motion.form>
    );
}