'use client';

import { Textarea } from "./ui/textarea";

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  disabled?: boolean;
}

export function CodeEditor({ code, setCode, disabled }: CodeEditorProps) {
  return (
    <div className="relative h-full">
      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="// Cole seu código aqui ou importe um arquivo para começar"
        className="h-full w-full font-code text-sm !bg-white border-input resize-none shadow-lg"
        disabled={disabled}
      />
    </div>
  );
}
