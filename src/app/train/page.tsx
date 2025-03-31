"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { IoArrowForwardSharp } from "react-icons/io5";
import Buchung from "@/components/aufgaben/Buchung"; // Stelle sicher, dass der Pfad stimmt
import MultipleChoice from "@/components/aufgaben/MultipleChoice";
import DragDrop from "@/components/aufgaben/MultipleChoice"; //import drag n drop
import Texts from "@/components/aufgaben/MultipleChoice"; //import lueckentext


import Texts , { Validate } from "@/components/aufgaben/Texts";


export default function TrainPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedTask, setSelectedTask] = useState("buchungen");
    const [showBuchung, setShowBuchung] = useState(false); // Zeigt die Buchung an und versteckt das Menü
    const [showMultipleChoice, setShowMultipleChoice] = useState(false); // Zeigt die Buchung an und versteckt das Menü
    const [showDragDrop, setShowDragDrop] = useState(false); // Zeigt die Buchung an und versteckt das Menü
    const [showTexts, setShowTexts] = useState(false); // Zeigt die Buchung an und versteckt das Menü

    useEffect(() => {
        if (status === "loading") return;
        // @ts-ignore
        if (!session || status === "unauthenticated") {
            router.push("/signin");
        }
    }, [session, status, router]);

    if (status === "loading") return <div>Loading... Refresh if screen stays.</div>;

    return (
        <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center p-8">
            <main className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mt-6">
                {/* Auswahlmenü nur anzeigen, wenn Buchung NICHT gestartet wurde */}
                {!showBuchung &&  !showMultipleChoice && !showDragDrop && !showTexts && (
                    <>
                        <h2 className="text-xl font-bold text-center">Select Screen</h2>
                        <p className="text-center text-gray-500">Select the type of task you would like to train.</p>

                        <div className="grid grid-cols-2 gap-6 mt-6">
                            <div
                                className={`p-4 border rounded-lg cursor-pointer ${selectedTask === "kreuze" ? "border-themecolor" : "border-gray-300"}`}
                                onClick={() => setSelectedTask("kreuze")}
                            >
                                <h3 className="font-semibold">Konten Kreuze</h3>
                                <p className="text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            </div>
                            <div
                                className={`p-4 border rounded-lg cursor-pointer ${selectedTask === "buchungen" ? "border-themecolor" : "border-gray-300"}`}
                                onClick={() => setSelectedTask("buchungen")}
                            >
                                <h3 className="font-semibold">Buchungen</h3>
                                <p className="text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            </div>
                            <div
                                className={`p-4 border rounded-lg cursor-pointer ${selectedTask === "multiple-choice" ? "border-themecolor" : "border-gray-300"}`}
                                onClick={() => setSelectedTask("multiple-choice")}
                            >
                                <h3 className="font-semibold">Multiple Choice</h3>
                                <p className="text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            </div>
                            <div
                                className={`p-4 border rounded-lg cursor-pointer ${selectedTask === "lueckentext" ? "border-themecolor" : "border-gray-300"}`}
                                onClick={() => setSelectedTask("lueckentext")}
                            >
                                <h3 className="font-semibold">Lückentext</h3>
                                <p className="text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center mt-6">
                            <button
                                onClick={() => {
                                    if (selectedTask == "buchungen") {
                                        setShowBuchung(true);
                                    } else {
                                        if (selectedTask == "multiple-choice"){
                                            setShowMultipleChoice(true)
                                        } else{
                                            if (selectedTask == "lueckentext"){
                                                setShowTexts(true)
                                            } else {
                                                if (selectedTask == "kreuze"){
                                                    setShowDragDrop(true)
                                                }
                                    }
                                        }
                                }
                                }
                            }

                                className="px-6 py-2 bg-themecolor text-white rounded-lg flex items-center gap-2"
                            >
                                Training starten!
                            </button>
                        </div>
                    </>
                )}

                {/* Buchung-Component anzeigen, wenn showBuchung true ist */}
                {showBuchung && <Buchung taskId={1} />}
                {showMultipleChoice &&<MultipleChoice taskId={1} />}
            </main>

        </div>
    );
}
