import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import { io } from "socket.io-client";
import CryptoJS from "crypto-js";

const socket = io("https://secure-messenger-backend.onrender.com");

const loadStoredContacts = (username) => {
  const data = localStorage.getItem(`contacts-${username}`);
  return data ? JSON.parse(data) : [];
};

const saveStoredContacts = (username, contacts) => {
  localStorage.setItem(`contacts-${username}`, JSON.stringify(contacts));
};

const secretKey = "my-secret"; // should match what's used in ChatWindow

const decrypt = (text) => {
  try {
    const bytes = CryptoJS.AES.decrypt(text, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "(decryption failed)";
  }
};


function App() {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [contacts, setContacts] = useState(() =>
    username ? loadStoredContacts(username) : []
  );


  // Notify backend of online user
  useEffect(() => {
    const handleOnlineUsersUpdate = (data) => {
      setOnlineUsers(data);
    };
    socket.on("update_online_users", handleOnlineUsersUpdate);

    socket.on("connect", () => {
      if (username) {
        socket.emit("user_connected", { username });
      }
    });

    if (username) {
      socket.emit("user_connected", { username });
    }

    return () => {
      socket.off("update_online_users", handleOnlineUsersUpdate);
      socket.off("connect");
    };
  }, [username]);

  useEffect(() => {
    if (username) {
      saveStoredContacts(username, contacts);
    }
  }, [contacts, username]);


  // Request browser notification permission on load
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Listen for incoming messages to show browser notification
  useEffect(() => {
    const handleIncomingMessage = (message) => {
      if (message.recipient === username && message.sender !== username) {
        const decryptedMessage = decrypt(message.message);

        // 🔔 Show notification with real message text
        if (Notification.permission === "granted") {
          new Notification(`Message from ${message.sender}`, {
            body: decryptedMessage,
          });
        }

        // 🟢 Add sender to contact list if new (already implemented)
        setContacts((prev) => {
          const existing = prev.map((u) => u.toLowerCase());
          if (!existing.includes(message.sender.toLowerCase())) {
            return [...prev, message.sender];
          }
          return prev;
        });
      }
    };



    socket.on("receive_message", handleIncomingMessage);

    return () => {
      socket.off("receive_message", handleIncomingMessage);
    };
  }, [username]);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white font-sans">
      {/* <h1 className="text-2xl font-bold p-4 bg-gray-800 border-b border-gray-700">
        Secure Messenger
      </h1> */}

      {username ? (
        <div style={{ display: "flex", height: "100vh" }}>
          <ChatSidebar
            username={username}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
            onlineUsers={onlineUsers}
            contacts={contacts}
            setContacts={setContacts}
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
        <LoginForm
          onLogin={(username) => {
            setUsername(username);
            setContacts(loadStoredContacts(username));
          }}
        />

      )}
    </div>
  );
}

export default App;