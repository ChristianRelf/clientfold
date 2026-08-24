import assert from "node:assert/strict";
import test from "node:test";
import { buildWaitlistDiscordPayload } from "./discord";

test("waitlist Discord payload contains signup context and disables mentions", () => {
  const payload = buildWaitlistDiscordPayload({
    name: "Avery Stone",
    email: "avery@example.com",
    organisation: "Stone Studio",
    workType: "studio",
    source: "landing:client-approvals",
    referral: "friend123",
  }, new Date("2026-08-24T12:00:00.000Z"));

  assert.deepEqual(payload.allowed_mentions, { parse: [] });
  assert.equal(payload.embeds[0]?.timestamp, "2026-08-24T12:00:00.000Z");
  assert.deepEqual(payload.embeds[0]?.fields.map((field) => field.value), [
    "Avery Stone",
    "avery@example.com",
    "Stone Studio",
    "studio",
    "landing:client-approvals",
    "friend123",
  ]);
});

test("waitlist Discord payload supplies useful defaults", () => {
  const payload = buildWaitlistDiscordPayload({ name: "Avery", email: "avery@example.com", workType: "freelancer" });
  const values = payload.embeds[0]?.fields.map((field) => field.value);
  assert.equal(values?.[2], "Not provided");
  assert.equal(values?.[4], "Direct");
});
