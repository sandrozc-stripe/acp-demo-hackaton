/**
 * Agentic Commerce Protocol - Simple Seller Backend
 * Demo implementation of the ACP specification
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const {
  CheckoutStatus,
  MessageType,
  PRODUCT_CATALOG,
  createBuyer,
  createAddress,
  createLineItem,
  getFulfillmentOptions,
  calculateTotals,
  createPaymentProvider,
  generateId
} = require('./datastructures');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// In-memory storage for checkouts (for demo purposes)
const checkouts = {};

/**
 * Helper function to validate items
 */
function validateItems(items) {
  const errors = [];
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push({
      type: MessageType.ERROR,
      code: 'missing',
      param: '$.items',
      content_type: 'plain',
      content: 'Items array is required and cannot be empty'
    });
    return errors;
  }

  items.forEach((item, index) => {
    if (!item.id) {
      errors.push({
        type: MessageType.ERROR,
        code: 'missing',
        param: `$.items[${index}].id`,
        content_type: 'plain',
        content: 'Item id is required'
      });
    } else if (!PRODUCT_CATALOG[item.id]) {
      errors.push({
        type: MessageType.ERROR,
        code: 'invalid',
        param: `$.items[${index}].id`,
        content_type: 'plain',
        content: `Product ${item.id} not found`
      });
    }

    if (!item.quantity || item.quantity < 1) {
      errors.push({
        type: MessageType.ERROR,
        code: 'invalid',
        param: `$.items[${index}].quantity`,
        content_type: 'plain',
        content: 'Quantity must be at least 1'
      });
    }

    // Check stock
    if (item.id && PRODUCT_CATALOG[item.id]) {
      const product = PRODUCT_CATALOG[item.id];
      if (item.quantity > product.stock) {
        errors.push({
          type: MessageType.ERROR,
          code: 'out_of_stock',
          param: `$.items[${index}]`,
          content_type: 'plain',
          content: `Only ${product.stock} units available for ${product.name}`
        });
      }
    }
  });

  return errors;
}

/**
 * Helper function to build checkout response
 */
function buildCheckoutResponse(checkout) {
  const response = {
    id: checkout.id,
    buyer: checkout.buyer || null,
    status: checkout.status,
    currency: checkout.currency,
    line_items: checkout.line_items,
    fulfillment_address: checkout.fulfillment_address || null,
    fulfillment_options: checkout.fulfillment_options,
    fulfillment_option_id: checkout.fulfillment_option_id || null,
    totals: checkout.totals,
    messages: checkout.messages,
    links: checkout.links
  };
  
  // Only include payment_provider if it exists
  if (checkout.payment_provider !== undefined) {
    response.payment_provider = checkout.payment_provider;
  }
  
  return response;
}

/**
 * POST /checkouts
 * Create a new Checkout Session
 */
app.post('/checkouts', (req, res) => {
  try {
    const { items, buyer, fulfillment_address } = req.body;

    // Validate items
    const validationErrors = validateItems(items);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        type: 'invalid_request',
        code: 'validation_error',
        message: 'Request validation failed',
        errors: validationErrors
      });
    }

    // Create checkout
    const checkoutId = generateId('checkout');
    const lineItems = items.map(item => {
      const product = PRODUCT_CATALOG[item.id];
      return createLineItem(item, product);
    });

    const fulfillmentOptions = getFulfillmentOptions();
    const fulfillmentOptionId = fulfillment_address ? 'shipping_standard' : null;
    const selectedFulfillment = fulfillmentOptions.find(opt => opt.id === fulfillmentOptionId);
    
    const checkout = {
      id: checkoutId,
      buyer: buyer ? createBuyer(buyer) : null,
      payment_provider: createPaymentProvider(),
      status: fulfillment_address ? CheckoutStatus.READY_FOR_PAYMENT : CheckoutStatus.NOT_READY_FOR_PAYMENT,
      currency: 'usd',
      line_items: lineItems,
      fulfillment_address: fulfillment_address ? createAddress(fulfillment_address) : null,
      fulfillment_options: fulfillmentOptions,
      fulfillment_option_id: fulfillmentOptionId,
      totals: calculateTotals(lineItems, selectedFulfillment),
      messages: [],
      links: [
        {
          type: 'terms_of_use',
          url: 'https://example.com/terms'
        },
        {
          type: 'privacy_policy',
          url: 'https://example.com/privacy'
        }
      ]
    };

    checkouts[checkoutId] = checkout;

    res.status(201).json(buildCheckoutResponse(checkout));
  } catch (error) {
    console.error('Error creating checkout:', error);
    res.status(500).json({
      type: 'processing_error',
      code: 'internal_error',
      message: 'An error occurred while creating the checkout'
    });
  }
});

