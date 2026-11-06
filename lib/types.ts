export type LineItem = { name: string; qty: number; rate: number; amount: number };
export type Tax = { name: string; amount: number };

export type Invoice = {
  vendor: string;
  number: string;
  date: string;
  items: LineItem[];
  taxes: Tax[];
  total: number;
};

export const MODELS = [
  { id: "gpt-5-mini", label: "GPT-5 mini" },
  { id: "gpt-6.1-sol", label: "GPT-6.1 Sol" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export const ACCEPTED = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
export const MAX_BYTES = 8 * 1024 * 1024;
export const KEY_STORAGE = "openai-key";
export const KEY_HEADER = "x-openai-key";
