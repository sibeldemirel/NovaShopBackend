const { computeTotal } = require("./pricing");

function createOrder(cart, { repo, notifier }) {
  const totals = computeTotal(cart.items, { promoCode: cart.promoCode });
  const order = repo.save({ items: cart.items, total: totals.total });
  notifier.notifyOwner(order);
  return order;
}

module.exports = { createOrder };
