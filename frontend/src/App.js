// App.js – Updated with browser notification when a message is received
import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import MessageForm from "./MessageForm";
import Inbox from "./Inbox";
import ChatSidebar from "./ChatSidebar";
import { io } from "socket.io-client";

const socket = io("https://secure-messenger-backend.onrender.com");

function App() {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (username) {
      socket.emit("user_connected", { username });

      // Request browser notification permission
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  }, [username]);

  useEffect(() => {
    socket.on("update_online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);

      // Show browser notification for new message
      if (
        "Notification" in window &&
        Notification.permission === "granted" &&
        data.sender !== username
      ) {
        new Notification(`New message from ${data.sender}`, {
          body: data.message,
          icon: "/chat-icon.png", // Optional icon
        });

        // Optional: Play notification sound
        const notificationSound = new Audio("/notification.mp3");
        notificationSound.play();
      }
    });

    return () => {
      socket.off("update_online_users");
      socket.off("receive_message");
    };
  }, [username]);

  if (!username) {
    return <LoginForm onLogin={setUsername} />;
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar
        username={username}
        onSelectUser={setSelectedUser}
        selectedUser={selectedUser}
        onlineUsers={onlineUsers}
      />
      <div className="flex flex-col flex-1 bg-gray-800">
        <Inbox
          username={username}
          selectedUser={selectedUser}
          socket={socket}
          messages={messages}
          setMessages={setMessages}
        />
        <MessageForm
          username={username}
          selectedUser={selectedUser}
          socket={socket}
        />
      </div>
    </div>
  );
}

export default App;
