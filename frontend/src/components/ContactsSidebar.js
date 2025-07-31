import React, { useEffect, useState } from "react";
import axios from "axios";

function ContactsSidebar({ username }) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get(`https://secure-messenger-backend.onrender.com/inbox/${username}`);
        const uniqueSenders = [...new Set(res.data.map(msg => msg.sender))];

        // Remove current user from their own list
        const filtered = uniqueSenders.filter(user => user !== username);

        // Fake online status randomly
        const enrichedContacts = filtered.map(name => ({
          name,
          isOnline: Math.random() > 0.5 // randomly online/offline
        }));

        setContacts(enrichedContacts);
      } catch (err) {
        console.error("Failed to load contacts", err);
      }
    };

    fetchContacts();

    const interval = setInterval(fetchContacts, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [username]);

  return (
    <div style={{
      position: "fixed",
      right: 0,
      top: 0,
      height: "100vh",
      width: "200px",
      background: "#f5f5f5",
      borderLeft: "1px solid #ccc",
      padding: "10px",
      overflowY: "auto"
    }}>
      <h4>Contacts</h4>
      <ul>
        {contacts.map((contact, index) => (
          <li key={index} style={{ marginBottom: "10px" }}>
            {contact.name}{" "}
            <span style={{
              color: contact.isOnline ? "green" : "gray",
              fontWeight: "bold"
            }}>
              ●
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContactsSidebar;
