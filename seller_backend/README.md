# ACP Seller Backend

Demo implementation of the Stripe Agentic Commerce Protocol (ACP) seller backend.

## Features

- Create, retrieve, update, complete, and cancel checkout sessions
- Product catalog endpoint
- Full test coverage

## Quick Start

### Install & Run
```bash
cd seller_backend
npm install
npm start
```

Server starts on `http://localhost:3000`

### Development Mode
```bash
npm run dev
```

### Run Tests
```bash
npm test
npm run test:coverage
```

## API Endpoints

- `GET /health` - Health check
- `GET /products` - List products
- `POST /checkouts` - Create checkout
- `GET /checkouts/:id` - Retrieve checkout
- `PUT /checkouts/:id` - Update checkout
- `POST /checkouts/:id/complete` - Complete checkout
- `POST /checkouts/:id/cancel` - Cancel checkout

## Project Structure

```
seller_backend/
├── server.js           # Main server
├── datastructures.js   # Data structures & helpers
├── package.json        # Dependencies
└── test/              # Test suite
```

## Notes

- Demo implementation with in-memory storage
- Data lost on server restart
- Payment processing is simulated
- Not production-ready
