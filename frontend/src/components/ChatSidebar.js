import React, { useEffect, useState } from "react";
import axios from "axios";

function ChatSidebar({ username, onSelectUser, selectedUser, onlineUsers }) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    // Load chat contacts
    axios
      .get(`https://secure-messenger-backend.onrender.com/contacts/${username}`)
      .then((res) => setContacts(res.data))
      .catch((err) => console.error("Failed to fetch contacts", err));
  }, [username]);

  const handleStartNewChat = () => {
    const newUser = prompt("Enter username to start a chat with:");
    if (!newUser || newUser.trim() === "") return;

    const cleaned = newUser.trim();
    if (!contacts.includes(cleaned)) {
      setContacts((prev) => [...prev, cleaned]);
    }

    onSelectUser(cleaned); // open chat immediately
  };

  return (
    <div className="bg-gray-900 text-white h-screen w-64 p-4 overflow-y-auto border-r border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Chats</h2>
        <button
          onClick={handleStartNewChat}
          title="Start new chat"
          className="bg-gray-700 hover:bg-gray-600 text-white text-lg w-8 h-8 rounded-full flex items-center justify-center"
        >
          +
        </button>
      </div>
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
