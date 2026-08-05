export default function PriorityChip({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    low: "bg-slate-50 text-slate-400 border-slate-200",
    medium: "bg-blue-50 text-[#0284C7] border-blue-100",
    high: "bg-orange-50 text-[#F59E0B] border-orange-100",
    critical: "bg-red-50 text-[#EF4444] border-red-100 animate-pulse",
  };

  const currentStyle = styles[priority.toLowerCase()] || "bg-slate-900 text-slate-400 border-slate-800";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border font-mono ${currentStyle}`}>
      {priority}
    </span>
  );
}
