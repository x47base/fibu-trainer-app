import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

interface DragDropProps {
    task: any;
    stats: { correct: number; incorrect: number; notDone: number };
    onResult: (isCorrect: boolean) => void;
    onNext: () => void;
    onSkip: () => void;
    onBack: () => void;
}

interface DraggableItemProps {
    value: string;
    type: string;
}

const ItemType = "AMOUNT";

const DraggableItem: React.FC<DraggableItemProps> = ({ value, type }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemType,
        item: { value, type },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            className={`p-2 bg-themecolor/20 rounded-lg cursor-move ${isDragging ? "opacity-50" : "opacity-100"}`}
        >
            {value}
        </div>
    );
};

interface DropZoneProps {
    side: "soll" | "haben";
    items: string[];
    onDrop: (item: { value: string; type: string }) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ side, items, onDrop }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemType,
        drop: (item: { value: string; type: string }) => onDrop(item),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div
            ref={drop}
            className={`w-1/2 p-4 border ${side === "soll" ? "border-l-2 border-t-2" : "border-r-2 border-t-2"} ${isOver ? "bg-themecolor/10" : ""}`}
        >
            <h3 className="font-semibold text-center">{side === "soll" ? "Soll" : "Haben"}</h3>
            <div className="mt-2 flex flex-col gap-2">
                {items.map((item, index) => (
                    <div key={index} className="p-2 bg-themecolor/20 rounded-lg">
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function DragDrop({ task, stats, onResult, onNext, onSkip, onBack }: DragDropProps) {
    const [sollItems, setSollItems] = useState<string[]>([]);
    const [habenItems, setHabenItems] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    useEffect(() => {
        setSollItems([]);
        setHabenItems([]);
        setIsCorrect(null);
    }, [task]);

    if (!task) {
        return <div>Lade Aufgabe...</div>;
    }

    const availableItems = [...(task.content.soll || []), ...(task.content.haben || [])];

    const handleDrop = (item: { value: string; type: string }, side: "soll" | "haben") => {
        if (side === "soll") {
            setSollItems((prev) => [...prev, item.value]);
        } else {
            setHabenItems((prev) => [...prev, item.value]);
        }
    };

    const handleValidate = async () => {
        const isValid = await Validate(task, sollItems, habenItems);
        setIsCorrect(isValid);
        onResult(isValid);
    };

    const chartData = [
        { name: "Richtig", value: stats.correct, color: "#22C55E" },
        { name: "Falsch", value: stats.incorrect, color: "#EF4444" },
        { name: "Offen", value: stats.notDone, color: "#9CA3AF" },
    ];

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="p-4">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Task Content */}
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-6 text-center md:text-left">Kontenkreuz Aufgabe</h2>
                        <p className="mb-4 text-center md:text-left">Ziehe die Beträge in die richtige Seite des Kontenkreuzes für {task.content.account}:</p>
                        <div className="flex w-full max-w-lg border-b-2 border-themecolor mx-auto md:mx-0">
                            <DropZone side="soll" items={sollItems} onDrop={(item) => handleDrop(item, "soll")} />
                            <DropZone side="haben" items={habenItems} onDrop={(item) => handleDrop(item, "haben")} />
                        </div>
                        <div className="mt-6">
                            <h3 className="font-semibold mb-2 text-center md:text-left">Verfügbare Beträge:</h3>
                            <div className="flex gap-4 flex-wrap justify-center md:justify-start">
                                {availableItems.map((value, index) => (
                                    <DraggableItem key={index} value={value} type="amount" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats UI */}
                    <div className="w-full md:w-40 flex flex-col items-center">
                        <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                            <h3 className="text-sm font-semibold text-themecolor mb-2 text-center">Statistiken</h3>
                            <PieChart width={80} height={80}>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={35}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                            <div className="flex justify-center gap-2 mt-2 text-xs">
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span>R: {stats.correct}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    <span>F: {stats.incorrect}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                    <span>O: {stats.notDone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6 flex-wrap justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBack}
                        className="px-3 py-2 bg-gray-500 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-gray-600"
                    >
                        Zurück
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onSkip}
                        className="px-3 py-2 bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-md hover:bg-gray-400"
                    >
                        Überspringen
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleValidate}
                        className="px-3 py-2 bg-themecolor text-white text-sm font-semibold rounded-lg shadow-md hover:bg-themecolorhover"
                    >
                        Prüfen
                    </motion.button>
                    {isCorrect && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onNext}
                            className="px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700"
                        >
                            Nächste Aufgabe
                        </motion.button>
                    )}
                </div>

                {/* Feedback */}
                {isCorrect !== null && (
                    <div className={`mt-4 px-4 py-2 rounded-lg text-white text-center ${isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                        {isCorrect ? "Richtige Buchung!" : "Falsche Buchung. Bitte überprüfen."}
                    </div>
                )}
            </div>
        </DndProvider>
    );
}

async function Validate(task: any, sollItems: string[], habenItems: string[]) {
    const expectedSoll = task.content.soll || [];
    const expectedHaben = task.content.haben || [];

    const isSollCorrect = expectedSoll.length === sollItems.length && expectedSoll.every((item: string) => sollItems.includes(item));
    const isHabenCorrect = expectedHaben.length === habenItems.length && expectedHaben.every((item: string) => habenItems.includes(item));

    return isSollCorrect && isHabenCorrect;
}