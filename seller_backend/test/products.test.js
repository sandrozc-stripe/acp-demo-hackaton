/**
 * Tests for Products endpoint
 */

const request = require('supertest');
const app = require('../server');

describe('Products API Endpoints', () => {
  describe('GET /products - List Products', () => {
    test('should return list of all products', async () => {
      const response = await request(app)
        .get('/products')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBeGreaterThan(0);
    });

    test('should return products with correct structure', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      const product = response.body.products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('stock');
    });

    test('should include all sample products', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      const productIds = response.body.products.map(p => p.id);
      expect(productIds).toContain('item_123');
      expect(productIds).toContain('item_456');
      expect(productIds).toContain('item_789');
    });

    test('should return products with valid price values', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      response.body.products.forEach(product => {
        expect(typeof product.price).toBe('number');
        expect(product.price).toBeGreaterThan(0);
      });
    });

    test('should return products with valid stock values', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      response.body.products.forEach(product => {
        expect(typeof product.stock).toBe('number');
        expect(product.stock).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

