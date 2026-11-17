const CATALOG = [
  { id: "sec-key", name: "Titan Cloud Security Key", priceCents: 4900, tag: "Hardware MFA" },
  { id: "gvisor-hoodie", name: "gVisor Kernel Airgap Hoodie", priceCents: 7900, tag: "Apparel" },
  { id: "zero-trust-mug", name: "Zero-Credential Insulated Mug", priceCents: 2400, tag: "Gear" }
];

function calculateSubtotalCents(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const product = CATALOG.find((p) => p.id === item.id);
    const qty = Math.max(0, Number(item.qty) || 0);
    return product ? sum + product.priceCents * qty : sum;
  }, 0);
}

function calculateTaxCents(subtotalCents, taxRate = 0.08) {
  return Math.round(Math.max(0, subtotalCents) * taxRate);
}

function formatUsd(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

module.exports = {
  CATALOG,
  calculateSubtotalCents,
  calculateTaxCents,
  formatUsd
};
