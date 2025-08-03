'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'cpp', label: 'C++' },
    { value: 'php', label: 'PHP' },
];

interface LanguageSelectProps {
  language: string;
  setLanguage: (language: string) => void;
  disabled?: boolean;
}

export function LanguageSelect({ language, setLanguage, disabled }: LanguageSelectProps) {
  return (
    <Select value={language} onValueChange={setLanguage} disabled={disabled}>
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder="Selecione a linguagem" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
