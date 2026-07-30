const { subtotal, tierDiscount, promoDiscount, shipping, computeTotal } = require('../src/domain/pricing');

describe('subtotal', () => {
  test('panier vide => 0', () => { expect(subtotal([])).toBe(0); });
  test('somme prix x quantite', () => {
    expect(subtotal([{ price: 10, quantity: 2 }, { price: 5, quantity: 1 }])).toBe(25);
  });
  test('quantite <= 0 => erreur', () => {
    expect(() => subtotal([{ price: 10, quantity: 0 }])).toThrow();
  });
  test('prix negatif => erreur', () => {
    expect(() => subtotal([{ price: -1, quantity: 1 }])).toThrow();
  });
});

describe('shipping (frais de port)', () => {
  test('offert au seuil de 50', () => { expect(shipping(50)).toBe(0); });
  test('5 en dessous de 50', () => { expect(shipping(49.99)).toBe(5); });
  test('panier vide => 0', () => { expect(shipping(0)).toBe(0); });
});

describe('computeTotal', () => {
  test('cas nominal : sub 20, TVA 4, port 5 => 29', () => {
    const r = computeTotal([{ price: 10, quantity: 2 }]);
    expect(r).toEqual({ subtotal: 20, discount: 0, vat: 4, shipping: 5, total: 29 });
  });
  test('remise palier -5% au-dela de 100', () => {
    const r = computeTotal([{ price: 200, quantity: 1 }]);
    expect(r.discount).toBeCloseTo(10, 2);
    expect(r.shipping).toBe(0);
  });
  test('code promo valide', () => {
    const r = computeTotal([{ price: 100, quantity: 1 }], { promoCode: 'BIENVENUE10' });
    expect(r.discount).toBeCloseTo(10, 2);
  });
  test('code promo invalide => erreur', () => {
    expect(() => computeTotal([{ price: 10, quantity: 1 }], { promoCode: 'XXX' })).toThrow();
  });
});

describe('subtotal — cas limites supplémentaires', () => {
  test('article invalide (champ manquant) => erreur', () => {
    expect(() => subtotal([{ price: 10 }])).toThrow('Article invalide');
    expect(() => subtotal([{ quantity: 1 }])).toThrow('Article invalide');
  });

  test('quantite non entiere => erreur', () => {
    expect(() => subtotal([{ price: 10, quantity: 1.5 }])).toThrow('Quantité invalide');
  });

  test('items n\'est pas un tableau => erreur', () => {
    expect(() => subtotal(null)).toThrow('items doit être un tableau');
    expect(() => subtotal('pas un tableau')).toThrow();
  });
});

describe('tierDiscount — testé isolément', () => {
  test('aucune remise a exactement 100 (limite incluse)', () => {
    expect(tierDiscount(100)).toBe(0);
  });
  test('remise strictement au-dela de 100', () => {
    expect(tierDiscount(100.01)).toBeGreaterThan(0);
  });
});

describe('promoDiscount — testé isolément', () => {
  test('sans code => 0', () => { expect(promoDiscount(100, undefined)).toBe(0); });
});

describe('computeTotal — cas supplémentaires', () => {
  test('cumule remise palier ET code promo', () => {
    const r = computeTotal([{ price: 60, quantity: 2 }], { promoCode: 'BIENVENUE10' });
    expect(r.discount).toBeCloseTo(18, 2);
  });

  test('taux de TVA personnalise', () => {
    const r = computeTotal([{ price: 100, quantity: 1 }], { vatRate: 0.10 });
    expect(r.vat).toBe(10);
  });

  test('le total ne descend jamais sous 0', () => {
    const r = computeTotal([{ price: 100, quantity: 2 }], { promoCode: 'BIENVENUE10' });
    expect(r.total).toBeGreaterThanOrEqual(0);
  });
});

test('la remise est plafonnée à 30% du sous-total (cas actif)', () => {
  const r = computeTotal([{ price: 100, quantity: 1 }], { promoCode: 'SUPERVIP40' });
  expect(r.discount).toBeCloseTo(30, 2);
});

test('le plafond ne s\'active pas si la remise cumulée reste sous 30%', () => {
  const r = computeTotal([{ price: 60, quantity: 2 }], { promoCode: 'BIENVENUE10' });
  expect(r.discount).toBeCloseTo(18, 2);
});
