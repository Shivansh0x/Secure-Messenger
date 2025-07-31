import React, { useState } from "react";
import axios from "axios";
import {io} from "socket.io-client";
const socket = io("https://secure-messenger-backend.onrender.com"); // your backend URL

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true); // toggle between login and register

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? "/login" : "/register";

    axios.post(`https://secure-messenger-backend.onrender.com${endpoint}`, {
      username,
      password,
    })
      .then((response) => {
        localStorage.setItem("username", username);
        onLogin(username);
        socket.emit("login", username);
      })
      .catch((error) => {
        console.error(`${isLoginMode ? "Login" : "Registration"} failed:`, error);
        setError(
          isLoginMode
            ? "Login failed. Please check your credentials."
            : "Registration failed. Username may already exist."
        );
      });
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(""); // clear any previous error
  };

  return (
    <div>
      <h2>{isLoginMode ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">{isLoginMode ? "Login" : "Register"}</button>
      </form>
      <button onClick={toggleMode} style={{ marginTop: "10px" }}>
        {isLoginMode
          ? "Don't have an account? Register"
          : "Already have an account? Login"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default LoginForm;
