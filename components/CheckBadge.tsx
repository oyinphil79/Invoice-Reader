import { CircleAlert, CircleCheck } from "lucide-react";
import { money, type Check } from "@/lib/check";

export function CheckBadge({ check }: { check: Check }) {
  const ok = check.matches;
  return (
    <div className={`rounded-2xl border px-4 py-3 ${ok ? "border-mint/30 bg-mint/5" : "border-peach/40 bg-peach/10"}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        {ok ? (
          <CircleCheck size={16} strokeWidth={1.75} className="text-mint" />
        ) : (
          <CircleAlert size={16} strokeWidth={1.75} className="text-peach" />
        )}
        {ok ? "Total matches" : `Off by ${money(Math.abs(check.gap))}`}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Lines {money(check.itemsSum)} + tax {money(check.taxSum)} = {money(check.computed)}
        {ok ? ", same as the printed total." : `, but the invoice prints ${money(check.printed)} (${check.gap > 0 ? "higher" : "lower"}).`}
      </p>
    </div>
  );
}
