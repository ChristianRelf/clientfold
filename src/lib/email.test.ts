import assert from "node:assert/strict";
import test from "node:test";
import { buildWaitlistVerificationEmail } from "./email";

test("waitlist verification email uses ClientFold branding and a plain-text fallback", async () => {
  const message = await buildWaitlistVerificationEmail("Sam Rivera", "https://useclientfold.com/waitlist/verify?token=test-token");

  assert.equal(message.subject, "Confirm your place on the ClientFold waitlist");
  assert.match(message.html, /ClientFold/);
  assert.match(message.html, /background-color:#2d302a/);
  assert.match(message.html, /Confirm my email/);
  assert.match(message.text, /https:\/\/useclientfold\.com\/waitlist\/verify\?token=test-token/);
  assert.match(message.text, /expires in 24 hours/);
});

test("waitlist verification email escapes user-controlled HTML", async () => {
  const message = await buildWaitlistVerificationEmail("Sam <Admin>", "https://example.com/verify?a=1&b=2");

  assert.doesNotMatch(message.html, /Sam <Admin>/);
  assert.match(message.html, /Sam &lt;Admin&gt;/);
  assert.match(message.html, /a=1&amp;b=2/);
});
