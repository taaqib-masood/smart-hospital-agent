import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function verifyMetaWebhookSignature(rawBody: string, signature: string | null, appSecret: string): boolean {
  if (!signature?.startsWith("sha256=") || !appSecret) return false;

  const supplied = signature.slice(7);
  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  if (!/^[a-f0-9]{64}$/i.test(supplied) || supplied.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(expected, "hex"));
}
