import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { encryptMessage, decryptMessage } from "../crypto/aead"; // adjust if your path differs

function ChatWindow({ username, recipient }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [counter, setCounter] = useState(1); // simple per-session counter (anti-replay hint)
  const chatEndRef = useRef(null);
  const passphrase = "my-secret"; // TEMP for migration; don't hardcode in production

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
      hour12: true
    });
    if (isToday) return `Today at ${timeString}`;
    if (isYesterday) return `Yesterday at ${timeString}`;
    const datePart = date.toLocaleDateString([], { month: "short", day: "numeric" });
    return `${datePart} at ${timeString}`;
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://secure-messenger-backend.onrender.com/chat/${username}/${recipient}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  }, [username, recipient]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    // Header gets bound as AAD (authenticated metadata)
    const header = { v: 1, sender: username, recipient, ts: Date.now(), c: counter };

    const encryptedRecord = await encryptMessage(passphrase, newMessage, header);

    const localMsg = {
      sender: username,
      recipient,
      message: JSON.stringify(encryptedRecord),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, localMsg]);
    setNewMessage("");
    setCounter((c) => c + 1);

    try {
      await axios.post("https://secure-messenger-backend.onrender.com/send", {
        sender: username,
        recipient,
        message: JSON.stringify(encryptedRecord)
      });
      fetchMessages();
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  function AsyncDecrypt({ raw }) {
    const [text, setText] = useState("…");
    useEffect(() => {
      (async () => {
        try {
          const rec = JSON.parse(raw);
          setText(await decryptMessage(passphrase, rec));
        } catch {
          setText("(invalid message)");
        }
      })();
    }, [raw]);
    return <>{text}</>;
  }

  return (
    <div className="h-full max-h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-black">
        {messages.map((msg, idx) => {
          const isMine = msg.sender === username;
          return (
            <div key={idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${isMine ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"}`}>
                <div className="text-sm">
                  <AsyncDecrypt raw={msg.message} />
                </div>
                <div className="text-xs text-gray-300 mt-1 text-right">
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-950">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message…"
            className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
