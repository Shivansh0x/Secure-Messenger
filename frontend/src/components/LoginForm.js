import React, { useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
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
    <div className="max-w-sm mx-auto mt-10 p-6 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
      <h2>{isLoginMode ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full bg-gray-800 text-white placeholder-gray-400 p-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-gray-800 text-white placeholder-gray-400 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        /><br />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow-md transition"
        >
          {isLoginMode ? "Login" : "Register"}
        </button>
      </form>
      <button
        onClick={toggleMode}
        className="mt-4 text-sm text-blue-400 hover:text-blue-200 transition"
      >
        {isLoginMode
          ? "Don't have an account? Register"
          : "Already have an account? Login"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default LoginForm;
