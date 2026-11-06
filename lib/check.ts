import type { Invoice } from "./types";

export type Check = {
  itemsSum: number;
  taxSum: number;
  computed: number;
  printed: number;
  gap: number;
  matches: boolean;
};

// Work in integer cents so 0.1 + 0.2 style float drift never creates a fake gap.
const cents = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100);

export function checkInvoice(inv: Invoice): Check {
  const items = inv.items.reduce((s, i) => s + cents(i.amount), 0);
  const taxes = inv.taxes.reduce((s, t) => s + cents(t.amount), 0);
  const printed = cents(inv.total);
  const computed = items + taxes;
  const gap = printed - computed;
  return {
    itemsSum: items / 100,
    taxSum: taxes / 100,
    computed: computed / 100,
    printed: printed / 100,
    gap: gap / 100,
    matches: gap === 0,
  };
}

export const money = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
