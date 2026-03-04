"use client";

import { Languages } from "lucide-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Language = "en" | "th" | "mm" | "sh";

interface LanguageStore {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const useLanguage = create<LanguageStore>()(
    persist(
        (set) => ({
            language: "th",
            setLanguage: (language) => set({ language }),
        }),
        {
            name: "language-storage",
        },
    ),
);

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const languages = {
        en: "English",
        th: "ไทย",
        mm: "မြန်မာ",
        sh: "Shan",
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Languages className="h-4 w-4 mr-2" />
                    {languages[language]}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {Object.entries(languages).map(([code, name]) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => setLanguage(code as Language)}
                    >
                        {name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
