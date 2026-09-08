export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f8f7] p-6 text-[#0F172A]">
      <div role="status" className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-white px-5 py-4 shadow-sm">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#00685f] text-sm font-black text-white animate-pulse">R</span>
        <div>
          <p className="text-sm font-bold">Preparing your reception workspace</p>
          <p className="text-xs text-slate-500">Loading clinic operations securely…</p>
        </div>
      </div>
    </main>
  );
}
