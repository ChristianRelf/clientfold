import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { integrationRegistry } from "./registry";

test("every configured integration logo is committed locally", () => {
  for (const integration of integrationRegistry) {
    if (!integration.logoPath || integration.brandAssetMode !== "logo") continue;
    assert.equal(
      existsSync(join(process.cwd(), "public", integration.logoPath.replace(/^\//, ""))),
      true,
      `${integration.name} is missing ${integration.logoPath}`,
    );
  }
});

test("provider detail paths are unique and top-level", () => {
  const paths = integrationRegistry.map((integration) => integration.detailPath);
  assert.equal(new Set(paths).size, paths.length);
  assert.equal(paths.every((path) => path.startsWith("/settings/integrations/")), true);
});
