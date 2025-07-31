import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import { io } from "socket.io-client";

const socket = io("https://secure-messenger-backend.onrender.com");

function ChatWindow({ username, recipient }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);
  const secretKey = "my-secret";

  // Load old messages and scroll
  useEffect(() => {
    fetchMessages();
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [username, recipient]);

  // Scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket receive
  useEffect(() => {
    const handleIncoming = (msg) => {
      const isRelevant =
        (msg.sender === recipient && msg.recipient === username) ||
        (msg.sender === username && msg.recipient === recipient);

      if (isRelevant) {
        setMessages((prev) => [...prev, msg]);

        // Show browser notification if not from me
        if (msg.sender !== username && Notification.permission === "granted") {
          const decrypted = decrypt(msg.message);
          new Notification(`Message from ${msg.sender}`, {
            body: decrypted,
          });
        }
      }
    };

    socket.on("receive_message", handleIncoming);

    return () => socket.off("receive_message", handleIncoming);
  }, [username, recipient]);

  // Ask for notification permission once
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const decrypt = (text) => {
    try {
      const bytes = CryptoJS.AES.decrypt(text, secretKey);
      return bytes.toString(CryptoJS.enc.Utf8) || "(invalid)";
    } catch {
      return "(decryption error)";
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `https://secure-messenger-backend.onrender.com/chat/${username}/${recipient}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const encrypted = CryptoJS.AES.encrypt(newMessage, secretKey).toString();
    const payload = {
      sender: username,
      recipient,
      message: encrypted,
    };

    try {
      await axios.post("https://secure-messenger-backend.onrender.com/send", payload);
      socket.emit("receive_message", { ...payload, timestamp: new Date().toISOString() }); // notify recipient
      setMessages((prev) => [...prev, { ...payload, timestamp: new Date() }]);
      setNewMessage("");
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => {
          const isMine = msg.sender === username;
          return (
            <div key={idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  isMine ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
                }`}
              >
                <div className="text-sm">{decrypt(msg.message)}</div>
                <div className="text-xs text-gray-300 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-gray-700 p-3 bg-gray-950">
        <div className="flex">
          <input
            type="text"
            className="flex-1 bg-gray-800 text-white p-2 rounded-l-lg border border-gray-600 focus:outline-none"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
