import React, { useEffect, useState } from "react";
import axios from "axios";
import LogoutButton from "./LogoutButton";

function ChatSidebar({ username, onSelectUser, selectedUser, onlineUsers }) {
  const [contacts, setContacts] = useState([]);

  // 🔄 Fetch chat contacts on login or username change
  useEffect(() => {
    if (!username) return;
    axios
      .get(`https://secure-messenger-backend.onrender.com/contacts/${username}`)
      .then((res) => setContacts(res.data))
      .catch((err) => console.error("Failed to fetch contacts", err));
  }, [username]);

  // ➕ Start a new chat with a valid user
  const handleStartNewChat = async () => {
    const newUser = prompt("Enter username to start a chat with:");
    if (!newUser || newUser.trim() === "" || newUser.trim() === username) return;

    const cleaned = newUser.trim();

    try {
      const res = await axios.get(`https://secure-messenger-backend.onrender.com/users/${cleaned}`);

      if (res.status === 200) {
        if (!contacts.includes(cleaned)) {
          setContacts((prev) => [...prev, cleaned]);
        }
        onSelectUser(cleaned); // open chat
      }
    } catch (err) {
      alert("User does not exist.");
    }
  };

  return (
    <div className="flex flex-col h-full w-64 bg-gray-900 text-white border-r border-gray-700">
      {/* 🔝 Top Header + New Chat Button */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <h2 className="text-xl font-bold">Chats</h2>
        <button
          onClick={handleStartNewChat}
          title="Start new chat"
          className="bg-gray-700 hover:bg-gray-600 text-white text-lg w-8 h-8 rounded-full flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* 📜 Scrollable Contact List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {contacts.map((user) => (
          <li
            key={user}
            onClick={() => onSelectUser(user)}
            className={`list-none flex items-center justify-between px-3 py-2 rounded-md cursor-pointer
              ${user === selectedUser ? "bg-gray-700" : "hover:bg-gray-800"}`}
          >
            <span className="truncate">{user}</span>
            <span
              className={`h-3 w-3 rounded-full ${
                onlineUsers.includes(user) ? "bg-green-400" : "bg-gray-500"
              }`}
            ></span>
          </li>
        ))}
      </div>

      {/* ⬇️ Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <LogoutButton
          onLogout={() => {
            localStorage.removeItem("username");
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}

export default ChatSidebar;
