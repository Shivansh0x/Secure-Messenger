# app.py – Flask backend with MySQL (Railway) replacing JSON files

import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
import pymysql

pymysql.install_as_MySQLdb()

# ────── App Setup ──────
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# ────── MySQL Config (Railway) ──────
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') or \
    'mysql+pymysql://root:uMdiqLfnvXorOmXEbXTITJUMXlCkdkoI@switchback.proxy.rlwy.net:46141/railway'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ────── Online Users ──────
online_users = {}

# ────── Models ──────
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(64), nullable=False)
    recipient = db.Column(db.String(64), nullable=False)
    message = db.Column(db.Text, nullable=False)
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
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered"}), 200

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    user = User.query.filter_by(username=username).first()
    if not user or user.password != password:
        return jsonify({"error": "Invalid credentials"}), 401
    return jsonify({"message": "Login successful"}), 200

@app.route("/send", methods=["POST"])
def send_message():
    data = request.json
    sender = data["sender"]
    recipient = data["recipient"]
    message = data["message"]
    if not User.query.filter_by(username=recipient).first():
        return jsonify({"status": "error", "message": "Recipient does not exist."}), 400
    new_msg = Message(sender=sender, recipient=recipient, message=message)
    db.session.add(new_msg)
    db.session.commit()
    return jsonify({"status": "success"})

@app.route("/chat/<user1>/<user2>", methods=["GET"])
def chat_between_users(user1, user2):
    messages = Message.query.filter(
        ((Message.sender == user1) & (Message.recipient == user2)) |
        ((Message.sender == user2) & (Message.recipient == user1))
    ).order_by(Message.timestamp).all()
    return jsonify([
        {
            "sender": m.sender,
            "recipient": m.recipient,
            "message": m.message,
            "timestamp": m.timestamp.isoformat()
        }
        for m in messages
    ])

@app.route("/inbox/<username>", methods=["GET"])
def inbox(username):
    messages = Message.query.filter_by(recipient=username).order_by(Message.timestamp).all()
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
    user = User.query.filter(db.func.lower(User.username) == username.lower()).first()
    if user:
        return jsonify({"exists": True, "username": user.username})
    else:
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
    return jsonify(list(contacts))

@app.route("/")
def home():
    return "SocketIO Server Running"

# ────── SocketIO Events ──────
@socketio.on("connect")
def handle_connect():
    pass

@socketio.on("user_connected")
def handle_user_connected(data):
    username = data.get("username")
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

# ────── Init Tables ──────
with app.app_context():
    db.create_all()

# ────── Run ──────
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
