"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ConsentDetails = {
  patient: { name: string };
  template: { name: string; version: number; body: string };
  clinic: { name: string };
};

export default function ConsentSigningPage() {
  const { token } = useParams<{ token: string }>();
  const [consent, setConsent] = useState<ConsentDetails | null>(null);
  const [signerName, setSignerName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "submitting" | "signed" | "error">("loading");

  useEffect(() => {
    void fetch(`/api/consents/public/${encodeURIComponent(token)}`)
      .then(async response => {
        if (!response.ok) throw new Error();
        const data = await response.json();
        setConsent(data.consent);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    const response = await fetch(`/api/consents/public/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signer_name: signerName, accepted }),
    });
    setStatus(response.ok ? "signed" : "error");
  }

  if (status === "loading") return <main className="min-h-screen grid place-items-center bg-slate-50 text-slate-600">Loading consent…</main>;
  if (status === "error" || !consent) return <main className="min-h-screen grid place-items-center bg-slate-50 text-slate-700">This consent link is invalid, expired, or already completed.</main>;
  if (status === "signed") return <main className="min-h-screen grid place-items-center bg-slate-50"><div className="max-w-md rounded-2xl bg-white p-8 shadow-sm text-center"><h1 className="text-xl font-bold text-emerald-800">Consent recorded</h1><p className="mt-2 text-sm text-slate-600">You may now close this page.</p></div></main>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <form onSubmit={submit} className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-emerald-800">{consent.clinic.name}</p>
        <h1 className="mt-2 text-2xl font-bold">{consent.template.name}</h1>
        <p className="mt-1 text-xs text-slate-500">Version {consent.template.version} · Prepared for {consent.patient.name}</p>
        <div className="my-6 whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">{consent.template.body}</div>
        <label className="block text-sm font-semibold" htmlFor="signer-name">Full name</label>
        <input id="signer-name" value={signerName} onChange={event => setSignerName(event.target.value)} required minLength={2} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" />
        <label className="mt-4 flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} required className="mt-1" />
          <span>I have read this document and agree to the terms shown above.</span>
        </label>
        <button disabled={status === "submitting"} className="mt-6 w-full rounded-lg bg-[#00685f] px-4 py-3 font-bold text-white disabled:opacity-60">
          {status === "submitting" ? "Recording…" : "Agree and sign"}
        </button>
      </form>
    </main>
  );
}
