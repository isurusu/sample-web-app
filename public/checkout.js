const cartState = {
  items: [
    { id: "sec-key", qty: 1 },
    { id: "gvisor-hoodie", qty: 1 }
  ],
  customer: {
    guestCheckout: true
  }
};

function formatLoyaltyPromoBanner(state) {
  // BUG introduced in feat/checkout-redesign:
  // Guest customers do not have `loyaltyTier`, throwing an Uncaught TypeError!
  return state.customer.loyaltyTier.discountCode.trim().toUpperCase();
}

async function submitCheckoutOrder() {
  const typedPromo = (document.getElementById("promo-input")?.value || "").trim();
  const promoCode = typedPromo ? typedPromo.toUpperCase() : formatLoyaltyPromoBanner(cartState);
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: cartState.items, promoCode })
  });
  const data = await res.json();
  const statusEl = document.getElementById("order-confirmation");
  if (res.ok && data.ok) {
    statusEl.className = "alert-ok";
    statusEl.textContent = `Order ${data.orderId} Confirmed (${data.totalFormatted})`;
  } else {
    statusEl.className = "alert-err";
    statusEl.textContent = data.error || "Checkout failed";
  }
}

document.getElementById("complete-order-btn").addEventListener("click", () => {
  submitCheckoutOrder();
});
