// Cœur métier NovaShop — logique de calcul du panier.
const VAT_RATE = 0.20;                 // TVA 20 %
const PROMOS = { BIENVENUE10: 0.10, SUPERVIP40: 0.40 };  // codes promo (remise en %)

function assertItem(it) {
  if (!it || typeof it.price !== 'number' || typeof it.quantity !== 'number') {
    throw new Error('Article invalide');
  }
  if (it.price < 0) throw new Error('Prix négatif interdit');
  if (!Number.isInteger(it.quantity) || it.quantity <= 0) throw new Error('Quantité invalide');
}

function round2(n) { return Math.round(n * 100) / 100; }

function subtotal(items) {
  if (!Array.isArray(items)) throw new Error('items doit être un tableau');
  return items.reduce((sum, it) => { assertItem(it); return sum + it.price * it.quantity; }, 0);
}

function tierDiscount(sub) { return sub > 100 ? sub * 0.05 : 0; } // -5 % au-delà de 100 €

function promoDiscount(sub, code) {
  if (!code) return 0;
  const rate = PROMOS[code];
  if (rate === undefined) throw new Error('Code promo invalide');
  return sub * rate;
}

function shipping(sub) {
  if (sub <= 0) return 0;
  return sub >= 50 ? 0 : 5; // port offert au-delà de 50 €
}

function computeTotal(items, { promoCode, vatRate = VAT_RATE } = {}) {
  const sub = subtotal(items);
  const discount = round2(tierDiscount(sub) + promoDiscount(sub, promoCode));
  const plafond = round2(0.30 * sub); // la remise ne peut pas dépasser 30% du sous-total
  const discountFinal = Math.min(discount, plafond);
  const taxable = Math.max(0, sub - discountFinal);
  const vat = round2(taxable * vatRate);
  const ship = shipping(sub);
  const total = Math.max(0, round2(taxable + vat + ship));
  return { subtotal: round2(sub), discount: discountFinal, vat, shipping: ship, total };
}

module.exports = { subtotal, tierDiscount, promoDiscount, shipping, computeTotal, VAT_RATE };
