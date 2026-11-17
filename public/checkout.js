const cartState = {
  items: [
    { id: "sec-key", qty: 1 },
    { id: "gvisor-hoodie", qty: 1 }
  ],
  customer: {
    guestCheckout: true
  }
};

function resolvePromoCode(state) {
  const typedPromo = (document.getElementById("promo-input")?.value || "").trim();
  if (typedPromo) {
    return typedPromo.toUpperCase();
  }
  return state.customer?.loyaltyTier?.discountCode || null;
}

async function submitCheckoutOrder() {
  const promoCode = resolvePromoCode(cartState);
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
