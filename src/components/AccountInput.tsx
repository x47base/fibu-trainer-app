import { useState } from "react";
import ACCOUNTS from "@/lib/financeaccounts";

interface AccountInputProps {
    field: "soll" | "haben";
    value: string;
    onChange: (newValue: string) => void;
    placeholder?: string;
    className?: string;
}

export default function AccountInput({ field, value, onChange, placeholder, className }: AccountInputProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        onChange(inputValue);
        const filtered = ACCOUNTS.filter(acc =>
            acc.name.toLowerCase().includes(inputValue.toLowerCase()) ||
            acc.aliases.some(alias => alias.toLowerCase().includes(inputValue.toLowerCase()))
        ).map(acc => acc.name);
        setSuggestions(filtered);
        setShowSuggestions(true);
    };

    const handleBlur = () => {
        setTimeout(() => setShowSuggestions(false), 150);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && suggestions.length > 0) {
            e.preventDefault();
            onChange(suggestions[0]);
            setShowSuggestions(false);
        }
    };

    const handleSelect = (account: string) => {
        onChange(account);
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <input
                type="text"
                placeholder={placeholder || (field === "soll" ? "Soll" : "Haben")}
                value={value}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={className}
            />
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-sm max-h-40 overflow-y-auto mt-1">
                    {suggestions.map(suggestion => (
                        <li
                            key={suggestion}
                            onClick={() => handleSelect(suggestion)}
                            className="p-2 hover:bg-themecolor hover:text-white cursor-pointer"
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
