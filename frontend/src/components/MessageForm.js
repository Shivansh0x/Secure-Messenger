import React, { useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";

function MessageForm({ sender }) {
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    // 🔒 Check for empty input
    if (!recipient.trim() || !message.trim()) {
      alert("Please enter both a recipient and a message.");
      return;
    }

    const secretKey = "my-secret"; // Shared encryption key (same as in Inbox)
    const encryptedMessage = CryptoJS.AES.encrypt(message, secretKey).toString();

    try {
      const payload = {
        sender,
        recipient,
        message: encryptedMessage,
      };
      await axios.post("https://secure-messenger-backend.onrender.com/send", payload);
      alert("Message sent!");
      setMessage("");
      setRecipient("");
    } catch (err) {
      console.error("Failed to send message:", err);
      if (err.response?.data?.message) {
        alert("Error: " + err.response.data.message);
      } else {
        alert("Failed to send message.");
      }
    }
  };

  return (
    <div>
      <h3>Send Message</h3>
      <input
        placeholder="Recipient"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <br />
      <textarea
        placeholder="Enter your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <br />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default MessageForm;
