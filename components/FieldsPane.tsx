import { ArrowRight, LoaderCircle, Receipt, TriangleAlert } from "lucide-react";
import { checkInvoice, money } from "@/lib/check";
import type { Invoice } from "@/lib/types";
import { CheckBadge } from "./CheckBadge";

type Props = {
  invoice: Invoice | null;
  loading: boolean;
  error: string | null;
  canRead: boolean;
  onRead: () => void;
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <dt className="text-[11px] uppercase tracking-wider text-muted">{label}</dt>
    <dd className="mt-1 truncate text-sm font-medium">{value || "—"}</dd>
  </div>
);

export function FieldsPane({ invoice, loading, error, canRead, onRead }: Props) {
  return (
    <section className="card flex min-h-[560px] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Receipt size={15} strokeWidth={1.75} />
          Fields
        </div>
        <button className="pill-dark py-1.5" onClick={onRead} disabled={!canRead || loading}>
          {loading ? <LoaderCircle size={14} className="animate-spin" /> : <ArrowRight size={14} strokeWidth={2} />}
          {loading ? "Reading" : "Read"}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-5">
        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-peach/40 bg-peach/10 px-4 py-3 text-sm">
            <TriangleAlert size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-peach" />
            {error}
          </div>
        )}

        {!invoice && !error && (
          <div className="m-auto max-w-xs text-center text-sm text-muted">
            {loading
              ? "Reading the document…"
              : canRead
                ? "Press Read to extract vendor, number, date, line items, taxes and total."
                : "Upload an invoice or pick a sample to begin."}
          </div>
        )}

        {invoice && <Result invoice={invoice} />}
      </div>
    </section>
  );
}

function Result({ invoice }: { invoice: Invoice }) {
  return (
    <>
      <dl className="grid grid-cols-3 gap-4">
        <Field label="Vendor" value={invoice.vendor} />
        <Field label="Invoice no." value={invoice.number} />
        <Field label="Date" value={invoice.date} />
      </dl>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
              <th className="pb-2 font-normal">Item</th>
              <th className="pb-2 text-right font-normal">Qty</th>
              <th className="pb-2 text-right font-normal">Rate</th>
              <th className="pb-2 text-right font-normal">Amount</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {invoice.items.map((it, i) => (
              <tr key={i} className="border-b border-line/70">
                <td className="py-2.5 pr-3">{it.name}</td>
                <td className="py-2.5 text-right">{it.qty}</td>
                <td className="py-2.5 text-right">{money(it.rate)}</td>
                <td className="py-2.5 text-right">{money(it.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="ml-auto w-full max-w-64 space-y-2 text-sm tabular-nums">
        {invoice.taxes.map((t, i) => (
          <div key={i} className="flex justify-between gap-4 text-muted">
            <dt className="truncate">{t.name}</dt>
            <dd>{money(t.amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-line pt-2 font-semibold">
          <dt>Total</dt>
          <dd>{money(invoice.total)}</dd>
        </div>
      </dl>

      <div className="mt-auto">
        <CheckBadge check={checkInvoice(invoice)} />
      </div>
    </>
  );
}
