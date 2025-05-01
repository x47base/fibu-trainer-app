export const TASK_TYPE_MAP: Record<string, string> = {
    kreuze: "drag-drop",
    buchungen: "booking",
    lueckentext: "text",
    "multiple-choice": "multiple-choice",
};

export const getCanonicalTaskType = (displayType: string): string => {
    return TASK_TYPE_MAP[displayType.toLowerCase()] || displayType;
};