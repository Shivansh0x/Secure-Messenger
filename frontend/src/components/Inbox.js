import React, { useEffect, useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";

function Inbox({ username }) {
  const [messages, setMessages] = useState([]);

  const secretKey = "my-secret"; // Must match encryption key used in MessageForm

  const decrypt = (encryptedText) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || "(empty)";
    } catch (err) {
      return "(decryption failed)";
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  useEffect(() => {
    async function fetchInbox() {
      try {
        const response = await axios.get(`https://secure-messenger-backend.onrender.com/inbox/${username}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch inbox:", error);
      }
    }
    fetchInbox();
  }, [username]);

  return (
    <div>
      <h2>Inbox</h2>
      {messages.length === 0 ? (
        <p>No messages.</p>
      ) : (
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>From:</strong> {msg.sender} <br />
              <strong>Time:</strong> {formatDate(msg.timestamp)} <br />
              <strong>Decrypted:</strong> {decrypt(msg.message)} <br /><br />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Inbox;
