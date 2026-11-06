"use client";

import { useState } from "react";
import { KeyRound, ScanText } from "lucide-react";
import { MODELS, type ModelId } from "@/lib/types";

type Props = {
  apiKey: string;
  onKey: (key: string) => void;
  model: ModelId;
  onModel: (m: ModelId) => void;
};

export function Header({ apiKey, onKey, model, onModel }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-xl bg-ink text-white">
          <ScanText size={16} strokeWidth={1.75} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Invoice Reader</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {open ? (
          <input
            autoFocus
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => onKey(e.target.value)}
            onBlur={() => setOpen(false)}
            className="w-56 rounded-full border border-line bg-white px-4 py-2 font-mono text-xs outline-none focus:border-ink/30"
          />
        ) : (
          <button className="pill-light" onClick={() => setOpen(true)}>
            <KeyRound size={14} strokeWidth={1.75} />
            {apiKey ? "Key added" : "Add OpenAI key"}
            <span className={`size-1.5 rounded-full ${apiKey ? "bg-mint" : "bg-line"}`} />
          </button>
        )}

        <div role="radiogroup" aria-label="Model" className="flex rounded-full border border-line bg-white p-1">
          {MODELS.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={model === m.id}
              onClick={() => onModel(m.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                model === m.id ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
