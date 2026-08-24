import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeCsv,
  parseCsv,
  safeMarketplaceUrl,
  suggestCsvMapping,
} from "./marketplace";
import { itemFingerprint } from "./marketplace-server";

test("CSV parser handles quoted delimiters and escaped quotes", () => {
  assert.deepEqual(parseCsv('Order ID,Title,Amount\r\n42,"Logo, brand",$120\r\n43,"An ""exact"" quote",$80'), [
    ["Order ID", "Title", "Amount"],
    ["42", "Logo, brand", "$120"],
    ["43", 'An "exact" quote', "$80"],
  ]);
});

test("mapping recognises common Fiverr earnings columns", () => {
  assert.deepEqual(suggestCsvMapping(["Order ID", "Gig", "Buyer Username", "Earnings", "Currency"]), {
    externalId: "Order ID",
    title: "Gig",
    buyerHandle: "Buyer Username",
    net: "Earnings",
    currency: "Currency",
  });
});

test("normalization creates metadata-only reviewed records", () => {
  const [item] = normalizeCsv(
    "Order ID,Gig,Buyer Username,Earnings,Currency,Due Date,Order URL\nFO123,Brand system,alex,95.50,USD,2026-09-01,https://www.fiverr.com/orders/FO123",
    "fiverr",
  );
  assert.equal(item.externalId, "FO123");
  assert.equal(item.buyer?.handle, "alex");
  assert.equal(item.financials?.net, 9550);
  assert.equal(item.externalUrl, "https://www.fiverr.com/orders/FO123");
  assert.equal("messages" in item, false);
  assert.equal("files" in item, false);
});

test("marketplace links reject unsafe and cross-provider URLs", () => {
  assert.equal(safeMarketplaceUrl("fiverr", "http://www.fiverr.com/orders/1"), undefined);
  assert.equal(safeMarketplaceUrl("fiverr", "https://upwork.com/jobs/1"), undefined);
  assert.equal(safeMarketplaceUrl("fiverr", "https://evil.example/fiverr"), undefined);
});

test("stable fingerprints deduplicate the same provider record", () => {
  const [item] = normalizeCsv("Order ID,Title\n123,Identity refresh", "generic");
  assert.equal(itemFingerprint(item), itemFingerprint({ ...item }));
  assert.notEqual(itemFingerprint(item), itemFingerprint({ ...item, externalId: "124" }));
});
