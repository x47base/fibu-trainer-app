import { useState } from "react";
import { motion } from "framer-motion";

export default function TaskImportTxt() {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setMessage("Please select a .txt file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/tasks/importtxt", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            setMessage(result.message);
        } catch (error) {
            setMessage("Error importing tasks");
            console.error(error);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-themecolor">
                Import Tasks from TXT
            </h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                    className="mb-4 w-full p-2 border rounded"
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="w-full px-4 py-2 bg-themecolor text-white rounded-lg"
                >
                    Import
                </motion.button>
            </form>
            {message && (
                <p
                    className={`mt-4 text-center ${message.includes("Error") ? "text-red-500" : "text-green-500"
                        }`}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
