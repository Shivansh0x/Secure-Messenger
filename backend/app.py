import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
from werkzeug.security import generate_password_hash, check_password_hash
import pymysql

pymysql.install_as_MySQLdb()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') or \
    'mysql+pymysql://root:uMdiqLfnvXorOmXEbXTITJUMXlCkdkoI@switchback.proxy.rlwy.net:46141/railway'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Online Users Store
online_users = {}

# ────── Models ──────
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(64), nullable=False)
    recipient = db.Column(db.String(64), nullable=False)
    message = db.Column(db.Text, nullable=False)  # stores JSON string of encrypted record
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# ────── Routes ──────
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409
    new_user = User(username=username, password_hash=generate_password_hash(password))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered"}), 200

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401
    return jsonify({"message": "Login successful"}), 200

@app.route("/send", methods=["POST"])
def send_message():
    data = request.json
    sender = data.get("sender")
    recipient = data.get("recipient")
    message = data.get("message")

    if not sender or not recipient or not message:
        return jsonify({"error": "Missing fields"}), 400

    new_msg = Message(sender=sender, recipient=recipient, message=message)
    db.session.add(new_msg)
    db.session.commit()

    # Notify recipient via Socket.IO, if online
    if recipient in online_users:
        emit("receive_message", {
            "sender": sender,
            "recipient": recipient,
            "message": message,
            "timestamp": new_msg.timestamp.isoformat() + "Z"
        }, room=online_users[recipient])

    return jsonify({"status": "success"})

@app.route("/chat/<user1>/<user2>", methods=["GET"])
def chat_between_users(user1, user2):
    messages = Message.query.filter(
        ((Message.sender == user1) & (Message.recipient == user2)) |
        ((Message.sender == user2) & (Message.recipient == user1))
    ).order_by(Message.timestamp).all()
    return jsonify([{
        "sender": m.sender,
        "recipient": m.recipient,
        "message": m.message,
        "timestamp": m.timestamp.isoformat() + "Z"
    } for m in messages])

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
    return jsonify(list(contacts))

@app.route("/")
def home():
    return "SocketIO Server Running"

# ────── Socket.IO events ──────
from flask import request

@socketio.on("user_connected")
def handle_user_connected(data):
    username = data.get("username")
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
