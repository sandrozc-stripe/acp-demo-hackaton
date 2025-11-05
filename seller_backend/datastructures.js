/**
 * Data Structures for Agentic Commerce Protocol
 * This file contains all the data structure definitions and helper functions
 */

// Checkout Status
const CheckoutStatus = {
  NOT_READY_FOR_PAYMENT: 'not_ready_for_payment',
  READY_FOR_PAYMENT: 'ready_for_payment',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
  IN_PROGRESS: 'in_progress'
};

// Message Types
const MessageType = {
  INFO: 'info',
  ERROR: 'error'
};

// Total Types
const TotalType = {
  ITEMS_BASE_AMOUNT: 'items_base_amount',
  ITEMS_DISCOUNT: 'items_discount',
  SUBTOTAL: 'subtotal',
  DISCOUNT: 'discount',
  FULFILLMENT: 'fulfillment',
  TAX: 'tax',
  FEE: 'fee',
  TOTAL: 'total'
};

// Fulfillment Types
const FulfillmentType = {
  SHIPPING: 'shipping',
  DIGITAL: 'digital'
};

// Link Types
const LinkType = {
  TERMS_OF_USE: 'terms_of_use',
  PRIVACY_POLICY: 'privacy_policy',
  SELLER_SHOP_POLICIES: 'seller_shop_policies'
};

/**
 * Sample product catalog (for demo purposes)
 */
const PRODUCT_CATALOG = {
  'item_123': {
    id: 'item_123',
    name: 'The Origins of Efficiency - Brian Potter',
    price: 4000, // price per unit in cents
    description: 'Stripe Press Book',
    stock: 100,
    image: "https://images-us.bookshop.org/ingram/9781953953520.jpg"
  },
  'item_456': {
    id: 'item_456',
    name: 'Scaling People: Tactics for Management and Company Building - Claire Hughes Johnson',
    price: 3500,
    description: 'Stripe Press Book',
    stock: 50,
    image: "https://images-us.bookshop.org/ingram/9781953953216.jpg"
  },
  'item_789': {
    id: 'item_789',
    name: 'Pieces of the Action - Vannevar Bush & Ben Reinhardt',
    price: 2400,
    description: 'Stripe Press Book',
    stock: 25,
    image: "https://images-us.bookshop.org/ingram/9781953953209.jpg"
  }
};

/**
 * Create a Buyer object
 */
function createBuyer(data = {}) {
  return {
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    email: data.email || '',
    phone_number: data.phone_number || null
  };
}

/**
 * Create an Address object
 */
function createAddress(data = {}) {
  return {
    name: data.name || '',
    line_one: data.line_one || '',
    line_two: data.line_two || null,
    city: data.city || '',
    state: data.state || '',
    country: data.country || '',
    postal_code: data.postal_code || ''
  };
}

/**
 * Create a LineItem from an item request
 */
function createLineItem(item, product) {
  const baseAmount = product.price * item.quantity;
  const discount = 0; // No discounts for demo
  const subtotal = baseAmount - discount;
  const tax = 0; // Simplified - no tax calculation
  const total = subtotal + tax;

  return {
    id: item.id,
    item: {
      id: item.id,
      quantity: item.quantity
    },
    base_amount: baseAmount,
    discount: discount,
    subtotal: subtotal,
    tax: tax,
    total: total
  };
}

/**
 * Get available fulfillment options
 */
function getFulfillmentOptions() {
  return [
    {
      type: FulfillmentType.SHIPPING,
      id: 'shipping_standard',
      title: 'Standard Shipping',
      subtitle: '5-7 business days',
      carrier: 'USPS',
      subtotal: 300, // $3.00
      tax: 0,
      total: 300
    },
    {
      type: FulfillmentType.SHIPPING,
      id: 'shipping_fast',
      title: 'Express Shipping',
      subtitle: '2-3 business days',
      carrier: 'FedEx',
      subtotal: 500, // $5.00
      tax: 0,
      total: 500
    },
    {
      type: FulfillmentType.SHIPPING,
      id: 'shipping_overnight',
      title: 'Overnight Shipping',
      subtitle: 'Next business day',
      carrier: 'FedEx',
      subtotal: 800, // $8.00
      tax: 0,
      total: 800
    }
  ];
}

/**
 * Calculate totals for a checkout
 */
function calculateTotals(lineItems, fulfillmentOption) {
  const itemsSubtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  const itemsDiscount = lineItems.reduce((sum, item) => sum + item.discount, 0);
  const itemsTax = lineItems.reduce((sum, item) => sum + item.tax, 0);
  
  const fulfillmentAmount = fulfillmentOption ? fulfillmentOption.total : 0;
  const totalAmount = itemsSubtotal + fulfillmentAmount + itemsTax;

  return [
    {
      type: TotalType.SUBTOTAL,
      display_text: 'Subtotal',
      amount: itemsSubtotal
    },
    {
      type: TotalType.FULFILLMENT,
      display_text: 'Shipping',
      amount: fulfillmentAmount
    },
    {
      type: TotalType.TAX,
      display_text: 'Tax',
      amount: itemsTax
    },
    {
      type: TotalType.TOTAL,
      display_text: 'Total',
      amount: totalAmount
    }
  ];
}

/**
 * Create a payment provider object
 */
function createPaymentProvider() {
  return {
    provider: 'stripe',
    supported_payment_methods: ['card']
  };
}

/**
 * Generate a unique ID
 */
function generateId(prefix = 'checkout') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  CheckoutStatus,
  MessageType,
  TotalType,
  FulfillmentType,
  LinkType,
  PRODUCT_CATALOG,
  createBuyer,
  createAddress,
  createLineItem,
  getFulfillmentOptions,
  calculateTotals,
  createPaymentProvider,
  generateId
};