/**
 * GET /checkouts/:id
 * Retrieve a Checkout Session
 */
app.get('/checkouts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const checkout = checkouts[id];

    if (!checkout) {
      return res.status(404).json({
        type: 'invalid_request',
        code: 'not_found',
        message: `Checkout ${id} not found`
      });
    }

    res.json(buildCheckoutResponse(checkout));
  } catch (error) {
    console.error('Error retrieving checkout:', error);
    res.status(500).json({
      type: 'processing_error',
      code: 'internal_error',
      message: 'An error occurred while retrieving the checkout'
    });
  }
});

/**
 * PUT /checkouts/:id
 * Update a Checkout Session
 */
app.put('/checkouts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { items, buyer, fulfillment_address, fulfillment_option_id } = req.body;
    
    const checkout = checkouts[id];

    if (!checkout) {
      return res.status(404).json({
        type: 'invalid_request',
        code: 'not_found',
        message: `Checkout ${id} not found`
      });
    }

    if (checkout.status === CheckoutStatus.COMPLETED) {
      return res.status(400).json({
        type: 'invalid_request',
        code: 'checkout_completed',
        message: 'Cannot update a completed checkout'
      });
    }

    if (checkout.status === CheckoutStatus.CANCELED) {
      return res.status(400).json({
        type: 'invalid_request',
        code: 'checkout_canceled',
        message: 'Cannot update a canceled checkout'
      });
    }

    // Update items if provided
    if (items) {
      const validationErrors = validateItems(items);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          type: 'invalid_request',
          code: 'validation_error',
          message: 'Request validation failed',
          errors: validationErrors
        });
      }

      checkout.line_items = items.map(item => {
        const product = PRODUCT_CATALOG[item.id];
        return createLineItem(item, product);
      });
    }

    // Update buyer if provided
    if (buyer) {
      checkout.buyer = createBuyer(buyer);
    }

    // Update fulfillment address if provided
    if (fulfillment_address) {
      checkout.fulfillment_address = createAddress(fulfillment_address);
      // Auto-select default fulfillment option if none is set
      if (!checkout.fulfillment_option_id && checkout.fulfillment_options.length > 0) {
        checkout.fulfillment_option_id = checkout.fulfillment_options[0].id;
      }
    }

    // Update fulfillment option if provided
    if (fulfillment_option_id) {
      const option = checkout.fulfillment_options.find(opt => opt.id === fulfillment_option_id);
      if (!option) {
        return res.status(400).json({
          type: 'invalid_request',
          code: 'invalid_fulfillment_option',
          message: `Fulfillment option ${fulfillment_option_id} not found`
        });
      }
      checkout.fulfillment_option_id = fulfillment_option_id;
    }

    // Recalculate totals
    const selectedFulfillment = checkout.fulfillment_options.find(
      opt => opt.id === checkout.fulfillment_option_id
    );
    checkout.totals = calculateTotals(checkout.line_items, selectedFulfillment);

    // Update status
    if (checkout.fulfillment_address && checkout.fulfillment_option_id) {
      checkout.status = CheckoutStatus.READY_FOR_PAYMENT;
    } else {
      checkout.status = CheckoutStatus.NOT_READY_FOR_PAYMENT;
    }

    checkouts[id] = checkout;

    res.json(buildCheckoutResponse(checkout));
  } catch (error) {
    console.error('Error updating checkout:', error);
    res.status(500).json({
      type: 'processing_error',
      code: 'internal_error',
      message: 'An error occurred while updating the checkout'
    });
  }
});

/**
 * POST /checkouts/:id/complete
 * Complete a Checkout Session
 */
