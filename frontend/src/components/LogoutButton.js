import React from "react";

function LogoutButton({ onLogout }) {
  const handleLogout = () => {
    localStorage.removeItem("username"); // clear the stored login info
    onLogout(); // tell the app we logged out
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;
