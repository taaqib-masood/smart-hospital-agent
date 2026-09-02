import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(120),
  clinic: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  plan: z.enum(["Clinic Pro", "Hospital Group", "One-Pager", "Starter", "Walkthrough", "Pilot"]).or(z.string()),
  slot: z.string().trim().max(100).optional().or(z.literal("")),
  specialty: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

/* ---- Simple in-memory rate limiter (per-IP, sliding window) ---- */
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5; // submissions per window
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Opportunistic cleanup so the map never grows unbounded.
  if (hits.size > 500) {
    for (const [key, entry] of hits) {
      if (entry.resetAt < now) hits.delete(key);
    }
  }

  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Honeypot — the hidden "company_website" field is never visible to
    // humans. If a bot filled it, silently accept (fake success) and drop
    // the payload so the bot has no reason to retry.
    const honeypot = body?.company_website;
    if (typeof honeypot === "string" ? honeypot.trim() !== "" : Boolean(honeypot)) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request. Please check your details." },
        { status: 400 }
      );
    }

    const leadId = "lead_" + Date.now();

    try {
      const supabase = await createClient();
      await supabase.from("leads").insert([{
        id: leadId,
        ...parsed.data,
        created_at: new Date().toISOString()
      }]);
    } catch {
      // Gracefully continue even if table not yet created
    }

    return NextResponse.json({ ok: true, id: leadId }, { status: 201 });
  } catch (error) {
    console.error("Failed to save lead:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
