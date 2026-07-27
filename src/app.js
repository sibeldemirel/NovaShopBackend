const express = require('express');
const products = require('./data/products');
const { computeTotal } = require('./domain/pricing');

function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.get('/api/products', (req, res) => res.json(products));

  app.get('/api/products/:id', (req, res) => {
    const product = products.find((p) => p.id === Number(req.params.id));
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    return res.json(product);
  });

  app.post('/api/cart/total', (req, res) => {
    try {
      const { items, promoCode } = req.body || {};
      return res.json(computeTotal(items, { promoCode }));
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });

  return app;
}

module.exports = createApp;
