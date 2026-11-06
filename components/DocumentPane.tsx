"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { SAMPLES } from "./samples";

export type Preview = { url: string; mime: string; name: string };

type Props = {
  preview: Preview | null;
  sampleId: string | null;
  onFile: (f: File) => void;
  onSample: (id: string) => void;
  onClear: () => void;
};

export function DocumentPane({ preview, sampleId, onFile, onSample, onClear }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <section className="card flex min-h-[560px] flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2 text-sm text-muted">
          <FileText size={15} strokeWidth={1.75} className="shrink-0" />
          <span className="truncate">{preview?.name ?? "Document"}</span>
        </div>
        {preview && (
          <button onClick={onClear} className="text-muted transition hover:text-ink" aria-label="Remove document">
            <X size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col bg-page/60 p-4">
        {preview ? (
          preview.mime === "application/pdf" ? (
            <iframe src={preview.url} title={preview.name} className="min-h-[480px] w-full flex-1 rounded-2xl bg-white" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview.url} alt={preview.name} className="mx-auto w-full rounded-2xl bg-white object-contain shadow-card" />
          )
        ) : (
          <button
            onClick={() => input.current?.click()}
            onDragOver={(e) => (e.preventDefault(), setDrag(true))}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files[0];
              if (f) onFile(f);
            }}
            className={`flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 text-center transition ${
              drag ? "border-ink/40 bg-white" : "border-line hover:border-ink/25 hover:bg-white/70"
            }`}
          >
            <span className="grid size-11 place-items-center rounded-full border border-line bg-white">
              <Upload size={18} strokeWidth={1.75} />
            </span>
            <span className="text-sm font-medium">Drop an invoice here, or click to browse</span>
            <span className="text-xs text-muted">PDF, PNG, JPG or WEBP · up to 8 MB</span>
          </button>
        )}
        <input
          ref={input}
          type="file"
          hidden
          accept="application/pdf,image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3.5">
        <span className="mr-1 text-xs text-muted">Samples</span>
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            onClick={() => onSample(s.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${
              sampleId === s.id ? "border-ink/30 bg-white text-ink" : "border-line text-muted hover:text-ink"
            }`}
          >
            <span className={`size-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </button>
        ))}
      </div>
    </section>
  );
}
