from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

#  Load products from products.json
try:
    with open('products.json', 'r') as f:
        mock_products = json.load(f)
        print(f"Loaded {len(mock_products)} products.")
except Exception as e:
    print("Failed to load products.json:", e)
    mock_products = []

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get("message", "").lower()
    user_id = data.get("user_id")
    conversation_id = data.get("conversation_id")

    print(f"\n User: {message}")
    print(f" Matching against {len(mock_products)} products...")

    #  Basic keyword match
    matched_products = [
        p for p in mock_products if any(word in p["name"].lower() for word in message.split())
    ]

    print(f" Found {len(matched_products)} matching products.")

    if matched_products:
        return jsonify({
            "products": matched_products[:5],  # Limit to 5 products
            "bot": f"Here are {len(matched_products)} products matching your search."
        })
    else:
        return jsonify({
            "products": [],
            "bot": "Sorry, no matching products found."
        })

#  Optional health check
@app.route('/')
def index():
    return " Flask backend is running!"

if __name__ == '__main__':
    app.run(debug=True, port=5000)
