const { createOrder } = require("../src/domain/orderService");

test("createOrder calcule, sauvegarde et notifie une fois", () => {
  const repo = { save: jest.fn((o) => ({ id: 1, ...o })) };
  const notifier = { notifyOwner: jest.fn() };

  const order = createOrder(
    { items: [{ price: 100, quantity: 1 }] },
    { repo, notifier },
  );

  expect(order.total).toBeGreaterThan(0);
  expect(repo.save).toHaveBeenCalledTimes(1);
  expect(notifier.notifyOwner).toHaveBeenCalledTimes(1);
  expect(notifier.notifyOwner).toHaveBeenCalledWith(order);
});

test("createOrder transmet le code promo au calcul du total", () => {
  const repo = { save: jest.fn((o) => ({ id: 2, ...o })) };
  const notifier = { notifyOwner: jest.fn() };

  const order = createOrder(
    { items: [{ price: 100, quantity: 1 }], promoCode: "BIENVENUE10" },
    { repo, notifier },
  );

  expect(order.total).toBe(108);
});
