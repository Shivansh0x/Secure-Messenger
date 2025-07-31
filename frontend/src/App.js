import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import LogoutButton from "./components/LogoutButton";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";

function App() {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [selectedUser, setSelectedUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername(null);
    setSelectedUser(null);
  };

  return (
    <div className="h-screen bg-gray-950 text-white font-sans">
      <h1 className="text-2xl font-bold p-4 bg-gray-800 border-b border-gray-700">
        Secure Messenger
      </h1>

      {username ? (
        <div className="flex h-full">
          {/* Sidebar */}
          <ChatSidebar
            username={username}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
          />

          {/* Chat Window Placeholder */}
          <div className="flex-1 flex flex-col justify-between p-6">
            {selectedUser ? (
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Chat with {selectedUser}
                </h2>
                {/* Later: <ChatWindow ... /> */}
                <ChatWindow username={username} recipient={selectedUser} />
              </div>
            ) : (
              <p className="text-gray-400">Select a user from the sidebar to start chatting.</p>
            )}
            <div className="mt-auto">
              <LogoutButton onLogout={handleLogout} />
            </div>
          </div>
        </div>
      ) : (
        <LoginForm onLogin={setUsername} />
      )}
    </div>
  );
}

export default App;
