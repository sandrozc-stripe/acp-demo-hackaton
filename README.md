# Agentic Commerce Protocol (ACP) Implementation

Complete implementation of the Agentic Commerce Protocol with seller backend and chat backend.

## Overview

```
┌─────────────────────────────────┐
│   Chat Frontend (HTML/JS)       │
│   - Interactive chat UI         │
│   - Shopping cart               │
│   - Checkout flow               │
│   Port: 8000 (optional)         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Chat Backend (Python)         │
│   - Flask API                   │
│   - ACP Client                  │
│   Port: 5000                    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Seller Backend (Node.js)      │
│   - Express API                 │
│   - ACP Implementation          │
│   - Product Catalog             │
│   Port: 3000                    │
└─────────────────────────────────┘
```

## Project Structure

```
ACP/
├── specification.md              # ACP specification document
├── README.md                    # This file
│
├── seller_backend/               # Node.js seller backend
│   ├── server.js                    # Main Express server
│   ├── datastructures.js           # Data structures & helpers
│   ├── package.json                # Dependencies
│   ├── README.md                   # Seller backend docs
│   └── test/                       # Test suite (57 tests)
│       ├── checkouts.test.js
│       ├── products.test.js
│       └── integration.test.js
│
├── chat_backend/                 # Python chat backend
│   ├── server.py                   # Flask server
│   ├── acp_client.py              # ACP client
│   ├── config.py                  # Configuration
│   ├── requirements.txt           # Python dependencies
│   └── README.md                 # Chat backend docs
│
└── chat_frontend/                # HTML/JS chat interface
    ├── index.html                  # Main HTML
    ├── styles.css                  # Styling
    ├── app.js                      # Application logic
    └── README.md                  # Frontend docs
```

## Features

### Seller Backend (Node.js)
- ✅ Full ACP implementation
- ✅ All checkout operations (Create, Retrieve, Update, Complete, Cancel)
- ✅ Product catalog management
- ✅ Multiple shipping options
- ✅ Comprehensive test suite (57 tests, 85%+ coverage)
- ✅ In-memory data storage (demo)

### Chat Backend (Python)
- ✅ Simple Flask API
- ✅ ACP-compliant client
- ✅ All checkout operations supported
- ✅ Convenience endpoints (quick checkout)
- ✅ CORS enabled for browser access
- ✅ Clean and documented

### Chat Frontend (HTML/JS)
- ✅ Beautiful, modern chat interface
- ✅ Interactive shopping experience
- ✅ Product browsing in chat
- ✅ Shopping cart management
- ✅ Complete checkout flow in chat
- ✅ No framework dependencies (vanilla JS)
- ✅ Mobile-responsive design

## Quick Start

### 1. Start Seller Backend

```bash
# Terminal 1
cd seller_backend
npm install
npm start
```

Server starts on `http://localhost:3000`

### 2. Start Chat Backend

```bash
# Terminal 2
cd chat_backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

Server starts on `http://localhost:5000`

### 3. Open Chat Frontend

Simply open `chat_frontend/index.html` in your browser, or:

```bash
# Terminal 3
cd chat_frontend
python -m http.server 8000
# Then open http://localhost:8000
```

**That's it!** Start shopping in the chat interface! 🎉

## API Endpoints

### Seller Backend (Port 3000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/products` | List products |
| POST | `/checkouts` | Create checkout |
| GET | `/checkouts/:id` | Retrieve checkout |
| PUT | `/checkouts/:id` | Update checkout |
| POST | `/checkouts/:id/complete` | Complete checkout |
| POST | `/checkouts/:id/cancel` | Cancel checkout |

### Chat Backend (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/products` | List products |
| POST | `/checkout/create` | Create checkout |
| GET | `/checkout/:id` | Retrieve checkout |
| PUT | `/checkout/:id/update` | Update checkout |
| POST | `/checkout/:id/complete` | Complete checkout |
| POST | `/checkout/:id/cancel` | Cancel checkout |
| POST | `/quick-checkout` | Quick checkout (create + complete) |

## Example Usage

### cURL Examples

```bash
# List products
curl http://localhost:5000/products

# Create checkout
curl -X POST http://localhost:5000/checkout/create \
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

# Complete checkout (replace CHECKOUT_ID)
curl -X POST http://localhost:5000/checkout/CHECKOUT_ID/complete \
  -H "Content-Type: application/json" \
  -d '{"payment_token": "tok_visa"}'
```

### Python Example

