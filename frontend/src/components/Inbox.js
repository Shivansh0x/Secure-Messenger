import React, { useEffect, useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";

function Inbox({ username }) {
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/inbox/${username}`);
      const secretKey = "my-secret"; // same key used in MessageForm

      const decryptedMessages = response.data.map((msg) => ({
        ...msg,
        decrypted: CryptoJS.AES.decrypt(msg.message, secretKey).toString(CryptoJS.enc.Utf8),
      }));

      setMessages(decryptedMessages);
    } catch (err) {
      console.error("Failed to fetch inbox:", err);
    }
  };

  // Set up polling
  useEffect(() => {
    fetchMessages(); // load once on mount

    const interval = setInterval(fetchMessages, 5000); // every 5 seconds

    return () => clearInterval(interval); // clean up when component unmounts
  }, [username]);

  return (
    <div>
      <h3>Inbox</h3>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>From:</strong> {msg.sender} <br />
              <strong>Decrypted Message:</strong> {msg.decrypted} <br />
              <strong>Time:</strong> {msg.timestamp}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Inbox;
