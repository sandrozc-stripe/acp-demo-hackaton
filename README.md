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

## Documentation

- **Seller Backend**: See `seller_backend/README.md`
- **Chat Backend**: See `chat_backend/README.md` and `chat_backend/QUICKSTART.md`
- **Specification**: See `specification.md`

## Development Notes

### Demo Implementation
- In-memory storage (data lost on restart)
- No authentication/authorization


