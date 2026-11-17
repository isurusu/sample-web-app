const test = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateSubtotalCents,
  calculateTaxCents,
  formatUsd
} = require("../lib/pricing");

test("calculateSubtotalCents sums valid catalog items", () => {
  const subtotal = calculateSubtotalCents([
    { id: "sec-key", qty: 2 },
    { id: "zero-trust-mug", qty: 1 }
  ]);
  assert.equal(subtotal, 12200);
});

test("calculateTaxCents rounds 8% sales tax accurately", () => {
  assert.equal(calculateTaxCents(12200, 0.08), 976);
});

test("formatUsd formats cents as USD string", () => {
  assert.equal(formatUsd(13176), "$131.76");
});
