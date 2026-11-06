"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { DocumentPane, type Preview } from "@/components/DocumentPane";
import { FieldsPane } from "@/components/FieldsPane";
import { SAMPLES, sampleFile } from "@/components/samples";
import { ACCEPTED, KEY_HEADER, KEY_STORAGE, MAX_BYTES, type Invoice, type ModelId } from "@/lib/types";

type Source = { kind: "file"; file: File } | { kind: "sample"; id: string } | null;

const KEY_MISSING = "Add your OpenAI API key at the top of the page.";

function readKey() {
  try {
    return sessionStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState<ModelId>("gpt-5-mini");
  const [source, setSource] = useState<Source>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setApiKey(readKey()), []);

  // Build the left-hand preview from whatever is selected; free blob URLs on change.
  useEffect(() => {
    if (!source) return setPreview(null);
    if (source.kind === "sample") {
      const s = SAMPLES.find((x) => x.id === source.id)!;
      return setPreview({ url: s.src, mime: "image/png", name: s.filename });
    }
    const url = URL.createObjectURL(source.file);
    setPreview({ url, mime: source.file.type, name: source.file.name });
    return () => URL.revokeObjectURL(url);
  }, [source]);

  const saveKey = (k: string) => {
    setApiKey(k);
    try {
      if (k) sessionStorage.setItem(KEY_STORAGE, k);
      else sessionStorage.removeItem(KEY_STORAGE);
    } catch {}
  };

  const choose = (next: Source) => {
    setSource(next);
    setInvoice(null);
    setError(null);
  };

  const pickFile = (f: File) => {
    if (!ACCEPTED.includes(f.type)) return setError("Use a PDF, PNG, JPG or WEBP file.");
    if (f.size > MAX_BYTES) return setError("The file is larger than 8 MB.");
    choose({ kind: "file", file: f });
  };

  const read = async () => {
    if (!source) return;
    setLoading(true);
    setError(null);
    setInvoice(null);
    try {
      const file = source.kind === "file" ? source.file : await sampleFile(SAMPLES.find((s) => s.id === source.id)!);
      const body = new FormData();
      body.append("file", file);
      body.append("model", model);
      const headers: HeadersInit = apiKey.trim() ? { [KEY_HEADER]: apiKey.trim() } : {};
      const res = await fetch("/api/read", { method: "POST", headers, body });
      if (res.status === 401) return setError(KEY_MISSING);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return setError(json.error ?? "Something went wrong. Please try again.");
      setInvoice(json.invoice as Invoice);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8">
      <Header apiKey={apiKey} onKey={saveKey} model={model} onModel={setModel} />

      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Read any invoice.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Upload a PDF or image and get the same fields every time: vendor, number, date, line items, taxes and
          total, with the arithmetic checked in code.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentPane
          preview={preview}
          sampleId={source?.kind === "sample" ? source.id : null}
          onFile={pickFile}
          onSample={(id) => choose({ kind: "sample", id })}
          onClear={() => choose(null)}
        />
        <FieldsPane invoice={invoice} loading={loading} error={error} canRead={!!source} onRead={read} />
      </div>
    </main>
  );
}
