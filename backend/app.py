# app.py  –  Simple Flask backend for Secure Messenger
import eventlet
eventlet.monkey_patch()
import os
import json
from datetime import datetime
from flask_socketio import SocketIO, emit
from flask import Flask, request, jsonify
from flask_cors import CORS


# ------------------------------------------------------------------------
# 1.  App & CORS
# ------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)                     
socketio = SocketIO(app, cors_allowed_origins="*")
online_users = {}

USERS_FILE    = "users.json"
MESSAGES_FILE = "messages.json"


# ------------------------------------------------------------------------
# 2.  Helper functions  (load/save JSON)
# ------------------------------------------------------------------------
def load_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return default


def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


# ------------------------------------------------------------------------
# 3.  User Registration  (POST /register)
# ------------------------------------------------------------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    users = load_json(USERS_FILE, {})

    if username in users:
        return jsonify({"error": "Username already exists"}), 409

    users[username] = password              # (plain text for demo only!)
    save_json(USERS_FILE, users)

    return jsonify({"message": "User registered"}), 200


# ------------------------------------------------------------------------
# 4.  User Login  (POST /login)
# ------------------------------------------------------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    users = load_json(USERS_FILE, {})

    if username not in users or users[username] != password:
        return jsonify({"error": "Invalid credentials"}), 401

    # For now we just say "OK" (no JWT yet)
    return jsonify({"message": "Login successful"}), 200


# ------------------------------------------------------------------------
# 5.  Send Message  (POST /send)
# ------------------------------------------------------------------------
@app.route('/send', methods=['POST'])
def send_message():
    data = request.get_json()
    sender = data['sender']
    recipient = data['recipient']
    message = data['message']

    # ✅ Check recipient exists
    with open('users.json', 'r') as f:
        users = json.load(f)
    if recipient not in users:
        return jsonify({"status": "error", "message": "Recipient does not exist."}), 400

    # Add timestamp to message
    timestamp = datetime.now().isoformat()
    new_msg = {
        "sender": sender,
        "recipient": recipient,
        "message": message,
        "timestamp": timestamp
    }

    with open('messages.json', 'r+') as f:
        try:
            messages = json.load(f)
        except json.JSONDecodeError:
            messages = []
        messages.append(new_msg)
        f.seek(0)
        json.dump(messages, f, indent=2)
        f.truncate()

    return jsonify({"status": "success"})



# ------------------------------------------------------------------------
# 6.  Inbox  (GET /inbox/<username>)
# ------------------------------------------------------------------------
@app.route("/inbox/<username>", methods=["GET"])
def inbox(username):
    messages = load_json(MESSAGES_FILE, [])
    user_msgs = [m for m in messages if m["recipient"] == username]
    return jsonify(user_msgs), 200

@socketio.on('connect')
def handle_connect():
    pass  # connection established, but no user info yet

@socketio.on('user_connected')
def handle_user_connected(data):
    username = data.get('username')
    if username:
        online_users[username] = request.sid
        emit('update_online_users', list(online_users.keys()), broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    for user, sid in list(online_users.items()):
        if sid == request.sid:
            del online_users[user]
            break
    emit('update_online_users', list(online_users.keys()), broadcast=True)



@app.route('/contacts/<username>', methods=['GET'])
def get_contacts(username):
    messages = load_json(MESSAGES_FILE, [])
    user_messages = [
        msg for msg in messages
        if msg['sender'] == username or msg['recipient'] == username
    ]
    contacts = set()
    for msg in user_messages:
        if msg['sender'] != username:
            contacts.add(msg['sender'])
        if msg['recipient'] != username:
            contacts.add(msg['recipient'])
    return jsonify(list(contacts))


@app.route("/")
def home():
    return "SocketIO Server Running"


# ------------------------------------------------------------------------
# 7.  Run the server
# ------------------------------------------------------------------------
if __name__ == "__main__":
    # Ensure storage files exist
    if not os.path.exists(USERS_FILE):
        save_json(USERS_FILE, {})
    if not os.path.exists(MESSAGES_FILE):
        save_json(MESSAGES_FILE, [])
    socketio.run(app, host='0.0.0.0', port=5000)
