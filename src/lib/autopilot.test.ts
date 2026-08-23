import assert from "node:assert/strict";
import test from "node:test";
import { isAutopilotPlan, postponeAfterManualReminder, scheduleForStep, scheduleStaleFirstReminder } from "./autopilot";
import { escapeHtml } from "./email";

test("Solo and team plans include Autopilot while Free does not", () => {
  assert.equal(isAutopilotPlan("free"), false);
  assert.equal(isAutopilotPlan("solo"), true);
  assert.equal(isAutopilotPlan("studio"), true);
  assert.equal(isAutopilotPlan("agency"), true);
});

test("schedules the gentle sequence for day 3 and day 7 at 10:00 local time", () => {
  const anchor = new Date("2026-08-17T09:00:00.000Z");
  assert.equal(scheduleForStep(anchor, 1, "Europe/London").scheduledFor.toISOString(), "2026-08-20T09:00:00.000Z");
  assert.equal(scheduleForStep(anchor, 2, "Europe/London").scheduledFor.toISOString(), "2026-08-24T09:00:00.000Z");
});

test("rolls weekend reminders forward to Monday", () => {
  const friday = new Date("2026-08-21T09:00:00.000Z");
  assert.equal(scheduleForStep(friday, 1, "Europe/London").scheduledFor.toISOString(), "2026-08-24T09:00:00.000Z");
});

test("keeps 10:00 local time across the daylight-saving boundary", () => {
  const anchor = new Date("2026-10-23T09:00:00.000Z");
  assert.equal(scheduleForStep(anchor, 1, "Europe/London").scheduledFor.toISOString(), "2026-10-26T10:00:00.000Z");
});

test("stale items schedule one upcoming weekday reminder instead of catching up", () => {
  const sunday = new Date("2026-08-23T12:00:00.000Z");
  assert.equal(scheduleStaleFirstReminder(sunday, "Europe/London").scheduledFor.toISOString(), "2026-08-24T09:00:00.000Z");
});

test("manual reminders postpone Autopilot by at least three days", () => {
  const monday = new Date("2026-08-17T11:00:00.000Z");
  assert.equal(postponeAfterManualReminder(monday, "Europe/London").toISOString(), "2026-08-20T09:00:00.000Z");
});

test("email interpolation is HTML escaped", () => {
  assert.equal(escapeHtml(`<Client & \"Co\">'`), "&lt;Client &amp; &quot;Co&quot;&gt;&#39;");
});
