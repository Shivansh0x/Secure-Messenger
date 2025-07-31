import React, { useState } from "react";
import MessageForm from "./components/MessageForm";
import Inbox from "./components/Inbox";
import LogoutButton from "./components/LogoutButton";
import LoginForm from "./components/LoginForm";
import OnlineUsersSidebar from "./components/OnlineUsersSidebar";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

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
      <h1 className="text-4xl font-bold text-green-400 underline">
  Tailwind Works!
</h1>


      {username ? (
        <>
          <p>Welcome, {username}!</p>
          <MessageForm sender={username} />
          <Inbox username={username} />
          <LogoutButton onLogout={handleLogout} />
          <OnlineUsersSidebar username={username} />
        </>
      ) : (
        <LoginForm onLogin={setUsername} />
      )}
    </div>
  );
}

export default App;
