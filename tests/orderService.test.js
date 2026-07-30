const { createOrder } = require('../src/domain/orderService');

test('createOrder calcule, sauvegarde et notifie une fois', () => {
  const repo = { save: jest.fn((o) => ({ id: 1, ...o })) }; // STUB : renvoie un état
  const notifier = { notifyOwner: jest.fn() }; // MOCK : on vérifie l'appel

  const order = createOrder({ items: [{ price: 100, quantity: 1 }] }, { repo, notifier });

  expect(order.total).toBeGreaterThan(0); // état
  expect(repo.save).toHaveBeenCalledTimes(1);
  expect(notifier.notifyOwner).toHaveBeenCalledTimes(1); // comportement
  expect(notifier.notifyOwner).toHaveBeenCalledWith(order);
});

test('createOrder transmet le code promo au calcul du total', () => {
  const repo = { save: jest.fn((o) => ({ id: 2, ...o })) };
  const notifier = { notifyOwner: jest.fn() };

  const order = createOrder(
    { items: [{ price: 100, quantity: 1 }], promoCode: 'BIENVENUE10' },
    { repo, notifier }
  );

  // 100 - 10% promo = 90 taxable, + 20% TVA = 18, port offert (>=50€) => total 108
  expect(order.total).toBe(108);
});
