import OpenAI from "openai";
import { readInvoice } from "@/lib/agent";
import { ACCEPTED, KEY_HEADER, MAX_BYTES, MODELS, type ModelId } from "@/lib/types";

export const runtime = "nodejs";

const fail = (status: number, error: string) => Response.json({ error }, { status });

export async function POST(req: Request) {
  // The visitor's key wins; the server key is only a fallback. Neither is logged or stored.
  const apiKey = req.headers.get(KEY_HEADER)?.trim() || process.env.OPENAI_API_KEY;
  if (!apiKey) return fail(401, "missing key");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "Send the invoice as form data.");
  }

  const file = form.get("file");
  const model = String(form.get("model") ?? "");
  if (!(file instanceof File)) return fail(400, "No file was sent.");
  if (!ACCEPTED.includes(file.type)) return fail(415, "Use a PDF, PNG, JPG or WEBP file.");
  if (file.size > MAX_BYTES) return fail(413, "The file is larger than 8 MB.");
  if (!MODELS.some((m) => m.id === model)) return fail(400, "Unknown model.");

  try {
    const invoice = await readInvoice(apiKey, model as ModelId, {
      data: Buffer.from(await file.arrayBuffer()),
      mime: file.type,
      filename: file.name || "invoice",
    });
    return Response.json({ invoice });
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      if (err.status === 401) return fail(401, "invalid key");
      if (err.status === 429) return fail(429, "Rate limit reached. Try again in a moment.");
      return fail(502, err.message || "The model request failed.");
    }
    return fail(500, "Could not read this invoice.");
  }
}
