import React, { useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://secure-messenger-backend.onrender.com");

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async () => {
    if (!username) {
      alert("Username is required");
      return;
    }

    const endpoint = isRegister ? "/register" : "/login";

    try {
      await axios.post(`https://secure-messenger-backend.onrender.com${endpoint}`, {
        username,
      });
      localStorage.setItem("username", username);
      onLogin(username);
      
      // ✅ Emit login to backend socket server
      socket.emit("login", username);
    } catch (err) {
      alert("Login/Register failed");
    }
  };

  return (
    <div>
      <h3>{isRegister ? "Register" : "Login"}</h3>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleSubmit}>{isRegister ? "Register" : "Login"}</button>
      <br />
      <button onClick={() => setIsRegister(!isRegister)}>
        Switch to {isRegister ? "Login" : "Register"}
      </button>
    </div>
  );
}

export default LoginForm;
