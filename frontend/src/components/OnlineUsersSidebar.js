import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://secure-messenger-backend.onrender.com"); // or your render backend URL

function OnlineUsersSidebar({ username }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

useEffect(() => {
  if (!username) return;

  socket.emit("user_connected", { username });

  const handleOnlineUsers = (users) => {
    setOnlineUsers(users);
  };

  socket.on("online_users", handleOnlineUsers);

  return () => {
    socket.off("online_users", handleOnlineUsers);
  };
}, [username]);


  return (
    <div style={{ position: "fixed", right: 10, top: 60, width: 200, background: "#eee", padding: 10 }}>
      <h4>Online Contacts</h4>
      <ul>
        {onlineUsers
          .filter(user => user !== username)
          .map((user, idx) => (
            <li key={idx}>🟢 {user}</li>
          ))}
      </ul>

    </div>
  );
}

export default OnlineUsersSidebar;
