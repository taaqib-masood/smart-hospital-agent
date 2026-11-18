import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, mockDatabase } from "./mock-module.ts";

process.env.CRON_SECRET = "test-cron-secret";

const load = (db, sendWhatsAppMessage) => loadModule("app/api/reminders/route.ts", {
  "next/server": { NextResponse: { json: (value, init) => init ? { ...value, status: init.status } : value } },
  "@/lib/supabase/admin": { createAdminClient: () => db },
  "@/lib/whatsapp-credentials": { getWhatsAppCredentials: async () => ({ phoneId: "phone", token: "token" }) },
  "@/lib/whatsapp": { sendWhatsAppMessage },
});

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
    const { GET } = load(db, async () => { calls++; if (fails) throw new Error("No clinic credentials"); });
    const result = await GET({ headers: new Headers({ authorization: `Bearer ${process.env.CRON_SECRET}` }) });
    assert.equal(calls, 2);
    assert.deepEqual(result, { sent: fails ? 0 : 2 });
    assert.equal(db.queries.filter(q => q.action === "update").length, fails ? 0 : 2);
  });
}

test("empty clinics do not send messages or update records", async () => {
  const db = mockDatabase(() => ({ data: [] }));
  const { POST } = load(db, async () => { assert.fail("No messages expected"); });
  assert.deepEqual(await POST({ headers: new Headers({ "x-cron-secret": process.env.CRON_SECRET }) }), { sent: 0 });
});

for (const secret of [undefined, ""]) {
  test(`reminders reject every caller when CRON_SECRET is ${JSON.stringify(secret)}`, async () => {
    const saved = process.env.CRON_SECRET;
    if (secret === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = secret;
    try {
      const db = mockDatabase(() => assert.fail("Unauthorized calls must not query the database"));
      const { GET, POST } = load(db, async () => assert.fail("No messages expected"));
      for (const headers of [{}, { authorization: "Bearer " }, { authorization: "Bearer undefined" }, { "x-cron-secret": "" }]) {
        assert.equal((await GET({ headers: new Headers(headers) })).status, 401);
        assert.equal((await POST({ headers: new Headers(headers) })).status, 401);
      }
    } finally {
      process.env.CRON_SECRET = saved;
    }
  });
}

test("reminders reject a wrong secret", async () => {
  const { GET, POST } = load(mockDatabase(() => assert.fail("No queries expected")), async () => assert.fail("No messages expected"));
  assert.equal((await GET({ headers: new Headers({ authorization: "Bearer wrong" }) })).status, 401);
  assert.equal((await POST({ headers: new Headers({ "x-cron-secret": "wrong" }) })).status, 401);
});
