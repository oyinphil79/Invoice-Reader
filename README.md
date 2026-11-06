# Invoice Reader

Upload an invoice PDF or image, or pick a sample, and get the same fields every time:
vendor, invoice number, date, line items, taxes and total. The document sits on the
left and the fields on the right.

## Run

```bash
npm install
npm run dev
```

Add your OpenAI key with the key button at the top right. It is kept in `sessionStorage`
(`openai-key`) and sent per request as `x-openai-key`. If no key is sent, the server falls
back to `OPENAI_API_KEY` (see `.env.example`). Keys are never logged or stored on the server.

## How it works

- `lib/agent.ts` sends the PDF or image to the OpenAI Responses API with a strict JSON
  schema (`gpt-5-mini` by default, `gpt-6.1-sol` as the cheaper option) at the lowest
  reasoning setting. The model is told to copy printed numbers and not fix the arithmetic.
- `lib/check.ts` adds the line amounts and taxes in code (in cents) and compares them with
  the printed total. The page shows a match or the gap.
- `app/api/read/route.ts` validates the upload (PDF, PNG, JPG, WEBP, up to 8 MB).
- `app/assets/invoice-2.png` (CloudFlow) deliberately prints a total 10.00 higher than its
  lines plus tax, so the check has a mismatch to show.
