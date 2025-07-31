import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("https://secure-messenger-backend.onrender.com");

function ChatSidebar({ username, onSelectUser, selectedUser }) {
  const [contacts, setContacts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Notify server this user is online
    socket.emit("user_connected", { username });

    // Listen for updates
    socket.on("update_online_users", (data) => {
      setOnlineUsers(data);
    });

    // Load chat contacts
    axios
      .get(`https://secure-messenger-backend.onrender.com/contacts/${username}`)
      .then((res) => setContacts(res.data))
      .catch((err) => console.error("Failed to fetch contacts", err));

    return () => {
      socket.disconnect();
    };
  }, [username]);

  return (
    <div className="bg-gray-900 text-white h-screen w-64 p-4 overflow-y-auto border-r border-gray-700">
      <h2 className="text-xl font-bold mb-4">Chats</h2>
      <ul className="space-y-2">
        {contacts.map((user, idx) => (
          <li
            key={idx}
            onClick={() => onSelectUser(user)}
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer
              ${user === selectedUser ? "bg-gray-700" : "hover:bg-gray-800"}`}
          >
            <span>{user}</span>
            <span
              className={`h-3 w-3 rounded-full ${
                onlineUsers.includes(user) ? "bg-green-400" : "bg-gray-500"
              }`}
            ></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatSidebar;
