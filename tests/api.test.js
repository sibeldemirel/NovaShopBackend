const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

describe('API NovaShop', () => {
  test('GET /api/products => 200 + tableau', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test('GET /api/products/:id inconnu => 404', async () => {
    const res = await request(app).get('/api/products/999');
    expect(res.status).toBe(404);
  });
  test('POST /api/cart/total calcule le total', async () => {
    const res = await request(app).post('/api/cart/total').send({ items: [{ price: 10, quantity: 2 }] });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(29);
  });
  test('POST /api/cart/total avec donnees invalides => 400', async () => {
    const res = await request(app).post('/api/cart/total').send({ items: [{ price: 10, quantity: 0 }] });
    expect(res.status).toBe(400);
  });
});
