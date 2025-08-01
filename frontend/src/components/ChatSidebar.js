import React, { useEffect, useState } from "react";
import axios from "axios";
import LogoutButton from "./LogoutButton";

function ChatSidebar({ username, onSelectUser, selectedUser, onlineUsers }) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (!username) return;
    axios
      .get(`https://secure-messenger-backend.onrender.com/contacts/${username}`)
      .then((res) => setContacts(res.data))
      .catch((err) => console.error("Failed to fetch contacts", err));
  }, [username]);

  const handleStartNewChat = async () => {
    const newUser = prompt("Enter username to start a chat with:");
    if (
      !newUser ||
      newUser.trim() === "" ||
      newUser.trim().toLowerCase() === username.toLowerCase() // ✅ case-insensitive
    )
      return;

    const cleaned = newUser.trim();

    try {
      const res = await axios.get(
        `https://secure-messenger-backend.onrender.com/users/${cleaned}`
      );

      if (res.status === 200) {
        if (!contacts.includes(cleaned)) {
          setContacts((prev) => [...prev, cleaned]);
        }
        onSelectUser(cleaned);
      }
    } catch (err) {
      alert("User does not exist.");
    }
  };


  return (
    <div
      style={{
        width: "250px",
        display: "flex",
        flexDirection: "column",
        height: "100vh", // full height
        borderRight: "1px solid #ccc",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* 🔝 Header */}
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

      {/* 📜 Contact List */}
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
              className={`h-3 w-3 rounded-full ${onlineUsers.includes(user) ? "bg-green-400" : "bg-gray-500"}`}
            ></span>
          </li>
        ))}
      </div>

      {/* ⬇️ Logout */}
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
