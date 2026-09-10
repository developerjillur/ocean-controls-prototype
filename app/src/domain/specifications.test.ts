import { test } from "node:test";
import assert from "node:assert/strict";
import { specificationName, specificationValue } from "./specifications.ts";
test("Comparison normalizes equivalent notation without changing numerical values", () => {
  assert.equal(specificationName(" Supply Voltage Range: "), "supply voltage");
  assert.equal(specificationValue("10–30 VDC"), "10–30 V DC");
  assert.equal(specificationValue("230 VAC"), "230 V AC");
  assert.equal(specificationValue("125 ° C"), "125 °C");
  assert.equal(specificationName("Input voltage"), "input voltage");
});
