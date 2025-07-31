import React, { useState } from "react";
import axios from "axios";
import socket from "../socket";

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? "/login" : "/register";

    axios
      .post(`https://secure-messenger-backend.onrender.com${endpoint}`, {
        username,
        password,
      })
      .then((response) => {
        localStorage.setItem("username", username);
        onLogin(username);
        socket.emit("login", username);
      })
      .catch((error) => {
        console.error(
          `${isLoginMode ? "Login" : "Registration"} failed:`,
          error
        );
        setError(
          isLoginMode
            ? "Login failed. Please check your credentials."
            : "Registration failed. Username may already exist."
        );
      });
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError("");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-md w-96 max-w-full"
      >
        <h2 className="text-3xl font-semibold text-center text-white mb-6 tracking-wide">
          {isLoginMode ? "Secure Messenger Login" : "Create an Account"}
        </h2>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 mb-4 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 mb-4 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition duration-300 font-medium"
        >
          {isLoginMode ? "Login" : "Register"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-300">
          {isLoginMode ? "New here?" : "Already have an account?"}{" "}
          <span
            onClick={toggleMode}
            className="text-blue-400 hover:underline cursor-pointer"
          >
            {isLoginMode ? "Register" : "Login"}
          </span>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
