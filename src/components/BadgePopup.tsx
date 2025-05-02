import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { FaStar, FaMedal, FaTrophy, FaBook } from "react-icons/fa";

interface Badge {
    id: string;
    name: string;
    description: string;
    awardedAt: string;
}

interface BadgePopupProps {
    badges: Badge[];
    onClose: () => void;
}

export default function BadgePopup({ badges, onClose }: BadgePopupProps) {
    const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    const handleNext = () => {
        if (currentBadgeIndex < badges.length - 1) {
            setCurrentBadgeIndex(currentBadgeIndex + 1);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        } else {
            onClose();
        }
    };

    const badgeIcons: { [key: string]: JSX.Element } = {
        "first-exam": <FaStar className="text-yellow-400" />,
        "high-scorer": <FaMedal className="text-gray-400" />,
        "task-master": <FaTrophy className="text-yellow-600" />,
        "exam-veteran": <FaBook className="text-blue-600" />,
        "perfect-score": <FaTrophy className="text-gold-500" />,
    };

    const currentBadge = badges[currentBadgeIndex];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    numberOfPieces={200}
                    recycle={false}
                />
            )}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-xl"
            >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-5xl">
                        {badgeIcons[currentBadge.id] || <FaStar className="text-yellow-400" />}
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-themecolor mb-2">Neues Abzeichen!</h2>
                <h3 className="text-xl font-semibold text-gray-800">{currentBadge.name}</h3>
                <p className="text-gray-600 mt-2">{currentBadge.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                    Verliehen am {new Date(currentBadge.awardedAt).toLocaleDateString("de-DE")}
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="mt-6 px-6 py-2 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover"
                >
                    {currentBadgeIndex < badges.length - 1 ? "Nächstes Abzeichen" : "Schließen"}
                </motion.button>
            </motion.div>
        </div>
    );
}