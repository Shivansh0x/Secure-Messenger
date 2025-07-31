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
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md w-96 max-w-full">
        <h2 className="text-3xl font-semibold text-center text-white mb-6 tracking-wide">{isLoginMode ? "Login" : "Register"}</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        /><br />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition duration-300 font-medium"
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
