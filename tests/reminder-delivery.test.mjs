import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, mockDatabase } from "./mock-module.ts";

for (const fails of [false, true]) {
  test(`reminders and follow-ups are marked sent only after successful delivery (fails=${fails})`, async () => {
    const target = new Date(Date.now() + 2 * 3600000);
    const db = mockDatabase(q => {
      if (q.table === "reva_clinics") return { data: [{ id: "clinic", name: "Clinic" }] };
      if (q.action !== "select") return { data: null };
      const patient = { name: "Patient", phone: "+10000000000" };
      if (q.table === "reva_appointments") return { data: [{ id: "appointment", patient, appointment_time: target.toISOString().slice(11, 16), appointment_date: target.toISOString().slice(0, 10) }] };
      return { data: [{ id: "follow-up", patient, template_message: "Hi {name} at {clinic}" }] };
    });
    let calls = 0;
    const { GET } = loadModule("app/api/reminders/route.ts", {
      "next/server": { NextResponse: { json: value => value } },
      "@/lib/supabase/server": { createClient: async () => db },
      "@/lib/whatsapp": { sendWhatsAppMessage: async () => { calls++; if (fails) throw new Error("No clinic credentials"); } },
    });
    const result = await GET({ headers: new Headers({ authorization: `Bearer ${process.env.CRON_SECRET}` }) });
    assert.equal(calls, 2);
    assert.deepEqual(result, { sent: fails ? 0 : 2 });
    assert.equal(db.queries.filter(q => q.action === "update").length, fails ? 0 : 2);
  });
}

test("empty clinics do not send messages or update records", async () => {
  const db = mockDatabase(() => ({ data: [] }));
  const { GET } = loadModule("app/api/reminders/route.ts", {
    "next/server": { NextResponse: { json: value => value } },
    "@/lib/supabase/server": { createClient: async () => db },
    "@/lib/whatsapp": { sendWhatsAppMessage: async () => { assert.fail("No messages expected"); } },
  });
  assert.deepEqual(await GET({ headers: new Headers() }), { sent: 0 });
});
