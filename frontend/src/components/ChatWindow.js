import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import { API_BASE_URL } from "../config";

function ChatWindow({ username, recipient }) {
  const [messages, setMessages] = useState([]);           
  const [pending, setPending] = useState([]);             
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);
  const secretKey = "my-secret";

  const decryptCacheRef = useRef(new Map());
  const decrypt = (text) => {
    const cache = decryptCacheRef.current;
    if (cache.has(text)) return cache.get(text);
    let out;
    try {
      const bytes = CryptoJS.AES.decrypt(text, secretKey);
      out = bytes.toString(CryptoJS.enc.Utf8) || "(decryption failed)";
    } catch {
      out = "(decryption failed)";
    }
    cache.set(text, out);
    return out;
  };

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeString = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: undefined,
    });

    if (isToday) {
      return `Today at ${timeString}`;
    } else if (isYesterday) {
      return `Yesterday at ${timeString}`;
    } else {
      const datePart = date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        timeZone: undefined,
      });
      return `${datePart} at ${timeString}`;
    }
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/chat/${username}/${recipient}`
      );
      const serverMessages = res.data;

      setPending((oldPending) =>
        oldPending.filter(
          (p) => !serverMessages.some((s) => s.message === p.message)
        )
      );

      setMessages(serverMessages);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  }, [username, recipient]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const combined = [...messages, ...pending];
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [combined.length]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const encrypted = CryptoJS.AES.encrypt(newMessage, secretKey).toString();

    const localMsg = {
      sender: username,
      recipient,
      message: encrypted,
      timestamp: new Date().toISOString(),
    };
    decryptCacheRef.current.set(encrypted, newMessage);
    setPending((prev) => [...prev, localMsg]);

    setNewMessage("");

    try {
      await axios.post(`${API_BASE_URL}/send`, {
        sender: username,
        recipient,
        message: encrypted,
      });
    } catch (err) {
      console.error("Send failed:", err);
      setPending((prev) => prev.filter((p) => p.message !== encrypted));
    }
  };

  return (
    <div className="h-full max-h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-black">
        {combined.map((msg, idx) => {
          const isMine = msg.sender === username;
          return (
            <div
              key={`${msg.message}-${idx}`} 
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  isMine ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
                }`}
              >
                <div className="text-sm">{decrypt(msg.message)}</div>
                <div className="text-xs text-gray-300 mt-1 text-right">
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="shrink-0 border-t border-gray-700 p-3 bg-gray-950">
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