app.post('/checkouts/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_data, buyer } = req.body;
    
    const checkout = checkouts[id];

    if (!checkout) {
      return res.status(404).json({
        type: 'invalid_request',
        code: 'not_found',
        message: `Checkout ${id} not found`
      });
    }

    if (checkout.status === CheckoutStatus.COMPLETED) {
      return res.status(400).json({
        type: 'invalid_request',
        code: 'checkout_already_completed',
        message: 'Checkout is already completed'
      });
    }

    if (checkout.status === CheckoutStatus.CANCELED) {
      return res.status(400).json({
        type: 'invalid_request',
        code: 'checkout_canceled',
        message: 'Cannot complete a canceled checkout'
      });
    }

    if (!payment_data) {
      return res.status(400).json({
        type: 'invalid_request',
        code: 'missing_payment_data',
        message: 'Payment data is required'
      });
    }

    // Update buyer if provided
    if (buyer) {
      checkout.buyer = createBuyer(buyer);
    }
    // execute the stripe payment intent
    
    const amount = checkout['totals'][0]['amount']
    console.log("amount", amount);
    
    const executePaymentIntentResponse = await fetch(
      "https://api.stripe.com/v1/payment_intents",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Bearer ${process.env.SELLER_API_KEY}`,
          "Stripe-Version": "2023-08-16;line_items_beta=v1"
        },
        body: new URLSearchParams({
          'amount': amount.toString(),
          'currency': 'usd',
          'confirm': 'true',
          'shared_payment_granted_token': payment_data.token,
          'automatic_payment_methods[enabled]': 'true',
          'automatic_payment_methods[allow_redirects]': 'never'
        }).toString()
      }
    );

    const data = await executePaymentIntentResponse.json()
    console.log("data", data);

    // Check if payment failed (no id means error)
    if (!data.id || data.error) {
      return res.status(400).json({
        type: 'invalid_request',
        code: 'payment_intent_execution_failed',
        message: data.error?.message || 'Payment intent execution failed'
      });
    } 

    // Simulate payment processing (in real scenario, process with payment provider)
    checkout.status = CheckoutStatus.COMPLETED;
    checkout.messages.push({
      type: MessageType.INFO,
      content_type: 'plain',
      content: 'Payment processed successfully. Order confirmed!'
    });

    // Remove payment provider from completed checkout
    delete checkout.payment_provider;

    checkouts[id] = checkout;

    res.json(buildCheckoutResponse(checkout));
  } catch (error) {
    console.error('Error completing checkout:', error);
    res.status(500).json({
      type: 'processing_error',
      code: 'internal_error',
      message: 'An error occurred while completing the checkout'
    });
  }
});

/**
 * POST /checkouts/:id/cancel
 * Cancel a Checkout Session
 */
app.post('/checkouts/:id/cancel', (req, res) => {
  try {
    const { id } = req.params;
    const checkout = checkouts[id];

    if (!checkout) {
      return res.status(404).json({
        type: 'invalid_request',
        code: 'not_found',
        message: `Checkout ${id} not found`
      });
    }

    if (checkout.status === CheckoutStatus.COMPLETED) {
      return res.status(400).json({
        type: 'invalid_request',
        code: 'checkout_completed',
        message: 'Cannot cancel a completed checkout'
      });
    }

    if (checkout.status === CheckoutStatus.CANCELED) {
      return res.status(400).json({
        type: 'invalid_request',
        code: 'checkout_already_canceled',
        message: 'Checkout is already canceled'
      });
    }

    checkout.status = CheckoutStatus.CANCELED;
    checkout.messages.push({
      type: MessageType.INFO,
      content_type: 'plain',
      content: 'Checkout has been canceled'
    });

    checkouts[id] = checkout;

    res.json(buildCheckoutResponse(checkout));
  } catch (error) {
    console.error('Error canceling checkout:', error);
    res.status(500).json({
      type: 'processing_error',
      code: 'internal_error',
      message: 'An error occurred while canceling the checkout'
    });
  }
});

/**
 * GET /products
 * List available products (bonus endpoint for convenience)
 */
app.get('/products', (req, res) => {
  res.json({
    products: Object.values(PRODUCT_CATALOG)
  });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ACP Seller Backend is running' });
});

// Start server (only if not being imported for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n✨ ACP Seller Backend Server is running!`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔗 Base URL: http://localhost:${PORT}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  GET    /health                    - Health check`);
    console.log(`  GET    /products                  - List products`);
    console.log(`  POST   /checkouts                 - Create checkout`);
    console.log(`  GET    /checkouts/:id             - Get checkout`);
    console.log(`  PUT    /checkouts/:id             - Update checkout`);
    console.log(`  POST   /checkouts/:id/complete    - Complete checkout`);
    console.log(`  POST   /checkouts/:id/cancel      - Cancel checkout`);
    console.log(`\n`);
  });
}

module.exports = app;

