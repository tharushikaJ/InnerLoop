import { Link } from "react-router-dom";

export default function Brand({ compact = false, to = "/dashboard" }) {
  return (
    <Link to={to} className="group flex items-center gap-3" aria-label="InnerLoop home">
      <span className="relative block h-11 w-11 shrink-0" aria-hidden="true">
        <span className="absolute left-1 top-0 h-7 w-2 -rotate-[30deg] rounded-full bg-sky-500 transition group-hover:-translate-y-0.5" />
        <span className="absolute left-3.5 top-5 h-7 w-2 -rotate-[30deg] rounded-full bg-[#075fae] transition group-hover:translate-y-0.5" />
        <span className="absolute right-1 top-4 h-5 w-2 -rotate-[30deg] rounded-full bg-[#23b51f]" />
        <span className="absolute left-[21px] top-[21px] h-2 w-2 rounded-full bg-[#23b51f]" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[22px] font-extrabold tracking-[-0.055em] text-[#075fae]">INNER<span className="text-[#20b51d]">LOOP</span></span>
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.33em] text-slate-500">The connection</span>
        </span>
      )}
    </Link>
  );
}
