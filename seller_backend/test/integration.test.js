/**
 * Integration Tests - Complete Checkout Flow
 */

const request = require('supertest');
const app = require('../server');

describe('Integration Tests - Complete Checkout Flows', () => {
  describe('Full Checkout Flow - Happy Path', () => {
    let checkoutId;

    test('Step 1: Create a checkout session', async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [
            { id: 'item_123', quantity: 2 }
          ],
          buyer: {
            first_name: 'Alice',
            last_name: 'Johnson',
            email: 'alice@example.com',
            phone_number: '+1234567890'
          },
          fulfillment_address: {
            name: 'Alice Johnson',
            line_one: '100 Market St',
            line_two: 'Suite 200',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            postal_code: '94105'
          }
        })
        .expect(201);

      checkoutId = response.body.id;
      expect(response.body.status).toBe('ready_for_payment');
      expect(response.body.line_items).toHaveLength(1);
    });

    test('Step 2: Retrieve the checkout to verify', async () => {
      const response = await request(app)
        .get(`/checkouts/${checkoutId}`)
        .expect(200);

      expect(response.body.id).toBe(checkoutId);
      expect(response.body.buyer.email).toBe('alice@example.com');
    });

    test('Step 3: Update checkout with additional items', async () => {
      const response = await request(app)
        .put(`/checkouts/${checkoutId}`)
        .send({
          items: [
            { id: 'item_123', quantity: 3 },
            { id: 'item_456', quantity: 2 }
          ]
        })
        .expect(200);

      expect(response.body.line_items).toHaveLength(2);
      expect(response.body.line_items[0].item.quantity).toBe(3);
      expect(response.body.line_items[1].item.quantity).toBe(2);
    });

    test('Step 4: Change shipping option', async () => {
      const response = await request(app)
        .put(`/checkouts/${checkoutId}`)
        .send({
          fulfillment_option_id: 'shipping_fast'
        })
        .expect(200);

      expect(response.body.fulfillment_option_id).toBe('shipping_fast');
      const shippingCost = response.body.totals.find(t => t.type === 'fulfillment').amount;
      expect(shippingCost).toBe(1500);
    });

    test('Step 5: Complete the checkout', async () => {
      const response = await request(app)
        .post(`/checkouts/${checkoutId}/complete`)
        .send({
          payment_data: {
            token: 'tok_visa',
            provider: 'stripe',
            billing_address: {
              name: 'Alice Johnson',
              line_one: '100 Market St',
              city: 'San Francisco',
              state: 'CA',
              country: 'US',
              postal_code: '94105'
            }
          }
        })
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.messages.length).toBeGreaterThan(0);
    });

    test('Step 6: Verify checkout is completed', async () => {
      const response = await request(app)
        .get(`/checkouts/${checkoutId}`)
        .expect(200);

      expect(response.body.status).toBe('completed');
    });
  });

  describe('Cancellation Flow', () => {
    let checkoutId;

    test('Step 1: Create a checkout', async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [{ id: 'item_789', quantity: 1 }],
          buyer: {
            first_name: 'Bob',
            last_name: 'Smith',
            email: 'bob@example.com'
          }
        })
        .expect(201);

      checkoutId = response.body.id;
    });

    test('Step 2: Cancel the checkout', async () => {
      const response = await request(app)
        .post(`/checkouts/${checkoutId}/cancel`)
        .send({})
        .expect(200);

      expect(response.body.status).toBe('canceled');
    });

    test('Step 3: Verify cannot update canceled checkout', async () => {
      await request(app)
        .put(`/checkouts/${checkoutId}`)
        .send({
          items: [{ id: 'item_123', quantity: 1 }]
        })
        .expect(400);
    });

    test('Step 4: Verify cannot complete canceled checkout', async () => {
      await request(app)
        .post(`/checkouts/${checkoutId}/complete`)
        .send({
          payment_data: {
            token: 'tok_visa',
            provider: 'stripe'
          }
        })
        .expect(400);
    });
  });

  describe('Progressive Checkout Build', () => {
    let checkoutId;

    test('Step 1: Create minimal checkout (items only)', async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [{ id: 'item_123', quantity: 1 }]
        })
        .expect(201);

      checkoutId = response.body.id;
      expect(response.body.status).toBe('not_ready_for_payment');
      expect(response.body.buyer).toBeNull();
      expect(response.body.fulfillment_address).toBeNull();
    });

    test('Step 2: Add buyer information', async () => {
      const response = await request(app)
        .put(`/checkouts/${checkoutId}`)
        .send({
          buyer: {
            first_name: 'Charlie',
            last_name: 'Brown',
            email: 'charlie@example.com'
          }
        })
        .expect(200);

      expect(response.body.buyer.first_name).toBe('Charlie');
      expect(response.body.status).toBe('not_ready_for_payment'); // Still not ready
    });

    test('Step 3: Add fulfillment address', async () => {
      const response = await request(app)
        .put(`/checkouts/${checkoutId}`)
        .send({
          fulfillment_address: {
            name: 'Charlie Brown',
            line_one: '200 Pine St',
            city: 'Portland',
            state: 'OR',
            country: 'US',
            postal_code: '97201'
          }
        })
        .expect(200);

      expect(response.body.fulfillment_address.city).toBe('Portland');
      expect(response.body.status).toBe('ready_for_payment'); // Now ready!
    });

    test('Step 4: Complete the order', async () => {
      const response = await request(app)
        .post(`/checkouts/${checkoutId}/complete`)
        .send({
          payment_data: {
            token: 'tok_mastercard',
            provider: 'stripe'
          }
        })
        .expect(200);

      expect(response.body.status).toBe('completed');
    });
  });

  describe('Multiple Items Management', () => {
    let checkoutId;

    test('Create checkout with one item', async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [{ id: 'item_123', quantity: 1 }]
        })
        .expect(201);

      checkoutId = response.body.id;
      expect(response.body.line_items).toHaveLength(1);
    });

    test('Add more items', async () => {
      const response = await request(app)
        .put(`/checkouts/${checkoutId}`)
        .send({
          items: [
            { id: 'item_123', quantity: 1 },
            { id: 'item_456', quantity: 2 },
            { id: 'item_789', quantity: 1 }
          ]
        })
        .expect(200);

      expect(response.body.line_items).toHaveLength(3);
    });

    test('Update quantities', async () => {
      const response = await request(app)
        .put(`/checkouts/${checkoutId}`)
        .send({
          items: [
            { id: 'item_123', quantity: 5 },
            { id: 'item_456', quantity: 3 }
          ]
        })
        .expect(200);

      expect(response.body.line_items).toHaveLength(2);
      expect(response.body.line_items[0].item.quantity).toBe(5);
    });

    test('Remove items by updating to different items', async () => {
      const response = await request(app)
        .put(`/checkouts/${checkoutId}`)
        .send({
          items: [{ id: 'item_789', quantity: 1 }]
        })
        .expect(200);

      expect(response.body.line_items).toHaveLength(1);
      expect(response.body.line_items[0].item.id).toBe('item_789');
    });
  });

  describe('Fulfillment Options Flow', () => {
    let checkoutId;

    test('Create checkout with address', async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [{ id: 'item_123', quantity: 1 }],
          fulfillment_address: {
            name: 'Test User',
            line_one: '123 Test St',
            city: 'Seattle',
            state: 'WA',
            country: 'US',
            postal_code: '98101'
          }
        })
        .expect(201);

      checkoutId = response.body.id;
      expect(response.body.fulfillment_options).toHaveLength(3);
      expect(response.body.fulfillment_option_id).toBe('shipping_standard');
    });

    test('Change to express shipping', async () => {
      const response = await request(app)
        .put(`/checkouts/${checkoutId}`)
        .send({
          fulfillment_option_id: 'shipping_fast'
        })
        .expect(200);

      expect(response.body.fulfillment_option_id).toBe('shipping_fast');
      const total = response.body.totals.find(t => t.type === 'total').amount;
      expect(total).toBeGreaterThan(1000);
    });

    test('Change to overnight shipping', async () => {
      const response = await request(app)
        .put(`/checkouts/${checkoutId}`)
        .send({
          fulfillment_option_id: 'shipping_overnight'
        })
        .expect(200);

      expect(response.body.fulfillment_option_id).toBe('shipping_overnight');
      const shippingCost = response.body.totals.find(t => t.type === 'fulfillment').amount;
      expect(shippingCost).toBe(3000);
    });

    test('Verify totals are recalculated correctly', async () => {
      const response = await request(app)
        .get(`/checkouts/${checkoutId}`)
        .expect(200);

      const totals = response.body.totals;
      const subtotal = totals.find(t => t.type === 'subtotal').amount;
      const fulfillment = totals.find(t => t.type === 'fulfillment').amount;
      const tax = totals.find(t => t.type === 'tax').amount;
      const total = totals.find(t => t.type === 'total').amount;

      expect(total).toBe(subtotal + fulfillment + tax);
    });
  });
});

