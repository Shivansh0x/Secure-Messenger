import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import LogoutButton from "./components/LogoutButton";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import { io } from "socket.io-client";

const socket = io("https://secure-messenger-backend.onrender.com");

function App() {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Notify backend of online user
  useEffect(() => {
    // Always listen to updates — even before login
    socket.on("update_online_users", (data) => {
      setOnlineUsers(data);
    });

    if (username) {
      socket.emit("user_connected", { username });
    }

    return () => {
      socket.disconnect();
    };
  }, [username]);


  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername(null);
    setSelectedUser(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white font-sans">
      <h1 className="text-2xl font-bold p-4 bg-gray-800 border-b border-gray-700">
        Secure Messenger
      </h1>

      {username ? (
        <div className="flex flex-1 overflow-hidden">
          <ChatSidebar
            username={username}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
            onlineUsers={onlineUsers}
          />

          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                <div className="px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    Chat with {selectedUser}
                  </h2>
                  <span
                    className={`h-3 w-3 rounded-full ${onlineUsers.includes(selectedUser)
                      ? "bg-green-400"
                      : "bg-gray-500"
                      }`}
                  ></span>
                </div>
                <ChatWindow username={username} recipient={selectedUser} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a user from the sidebar to start chatting.
              </div>
            )}
          </div>
        </div>
      ) : (
        <LoginForm onLogin={setUsername} />
      )}
    </div>

  );
}

export default App;
