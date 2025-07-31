import React, { useState } from "react";
import MessageForm from "./components/MessageForm";
import Inbox from "./components/Inbox";
import LogoutButton from "./components/LogoutButton";
import LoginForm from "./components/LoginForm";

function App() {
  // get stored user from browser
  const [username, setUsername] = useState(localStorage.getItem("username"));

  // logout = clear username
  const handleLogout = () => {
    setUsername(null); // stop showing inbox
  };



  return (
    <div>
      <h1>Secure Messenger</h1>

      {username ? (
        <>
          <p>Welcome, {username}!</p>
          <MessageForm sender={username} />
          <Inbox username={username} />
          <LogoutButton onLogout={handleLogout} />
        </>
      ) : (
        <LoginForm onLogin={setUsername} />
      )}
    </div>
  );
}

export default App;
