"""
Chat Backend Server
Simple Python server that acts as a bridge between chat/AI agents and the seller backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from acp_client import ACPClient
from config import CHAT_BACKEND_PORT, DEBUG

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
acp = ACPClient()


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Chat Backend is running'})


@app.route('/products', methods=['GET'])
def list_products():
    """Get list of available products from seller"""
    result = acp.list_products()
    if 'error' in result:
        return jsonify(result), result.get('status_code', 500)
    return jsonify(result)


@app.route('/checkout/create', methods=['POST'])
def create_checkout():
    """
    Create a new checkout session
    
    Expected JSON body:
    {
        "items": [{"id": "item_123", "quantity": 2}],
        "buyer": {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
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
    """
    data = request.json
    
    if not data or 'items' not in data:
        return jsonify({'error': 'Items are required'}), 400
    
    result = acp.create_checkout(
        items=data['items'],
        buyer=data.get('buyer'),
        fulfillment_address=data.get('fulfillment_address')
    )
    
    if 'error' in result:
        return jsonify(result), result.get('status_code', 500)
    
    return jsonify(result), 201


@app.route('/checkout/<checkout_id>', methods=['GET'])
def get_checkout(checkout_id):
    """Retrieve an existing checkout session"""
    result = acp.get_checkout(checkout_id)
    
    if 'error' in result:
        return jsonify(result), result.get('status_code', 404)
    
    return jsonify(result)


@app.route('/checkout/<checkout_id>/update', methods=['PUT'])
def update_checkout(checkout_id):
    """
    Update an existing checkout session
    
    Expected JSON body (all fields optional):
    {
        "items": [{"id": "item_123", "quantity": 3}],
        "buyer": {"first_name": "Jane", ...},
        "fulfillment_address": {...},
        "fulfillment_option_id": "shipping_fast"
    }
    """
    data = request.json or {}
    
    result = acp.update_checkout(
        checkout_id=checkout_id,
        items=data.get('items'),
        buyer=data.get('buyer'),
        fulfillment_address=data.get('fulfillment_address'),
        fulfillment_option_id=data.get('fulfillment_option_id')
    )
    
    if 'error' in result:
        return jsonify(result), result.get('status_code', 400)
    
    return jsonify(result)


@app.route('/checkout/<checkout_id>/complete', methods=['POST'])
def complete_checkout(checkout_id):
    """
    Complete a checkout with payment
    
    Expected JSON body:
    {
        "payment_token": "tok_visa",
        "payment_provider": "stripe",
        "billing_address": {...}
    }
    """
    data = request.json
    
    if not data or 'payment_token' not in data:
        return jsonify({'error': 'Payment token is required'}), 400
    
    result = acp.complete_checkout(
        checkout_id=checkout_id,
        payment_token=data['payment_token'],
        payment_provider=data.get('payment_provider', 'stripe'),
        billing_address=data.get('billing_address')
    )
    
    if 'error' in result:
        return jsonify(result), result.get('status_code', 400)
    
    return jsonify(result)


@app.route('/checkout/<checkout_id>/cancel', methods=['POST'])
def cancel_checkout(checkout_id):
    """Cancel an existing checkout session"""
    result = acp.cancel_checkout(checkout_id)
    
    if 'error' in result:
        return jsonify(result), result.get('status_code', 400)
    
    return jsonify(result)


# Convenience endpoints for common workflows

@app.route('/quick-checkout', methods=['POST'])
def quick_checkout():
    """
    Quick checkout flow - create and complete in one call
    
    Expected JSON body:
    {
        "items": [{"id": "item_123", "quantity": 2}],
        "buyer": {...},
        "fulfillment_address": {...},
        "payment_token": "tok_visa"
    }
    """
    data = request.json
    
    if not data or 'items' not in data or 'payment_token' not in data:
        return jsonify({'error': 'Items and payment_token are required'}), 400
    
    # Step 1: Create checkout
    checkout_result = acp.create_checkout(
        items=data['items'],
        buyer=data.get('buyer'),
        fulfillment_address=data.get('fulfillment_address')
    )
    
    if 'error' in checkout_result:
        return jsonify({'step': 'create', 'error': checkout_result}), 400
    
    checkout_id = checkout_result['id']
    
    # Step 2: Complete checkout
    complete_result = acp.complete_checkout(
        checkout_id=checkout_id,
        payment_token=data['payment_token'],
        payment_provider=data.get('payment_provider', 'stripe'),
        billing_address=data.get('billing_address')
    )
    
    if 'error' in complete_result:
        return jsonify({'step': 'complete', 'error': complete_result, 'checkout_id': checkout_id}), 400
    
    return jsonify(complete_result), 201


if __name__ == '__main__':
    print(f"\n🤖 Chat Backend Server Starting...")
    print(f"📍 Port: {CHAT_BACKEND_PORT}")
    print(f"🔗 Seller Backend: {acp.base_url}")
    print(f"\nAvailable endpoints:")
    print(f"  GET    /health                        - Health check")
    print(f"  GET    /products                      - List products")
    print(f"  POST   /checkout/create               - Create checkout")
    print(f"  GET    /checkout/<id>                 - Get checkout")
    print(f"  PUT    /checkout/<id>/update          - Update checkout")
    print(f"  POST   /checkout/<id>/complete        - Complete checkout")
    print(f"  POST   /checkout/<id>/cancel          - Cancel checkout")
    print(f"  POST   /quick-checkout                - Quick checkout flow")
    print(f"\n")
    
    app.run(host='0.0.0.0', port=CHAT_BACKEND_PORT, debug=DEBUG)

