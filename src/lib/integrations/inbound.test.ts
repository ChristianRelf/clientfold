import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { inboundTokenFromRecipients, verifySignedWebhook } from "./inbound";

test("signed inbound webhook accepts a current valid Svix signature", () => {
  const payload = '{"type":"email.received"}';
  const id = "msg_test_1";
  const now = Date.UTC(2026, 7, 23, 12, 0, 0);
  const timestamp = String(now / 1000);
  const key = Buffer.from("a webhook signing key");
  const secret = `whsec_${key.toString("base64")}`;
  const signature = createHmac("sha256", key).update(`${id}.${timestamp}.${payload}`).digest("base64");
  assert.equal(verifySignedWebhook({ payload, id, timestamp, signatures: `v1,${signature}`, secret, now }), true);
});

test("signed inbound webhook rejects stale replays and altered content", () => {
  const payload = '{"type":"email.received"}';
  const id = "msg_test_2";
  const now = Date.UTC(2026, 7, 23, 12, 0, 0);
  const timestamp = String((now - 10 * 60_000) / 1000);
  const key = Buffer.from("another webhook key");
  const secret = `whsec_${key.toString("base64")}`;
  const signature = createHmac("sha256", key).update(`${id}.${timestamp}.${payload}`).digest("base64");
  assert.equal(verifySignedWebhook({ payload, id, timestamp, signatures: `v1,${signature}`, secret, now }), false);
  assert.equal(verifySignedWebhook({ payload: `${payload}x`, id, timestamp: String(now / 1000), signatures: `v1,${signature}`, secret, now }), false);
});

test("forwarding token lookup ignores unrelated recipient addresses", () => {
  const token = "opaque_token_1234567890";
  assert.equal(inboundTokenFromRecipients(["notifications@example.com", `ClientFold <marketplace+${token}@inbound.example.com>`]), token);
  assert.equal(inboundTokenFromRecipients(["marketplace+short@example.com"]), null);
});