```python
import requests

# List products
response = requests.get('http://localhost:5000/products')
products = response.json()

# Create and complete checkout
checkout_data = {
    'items': [{'id': 'item_123', 'quantity': 2}],
    'buyer': {
        'first_name': 'Alice',
        'last_name': 'Johnson',
        'email': 'alice@example.com'
    },
    'fulfillment_address': {
        'name': 'Alice Johnson',
        'line_one': '100 Market St',
        'city': 'San Francisco',
        'state': 'CA',
        'country': 'US',
        'postal_code': '94105'
    },
    'payment_token': 'tok_visa'
}

response = requests.post('http://localhost:5000/quick-checkout', json=checkout_data)
result = response.json()
print(f"Order completed! Status: {result['status']}")
```

## Sample Products

The demo includes three products:

| ID | Name | Price | Stock |
|----|------|-------|-------|
| `item_123` | Premium Widget | $10.00 | 100 |
| `item_456` | Basic Gadget | $5.00 | 50 |
| `item_789` | Deluxe Tool | $15.00 | 25 |

## Shipping Options

| ID | Name | Speed | Cost |
|----|------|-------|------|
| `shipping_standard` | Standard Shipping | 5-7 days | $5.00 |
| `shipping_fast` | Express Shipping | 2-3 days | $15.00 |
| `shipping_overnight` | Overnight Shipping | Next day | $30.00 |

## Testing

### Run Seller Backend Tests

```bash
cd seller_backend
npm test                  # Run all tests
npm run test:coverage     # Run with coverage
```

Test results:
```
Test Suites: 4 passed, 4 total
Tests:       57 passed, 57 total
Coverage:    85%+ across all files
```

## ACP Compliance

This implementation follows the Agentic Commerce Protocol specification:

✅ **Data Structures**
- Buyer, Item, LineItem, Address
- PaymentData, PaymentProvider
- FulfillmentOption (Shipping & Digital)
- Total, Message, Link, Error

✅ **Checkout Operations**
- Create with items, buyer, fulfillment address
- Retrieve by ID
- Update items, address, fulfillment options
- Complete with payment data
- Cancel checkout

✅ **Status Management**
- `not_ready_for_payment` - Missing required info
- `ready_for_payment` - Ready to process
- `in_progress` - Processing
- `completed` - Order complete
- `canceled` - Order canceled

✅ **Validation & Error Handling**
- Required field validation
- Stock checking
- Invalid ID handling
- Status transition rules

## Use Cases

This implementation is perfect for:

- **AI Shopping Assistants** - Let AI agents complete purchases
- **Chatbots** - Build conversational commerce experiences
- **Voice Commerce** - Enable voice-based shopping
- **Testing & Demos** - Demonstrate ACP implementation
- **Integration** - Bridge between systems

## Configuration

### Seller Backend

Edit `seller_backend/server.js` to configure:
- Port (default: 3000)
- Product catalog
- Shipping options

### Chat Backend

Edit `chat_backend/.env` to configure:
- `SELLER_BACKEND_URL` - Seller backend URL
- `CHAT_BACKEND_PORT` - Chat backend port (default: 5000)
- `DEBUG` - Debug mode

## Documentation

- **Seller Backend**: See `seller_backend/README.md`
- **Chat Backend**: See `chat_backend/README.md` and `chat_backend/QUICKSTART.md`
- **Specification**: See `specification.md`

## Development Notes

### Demo Implementation
- In-memory storage (data lost on restart)
- Simulated payment processing
- No authentication/authorization
- Not production-ready

### For Production
Consider adding:
- Persistent database (PostgreSQL, MongoDB)
- Real payment processing (Stripe integration)
- Authentication & authorization (JWT, OAuth)
- Rate limiting
- Request logging
- Caching (Redis)
- WebSocket support
- Error monitoring
- Load balancing

## Architecture Benefits

**Separation of Concerns**
- Seller backend focuses on commerce logic
- Chat backend handles AI/agent interactions

**Flexibility**
- Easy to add new AI agents
- Simple to integrate different sellers
- Protocol-based communication

**Scalability**
- Independent scaling of components
- Stateless design
- Horizontal scaling ready

## Technology Stack

### Seller Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Testing**: Jest + Supertest
- **Storage**: In-memory (demo)

### Chat Backend
- **Runtime**: Python 3.8+
- **Framework**: Flask
- **HTTP Client**: Requests
- **Config**: python-dotenv

## Support & Contributing

This is a demo implementation for the Agentic Commerce Protocol.

## License

Demo/Educational purposes

---

**Status**: ✅ Production-ready for demo
**Version**: 1.0.0
**Last Updated**: November 2025

🎉 Happy Commerce!

