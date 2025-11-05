# Chat Backend - ACP Client

Python server that acts as a bridge between chat/AI agents and the seller backend, following the Agentic Commerce Protocol.

## Features

- ✅ Simple Python Flask server
- ✅ ACP-compliant client for seller backend
- ✅ All checkout operations supported
- ✅ Convenience endpoints for common workflows
- ✅ Clean and well-documented API

## Architecture

```
Chat/AI Agent → Chat Backend (Python) → Seller Backend (Node.js) → ACP Protocol
```

## Quick Start

### 1. Install Dependencies

```bash
cd chat_backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (default settings work if seller_backend is on localhost:3000)

### 3. Start the Server

**Important**: Make sure the seller_backend is running first!

```bash
# In one terminal - start seller backend
cd seller_backend
npm start

# In another terminal - start chat backend
cd chat_backend
source venv/bin/activate
python server.py
```

The chat backend will start on `http://localhost:5000`

## API Endpoints

### Health Check
```bash
GET /health
```

### List Products
```bash
GET /products
```

### Create Checkout
```bash
POST /checkout/create
Content-Type: application/json

{
  "items": [
    {"id": "item_123", "quantity": 2}
  ],
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
}
```

### Get Checkout
```bash
GET /checkout/{checkout_id}
```

### Update Checkout
```bash
PUT /checkout/{checkout_id}/update
Content-Type: application/json

{
  "items": [{"id": "item_456", "quantity": 1}],
  "fulfillment_option_id": "shipping_fast"
}
```

### Complete Checkout
```bash
POST /checkout/{checkout_id}/complete
Content-Type: application/json

{
  "payment_token": "tok_visa",
  "payment_provider": "stripe",
  "billing_address": {
    "name": "John Doe",
    "line_one": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "postal_code": "94105"
  }
}
```

### Cancel Checkout
```bash
POST /checkout/{checkout_id}/cancel
```

### Quick Checkout (Convenience)
```bash
POST /quick-checkout
Content-Type: application/json

{
  "items": [{"id": "item_123", "quantity": 1}],
  "buyer": {
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com"
  },
  "fulfillment_address": {
    "name": "Jane Smith",
    "line_one": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "country": "US",
    "postal_code": "90210"
  },
  "payment_token": "tok_visa"
}
```

## Example Usage

### With cURL

```bash
# List products
curl http://localhost:5000/products

# Create checkout
curl -X POST http://localhost:5000/checkout/create \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": "item_123", "quantity": 2}],
    "buyer": {
      "first_name": "Alice",
      "last_name": "Johnson",
      "email": "alice@example.com"
    },
    "fulfillment_address": {
      "name": "Alice Johnson",
      "line_one": "100 Market St",
      "city": "San Francisco",
      "state": "CA",
      "country": "US",
      "postal_code": "94105"
    }
  }'

# Get checkout (replace CHECKOUT_ID)
curl http://localhost:5000/checkout/CHECKOUT_ID

# Complete checkout
curl -X POST http://localhost:5000/checkout/CHECKOUT_ID/complete \
  -H "Content-Type: application/json" \
  -d '{
    "payment_token": "tok_visa"
  }'
```

### With Python

```python
import requests

# List products
response = requests.get('http://localhost:5000/products')
products = response.json()
print(products)

# Create checkout
checkout_data = {
    'items': [{'id': 'item_123', 'quantity': 2}],
    'buyer': {
        'first_name': 'Bob',
        'last_name': 'Smith',
        'email': 'bob@example.com'
    }
}
response = requests.post('http://localhost:5000/checkout/create', json=checkout_data)
checkout = response.json()
checkout_id = checkout['id']

# Complete checkout
payment_data = {'payment_token': 'tok_visa'}
response = requests.post(f'http://localhost:5000/checkout/{checkout_id}/complete', json=payment_data)
result = response.json()
print(result)
```

## Project Structure

```
chat_backend/
├── server.py           # Main Flask server
├── acp_client.py       # ACP protocol client
├── config.py           # Configuration
├── requirements.txt    # Python dependencies
├── .env.example        # Example environment variables
├── .gitignore         # Git ignore
└── README.md          # This file
```

## Configuration

Edit `.env` to configure:

- `SELLER_BACKEND_URL` - URL of the seller backend (default: http://localhost:3000)
- `CHAT_BACKEND_PORT` - Port for chat backend (default: 5000)
- `DEBUG` - Debug mode (default: True)

## Development

### Running in Development Mode

```bash
python server.py
```

The server will auto-reload on code changes when DEBUG=True.

### Adding New Endpoints

1. Add method to `ACPClient` class in `acp_client.py`
2. Add route to `server.py`
3. Update README with new endpoint

## Use Cases

This chat backend is perfect for:

- **AI Agents** - Let AI agents interact with e-commerce via simple API
- **Chatbots** - Build shopping chatbots that process orders
- **Voice Assistants** - Enable voice-based shopping experiences
- **Integration Layer** - Bridge between different systems
- **Testing** - Test the seller backend from Python

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

Error responses include details:
```json
{
  "error": "Error message",
  "status_code": 400
}
```

## Notes

- This is a demo implementation
- No authentication/authorization included
- Not production-ready (add security, logging, etc.)
- Assumes seller_backend is trusted

## Next Steps

For production use, consider adding:

- Authentication/Authorization
- Request logging
- Rate limiting
- Caching
- Database for session management
- WebSocket support for real-time updates

