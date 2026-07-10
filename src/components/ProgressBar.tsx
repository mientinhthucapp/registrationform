export default function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = (step / total) * 100;
  return (
    <div className="mb-6">
      <span className="text-xs font-semibold tracking-wide text-primary whitespace-nowrap">Bước {step} / {total}</span>
      <div className="mt-2 h-1.5 bg-[#eadfce] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-[#ffad6b] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
