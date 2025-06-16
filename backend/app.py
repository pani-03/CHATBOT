from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)

# Load products
try:
    with open('products.json', 'r') as f:
        mock_products = json.load(f)
except Exception as e:
    print("Failed to load products.json:", e)
    mock_products = []

# File paths
CONVERSATIONS_FILE = 'conversations.json'
MESSAGES_FILE = 'messages.json'

# Load or create JSON files
def load_json(file_path):
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump([], f)
    with open(file_path, 'r') as f:
        return json.load(f)

def save_json(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    return "✅ Flask backend running (No MySQL used)"

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

    if matched_products:
        bot_reply = f"Here are {len(matched_products)} products matching your search."
    else:
        bot_reply = "Sorry, no matching products found."

    # Save message to messages.json
    messages = load_json(MESSAGES_FILE)
    messages.append({
        "conversation_id": conversation_id,
        "user_id": user_id,
        "user_message": message,
        "bot_response": bot_reply,
        "timestamp": str(datetime.now(timezone.utc))
    })
    save_json(MESSAGES_FILE, messages)

    return jsonify({
        "products": matched_products[:5],
        "message": bot_reply
    })

@app.route('/new_conversation', methods=['POST'])
def new_conversation():
    data = request.get_json()
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "No user_id provided"}), 400

    conversation_id = str(datetime.now(timezone.utc).timestamp())

    conversations = load_json(CONVERSATIONS_FILE)
    conversations.append({
        "user_id": user_id,
        "conversation_id": conversation_id,
        "timestamp": str(datetime.now(timezone.utc))
    })
    save_json(CONVERSATIONS_FILE, conversations)

    return jsonify({"conversation_id": conversation_id})

@app.route('/conversation', methods=['DELETE'])
def delete_conversation():
    data = request.get_json()
    user_id = data.get("user_id")
    conversation_id = data.get("conversation_id")
    if not user_id or not conversation_id:
        return jsonify({"error": "No user_id or conversation_id provided"}), 400

    conversations = load_json(CONVERSATIONS_FILE)
    messages = load_json(MESSAGES_FILE)

    conversations = [c for c in conversations if c["conversation_id"] != conversation_id]
    messages = [m for m in messages if m["conversation_id"] != conversation_id]

    save_json(CONVERSATIONS_FILE, conversations)
    save_json(MESSAGES_FILE, messages)

    return jsonify({"message": "Conversation deleted"})

@app.route('/conversations', methods=['GET'])
def get_conversations():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "No user_id provided"}), 400

    conversations = load_json(CONVERSATIONS_FILE)
    user_convos = [
        {"conversation_id": c["conversation_id"]} for c in conversations if c["user_id"] == user_id
    ]
    return jsonify(user_convos)

@app.route('/history', methods=['GET'])
def chat_history():
    user_id = request.args.get("user_id")
    conversation_id = request.args.get("conversation_id")
    if not user_id or not conversation_id:
        return jsonify({"error": "No user_id or conversation_id provided"}), 400

    messages = load_json(MESSAGES_FILE)
    history = [
        {"user_message": m["user_message"], "bot_response": m["bot_response"]}
        for m in messages
        if m["user_id"] == user_id and m["conversation_id"] == conversation_id
    ]
    return jsonify(history)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
