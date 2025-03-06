"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function BackgroundGrid() {
    const cellSize = 30;
    const [cols, setCols] = useState(0);
    const [rows, setRows] = useState(0);

    useEffect(() => {
        function updateGrid() {
            const containerWidth = window.innerWidth * 0.7;
            const containerHeight = window.innerHeight * 0.7;
            const newCols = Math.floor(containerWidth / cellSize);
            const newRows = Math.floor(containerHeight / cellSize);
            setCols(newCols);
            setRows(newRows);
        }
        updateGrid();
        window.addEventListener("resize", updateGrid);
        return () => window.removeEventListener("resize", updateGrid);
    }, []);

    const totalCells = cols * rows;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="pointer-events-none absolute z-[-1]"
            style={{
                width: `${cols * cellSize}px`,
                height: `${rows * cellSize}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            }}
        >
            {Array.from({ length: totalCells }).map((_, index) => {
                const rowIndex = Math.floor(index / cols);
                const colIndex = index % cols;

                let borderClasses = "border border-gray-300/60";
                if (colIndex === cols - 1) {
                    borderClasses += " border-r-0";
                }
                if (rowIndex === rows - 1) {
                    borderClasses += " border-b-0";
                }
                if (colIndex === 0) {
                    borderClasses += " border-l-0";
                }
                if (rowIndex === 0) {
                    borderClasses += " border-t-0";
                }
                return <div key={index} className={`bg-transparent ${borderClasses}`} />;
            })}
        </motion.div>
    );
}