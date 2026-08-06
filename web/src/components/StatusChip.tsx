export default function StatusChip({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending_ai_analysis: "bg-slate-50 text-slate-400 border-slate-200",
    ai_processing: "bg-blue-50 text-[#0284C7] border-blue-100",
    under_verification: "bg-yellow-50 text-[#EAB308] border-yellow-100",
    ai_analyzed: "bg-yellow-50 text-[#EAB308] border-yellow-100",
    fused: "bg-purple-50 text-purple-600 border-purple-100",
    verified: "bg-emerald-50 text-[#22C55E] border-emerald-100",
    rejected: "bg-red-50 text-[#EF4444] border-red-100",
    resolved: "bg-slate-100 text-[#64748B] border-slate-200",
    unverified: "bg-yellow-50 text-[#EAB308] border-yellow-100",
    probable: "bg-orange-50 text-[#F59E0B] border-orange-100",
    confirmed: "bg-red-50 text-[#EF4444] border-red-100",
  };

  const formatted = status.toLowerCase().replace(/_/g, " ");
  const currentStyle = styles[status.toLowerCase()] || "bg-slate-800 text-slate-400 border-slate-700";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border font-mono ${currentStyle}`}>
      {formatted}
    </span>
  );
}
