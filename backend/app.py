import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
from sqlalchemy import func

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# ────── Database configuration (PostgreSQL) ──────
raw_db_url = os.getenv("DATABASE_URL")

app.config["SQLALCHEMY_DATABASE_URI"] = raw_db_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# Online Users Store
online_users = {}

# ────── Models ──────
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    password = db.Column(db.String(128), nullable=False)

class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(64), nullable=False, index=True)
    recipient = db.Column(db.String(64), nullable=False, index=True)
    message = db.Column(db.Text, nullable=False)
    # timezone-aware timestamp in Postgres
    timestamp = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

# ────── Routes ──────
@app.route("/register", methods=["POST"])
def register():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered"}), 200

@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    user = User.query.filter_by(username=username).first()
    if not user or user.password != password:
        return jsonify({"error": "Invalid credentials"}), 401
    return jsonify({"message": "Login successful"}), 200

@app.route("/send", methods=["POST"])
def send_message():
    data = request.json or {}
    sender = data.get("sender")
    recipient = data.get("recipient")
    message = data.get("message")

    if not sender or not recipient or not message:
        return jsonify({"status": "error", "message": "sender, recipient, and message are required."}), 400

    if not User.query.filter_by(username=recipient).first():
        return jsonify({"status": "error", "message": "Recipient does not exist."}), 400

    new_msg = Message(sender=sender, recipient=recipient, message=message)
    db.session.add(new_msg)
    db.session.commit()

    socketio.emit("receive_message", {
        "sender": sender,
        "recipient": recipient,
        "message": message,
        "timestamp": new_msg.timestamp.isoformat()
    })

    return jsonify({"status": "success"})

@app.route("/chat/<user1>/<user2>", methods=["GET"])
def chat_between_users(user1, user2):
    messages = Message.query.filter(
        ((Message.sender == user1) & (Message.recipient == user2)) |
        ((Message.sender == user2) & (Message.recipient == user1))
    ).order_by(Message.timestamp.asc()).all()
    return jsonify([
        {
            "sender": m.sender,
            "recipient": m.recipient,
            "message": m.message,
            "timestamp": m.timestamp.isoformat()
        }
        for m in messages
    ])

@app.route("/users/<username>", methods=["GET"])
def check_user_exists(username):
    # Case-insensitive existence check
    user = User.query.filter(func.lower(User.username) == func.lower(username)).first()
    if user:
        return jsonify({"exists": True, "username": user.username})
    return jsonify({"error": "User not found"}), 404

@app.route("/contacts/<username>", methods=["GET"])
def get_contacts(username):
    messages = Message.query.filter(
        (Message.sender == username) | (Message.recipient == username)
    ).all()
    contacts = set()
    for msg in messages:
        if msg.sender != username:
            contacts.add(msg.sender)
        if msg.recipient != username:
            contacts.add(msg.recipient)
    return jsonify(sorted(list(contacts)))

@app.route("/")
def home():
    return "SocketIO Server Running (PostgreSQL)"

# ────── SocketIO Events ──────
@socketio.on("connect")
def handle_connect():
    pass

@socketio.on("user_connected")
def handle_user_connected(data):
    username = data.get("username") if data else None
    if username:
        online_users[username] = request.sid
        emit("update_online_users", list(online_users.keys()), broadcast=True)

@socketio.on("disconnect")
def handle_disconnect():
    for user, sid in list(online_users.items()):
        if sid == request.sid:
            del online_users[user]
            break
    emit("update_online_users", list(online_users.keys()), broadcast=True)

# ────── DB Init and Run ──────
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
