import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("https://secure-messenger-backend.onrender.com"); // your backend URL

function OnlineUsersSidebar({ username }) {
  const [contacts, setContacts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Notify backend user is online
    socket.emit("user_connected", { username });

    // Listen for updates
    socket.on("update_online_users", (data) => {
      setOnlineUsers(data);
    });

    // Fetch actual contacts from backend
    axios
      .get(`https://secure-messenger-backend.onrender.com/contacts/${username}`)
      .then((res) => setContacts(res.data))
      .catch((err) => console.error("Failed to fetch contacts", err));

    return () => {
      socket.disconnect();
    };
  }, [username]);

  return (
    <div style={{ position: "absolute", right: 0, top: 100, width: 200, padding: 10, backgroundColor: "#f0f0f0" }}>
      <h4>Contacts</h4>
      <ul>
        {contacts.map((user, idx) => (
          <li key={idx}>
            {user}{" "}
            <span
              style={{
                height: 10,
                width: 10,
                backgroundColor: onlineUsers.includes(user) ? "green" : "gray",
                borderRadius: "50%",
                display: "inline-block",
                marginLeft: 5,
              }}
            ></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OnlineUsersSidebar;
