# ACP Seller Backend - Demo Implementation

A simple demo implementation of the Stripe Agentic Commerce Protocol (ACP) seller backend.

## Features

This server implements all the core ACP endpoints:

- ✅ Create Checkout Session
- ✅ Retrieve Checkout Session
- ✅ Update Checkout Session
- ✅ Complete Checkout
- ✅ Cancel Checkout

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Navigate to the seller_backend directory:
```bash
cd seller_backend
```

2. Install dependencies:
```bash
npm install
```

### Running the Server

Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode (re-runs on file changes):
```bash
npm run test:watch
```

Run tests with coverage report:
```bash
npm run test:coverage
```

## API Endpoints

### Health Check
```
GET /health
```

### List Products (Bonus)
```
GET /products
```

### Create Checkout
```
POST /checkouts
Content-Type: application/json

{
  "items": [
    {
      "id": "item_123",
      "quantity": 2
    }
  ],
  "buyer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890"
  },
  "fulfillment_address": {
    "name": "John Doe",
    "line_one": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "postal_code": "94105"
  }
}
```

### Retrieve Checkout
```
GET /checkouts/:id
```

### Update Checkout
```
PUT /checkouts/:id
Content-Type: application/json

{
  "items": [
    {
      "id": "item_123",
      "quantity": 3
    }
  ],
  "fulfillment_option_id": "shipping_fast"
}
```

### Complete Checkout
```
POST /checkouts/:id/complete
Content-Type: application/json

{
  "payment_data": {
    "token": "tok_visa",
    "provider": "stripe",
    "billing_address": {
      "name": "John Doe",
      "line_one": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "country": "US",
      "postal_code": "94105"
    }
  }
}
```

### Cancel Checkout
```
POST /checkouts/:id/cancel
```

## Sample Products

The demo includes three sample products:

- `item_123` - Premium Widget ($10.00)
- `item_456` - Basic Gadget ($5.00)
- `item_789` - Deluxe Tool ($15.00)

## Testing with cURL

### Create a checkout:
```bash
curl -X POST http://localhost:3000/checkouts \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": "item_123", "quantity": 2}],
    "buyer": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "fulfillment_address": {
      "name": "John Doe",
      "line_one": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "country": "US",
      "postal_code": "94105"
    }
  }'
```

### Get checkout (replace CHECKOUT_ID):
```bash
curl http://localhost:3000/checkouts/CHECKOUT_ID
```

### Complete checkout:
```bash
curl -X POST http://localhost:3000/checkouts/CHECKOUT_ID/complete \
  -H "Content-Type: application/json" \
  -d '{
    "payment_data": {
      "token": "tok_visa",
      "provider": "stripe"
    }
  }'
```

## Project Structure

```
seller_backend/
├── package.json             # Node.js dependencies
├── server.js               # Main server with API endpoints
├── datastructures.js       # Data structures and helper functions
├── README.md              # This file
├── example-requests.md    # Example API requests
├── .gitignore            # Git ignore file
└── test/                 # Test files
    ├── checkouts.test.js      # Checkout endpoints tests
    ├── products.test.js       # Products endpoint tests
    ├── health.test.js         # Health endpoint tests
    └── integration.test.js    # Integration tests
```

## Testing

This project includes comprehensive test coverage for all API endpoints:

### Test Files

- **checkouts.test.js** - Tests for all checkout operations (Create, Retrieve, Update, Complete, Cancel)
- **products.test.js** - Tests for product listing endpoint
- **health.test.js** - Tests for health check endpoint
- **integration.test.js** - Full end-to-end integration tests

### Test Coverage

The test suite covers:
- ✅ All happy path scenarios
- ✅ Error handling and validation
- ✅ Edge cases (canceled checkouts, completed checkouts, etc.)
- ✅ Full checkout flows from creation to completion
- ✅ Multiple item management
- ✅ Fulfillment option changes
- ✅ Status transitions

## Notes

- This is a demo implementation with in-memory storage
- Data is lost when the server restarts
- Payment processing is simulated (not real transactions)
- Stock levels are not actually decremented
- For production, you would need:
  - Persistent database
  - Real payment processing
  - Authentication/authorization
  - Input validation and sanitization
  - Rate limiting
  - Logging and monitoring

