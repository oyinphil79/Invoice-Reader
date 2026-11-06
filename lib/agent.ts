import OpenAI from "openai";
import type { Invoice, ModelId } from "./types";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["vendor", "number", "date", "items", "taxes", "total"],
  properties: {
    vendor: { type: "string", description: "Name of the company that issued the invoice" },
    number: { type: "string", description: "Invoice number exactly as printed" },
    date: { type: "string", description: "Issue date exactly as printed" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "qty", "rate", "amount"],
        properties: {
          name: { type: "string" },
          qty: { type: "number" },
          rate: { type: "number" },
          amount: { type: "number" },
        },
      },
    },
    taxes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "amount"],
        properties: { name: { type: "string" }, amount: { type: "number" } },
      },
    },
    total: { type: "number", description: "Final total due as printed" },
  },
} as const;

const INSTRUCTIONS = `You read invoices and return their fields as JSON.
Copy every number exactly as it is printed on the document. Do not recalculate,
round, or correct anything, even if the arithmetic on the invoice looks wrong.
Numbers are plain values without currency symbols or thousands separators.
List every line item in order. Put each tax, VAT or levy in "taxes"; leave the
subtotal out. If a field is not printed, use an empty string, or 0 for numbers.`;

// Lowest reasoning setting each model accepts, so the read stays fast and cheap.
const EFFORT: Record<ModelId, "minimal" | "none"> = {
  "gpt-5-mini": "minimal",
  "gpt-6.1-sol": "none",
};

export type ReadInput = { data: Buffer; mime: string; filename: string };

export async function readInvoice(apiKey: string, model: ModelId, file: ReadInput): Promise<Invoice> {
  const client = new OpenAI({ apiKey });
  const dataUrl = `data:${file.mime};base64,${file.data.toString("base64")}`;
  const doc =
    file.mime === "application/pdf"
      ? { type: "input_file" as const, filename: file.filename, file_data: dataUrl }
      : { type: "input_image" as const, image_url: dataUrl, detail: "high" as const };

  const res = await client.responses.create({
    model,
    instructions: INSTRUCTIONS,
    reasoning: { effort: EFFORT[model] },
    input: [{ role: "user", content: [doc, { type: "input_text", text: "Extract this invoice." }] }],
    text: { format: { type: "json_schema", name: "invoice", strict: true, schema: SCHEMA } },
  });

  if (!res.output_text) throw new Error("The model returned no data.");
  return JSON.parse(res.output_text) as Invoice;
}
