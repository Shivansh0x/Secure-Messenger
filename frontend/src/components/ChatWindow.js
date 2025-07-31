import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";

function ChatWindow({ username, recipient }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);
  const secretKey = "my-secret";

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [username, recipient]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const decrypt = (text) => {
    try {
      const bytes = CryptoJS.AES.decrypt(text, secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return "(decryption failed)";
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const encrypted = CryptoJS.AES.encrypt(newMessage, secretKey).toString();
    try {
      await axios.post("https://secure-messenger-backend.onrender.com/send", {
        sender: username,
        recipient,
        message: encrypted,
      });
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-4 mb-2">
        {messages.map((msg, idx) => {
          const isMine = msg.sender === username;
          return (
            <div
              key={idx}
              className={`flex ${
                isMine ? "justify-end" : "justify-start"
              } px-2`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  isMine
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-100"
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
        <div ref={chatEndRef}></div>
      </div>

      {/* Fixed Message Input */}
      <div className="sticky bottom-0 bg-gray-950 pt-2">
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg shadow transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
