/**
 * Tests for Checkout endpoints
 */

const request = require('supertest');
const app = require('../server');

describe('Checkout API Endpoints', () => {
  let createdCheckoutId;

  describe('POST /checkouts - Create Checkout', () => {
    test('should create a checkout with all fields', async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [
            {
              id: 'item_123',
              quantity: 2
            }
          ],
          buyer: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone_number: '+1234567890'
          },
          fulfillment_address: {
            name: 'John Doe',
            line_one: '123 Main St',
            line_two: 'Apt 4B',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            postal_code: '94105'
          }
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('ready_for_payment');
      expect(response.body.currency).toBe('usd');
      expect(response.body.line_items).toHaveLength(1);
      expect(response.body.line_items[0].item.id).toBe('item_123');
      expect(response.body.line_items[0].item.quantity).toBe(2);
      expect(response.body.buyer.email).toBe('john.doe@example.com');
      expect(response.body.fulfillment_address.city).toBe('San Francisco');
      expect(response.body.fulfillment_options).toHaveLength(3);
      expect(response.body.fulfillment_option_id).toBe('shipping_standard');
      expect(response.body.totals).toBeDefined();
      expect(response.body.messages).toEqual([]);
      expect(response.body.links).toBeDefined();
      expect(response.body.payment_provider).toBeDefined();
      expect(response.body.payment_provider.provider).toBe('stripe');

      createdCheckoutId = response.body.id;
    });

    test('should create a checkout with minimal fields (items only)', async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [
            {
              id: 'item_456',
              quantity: 1
            }
          ]
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('not_ready_for_payment');
      expect(response.body.buyer).toBeNull();
      expect(response.body.fulfillment_address).toBeNull();
      expect(response.body.fulfillment_option_id).toBeNull();
    });

    test('should create a checkout with multiple items', async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [
            { id: 'item_123', quantity: 2 },
            { id: 'item_456', quantity: 1 },
            { id: 'item_789', quantity: 3 }
          ]
        })
        .expect(201);

      expect(response.body.line_items).toHaveLength(3);
      expect(response.body.totals.find(t => t.type === 'total').amount).toBeGreaterThan(0);
    });

    test('should reject checkout without items', async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({})
        .expect(400);

      expect(response.body.type).toBe('invalid_request');
      expect(response.body.errors).toBeDefined();
    });

    test('should reject checkout with invalid item id', async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [
            {
              id: 'invalid_item',
              quantity: 1
            }
          ]
        })
        .expect(400);

      expect(response.body.type).toBe('invalid_request');
      expect(response.body.errors[0].code).toBe('invalid');
    });

    test('should reject checkout with invalid quantity', async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [
            {
              id: 'item_123',
              quantity: 0
            }
          ]
        })
        .expect(400);

      expect(response.body.errors[0].code).toBe('invalid');
    });

    test('should reject checkout with out of stock quantity', async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [
            {
              id: 'item_123',
              quantity: 1000
            }
          ]
        })
        .expect(400);

      expect(response.body.errors[0].code).toBe('out_of_stock');
    });
  });

  describe('GET /checkouts/:id - Retrieve Checkout', () => {
    test('should retrieve an existing checkout', async () => {
      const response = await request(app)
        .get(`/checkouts/${createdCheckoutId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.id).toBe(createdCheckoutId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('currency');
      expect(response.body).toHaveProperty('line_items');
      expect(response.body).toHaveProperty('fulfillment_options');
      expect(response.body).toHaveProperty('totals');
    });

    test('should return 404 for non-existent checkout', async () => {
      const response = await request(app)
        .get('/checkouts/non_existent_id')
        .expect(404);

      expect(response.body.type).toBe('invalid_request');
      expect(response.body.code).toBe('not_found');
    });
  });

  describe('PUT /checkouts/:id - Update Checkout', () => {
    let updateCheckoutId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [{ id: 'item_123', quantity: 1 }],
          buyer: {
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@example.com'
          },
          fulfillment_address: {
            name: 'Jane Smith',
            line_one: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            country: 'US',
            postal_code: '90210'
          }
        });
      updateCheckoutId = response.body.id;
    });

    test('should update checkout items', async () => {
      const response = await request(app)
        .put(`/checkouts/${updateCheckoutId}`)
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

    test('should update fulfillment option', async () => {
      const response = await request(app)
        .put(`/checkouts/${updateCheckoutId}`)
        .send({
          fulfillment_option_id: 'shipping_fast'
        })
        .expect(200);

      expect(response.body.fulfillment_option_id).toBe('shipping_fast');
      const fulfillmentTotal = response.body.totals.find(t => t.type === 'fulfillment');
      expect(fulfillmentTotal.amount).toBe(1500);
    });

    test('should update buyer information', async () => {
      const response = await request(app)
        .put(`/checkouts/${updateCheckoutId}`)
        .send({
          buyer: {
            first_name: 'Updated',
            last_name: 'Name',
            email: 'updated@example.com',
            phone_number: '+9876543210'
          }
        })
        .expect(200);

      expect(response.body.buyer.first_name).toBe('Updated');
      expect(response.body.buyer.email).toBe('updated@example.com');
    });

    test('should update fulfillment address', async () => {
      const response = await request(app)
        .put(`/checkouts/${updateCheckoutId}`)
        .send({
          fulfillment_address: {
            name: 'New Address',
            line_one: '789 Pine St',
            city: 'New York',
            state: 'NY',
            country: 'US',
            postal_code: '10001'
          }
        })
        .expect(200);

      expect(response.body.fulfillment_address.city).toBe('New York');
      expect(response.body.fulfillment_address.postal_code).toBe('10001');
    });

    test('should reject update with invalid fulfillment option', async () => {
      const response = await request(app)
        .put(`/checkouts/${updateCheckoutId}`)
        .send({
          fulfillment_option_id: 'invalid_option'
        })
        .expect(400);

      expect(response.body.code).toBe('invalid_fulfillment_option');
    });

    test('should return 404 for non-existent checkout', async () => {
      const response = await request(app)
        .put('/checkouts/non_existent_id')
        .send({ items: [{ id: 'item_123', quantity: 1 }] })
        .expect(404);

      expect(response.body.code).toBe('not_found');
    });
  });

  describe('POST /checkouts/:id/complete - Complete Checkout', () => {
    let completeCheckoutId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/checkouts')
        .send({
          items: [{ id: 'item_123', quantity: 2 }],
          buyer: {
            first_name: 'Complete',
            last_name: 'Test',
            email: 'complete@example.com'
          },
          fulfillment_address: {
            name: 'Complete Test',
            line_one: '123 Complete St',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            postal_code: '94105'
          }
        });
      completeCheckoutId = response.body.id;
    });

    test('should complete a checkout with payment data', async () => {
      const response = await request(app)
        .post(`/checkouts/${completeCheckoutId}/complete`)
        .send({
          payment_data: {
            token: 'tok_visa',
            provider: 'stripe',
            billing_address: {
              name: 'Complete Test',
              line_one: '123 Complete St',
              city: 'San Francisco',
              state: 'CA',
              country: 'US',
              postal_code: '94105'
            }
          }
        })
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].type).toBe('info');
      expect(response.body.payment_provider).toBeUndefined();
    });

    test('should complete checkout and update buyer info', async () => {
      const response = await request(app)
        .post(`/checkouts/${completeCheckoutId}/complete`)
        .send({
          buyer: {
            first_name: 'Updated',
            last_name: 'Buyer',
            email: 'updated@example.com'
          },
          payment_data: {
            token: 'tok_visa',
            provider: 'stripe'
          }
        })
        .expect(200);

      expect(response.body.buyer.first_name).toBe('Updated');
      expect(response.body.status).toBe('completed');
    });

    test('should reject completion without payment data', async () => {
      const response = await request(app)
        .post(`/checkouts/${completeCheckoutId}/complete`)
        .send({})
        .expect(400);

      expect(response.body.code).toBe('missing_payment_data');
    });

    test('should reject completion of non-existent checkout', async () => {
      const response = await request(app)
        .post('/checkouts/non_existent_id/complete')
        .send({
          payment_data: {
            token: 'tok_visa',
            provider: 'stripe'
          }
        })
        .expect(404);

      expect(response.body.code).toBe('not_found');
    });

    test('should reject completion of already completed checkout', async () => {
      // First completion
      await request(app)
        .post(`/checkouts/${completeCheckoutId}/complete`)
        .send({
          payment_data: {
            token: 'tok_visa',
            provider: 'stripe'
          }
        })
        .expect(200);

      // Second completion attempt
      const response = await request(app)
        .post(`/checkouts/${completeCheckoutId}/complete`)
        .send({
          payment_data: {
            token: 'tok_visa',
            provider: 'stripe'
          }
        })
        .expect(400);

      expect(response.body.code).toBe('checkout_already_completed');
    });
  });
});