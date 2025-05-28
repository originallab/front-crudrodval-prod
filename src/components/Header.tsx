import React from "react";
import "./Header.css";
import iconoRodval from "../assets/images/iconoRodval.svg";
import LogoutIcon from "@mui/icons-material/Logout";

interface HeaderProps {
  title: string;
  toggleSidebar: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  logoImage?: string;
  style?: React.CSSProperties;
}

const Header: React.FC<HeaderProps> = ({
  title,
  toggleSidebar,
  darkMode,
  toggleDarkMode,
  onLogout,
  logoImage,
  style,
}) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <button className="menu-button" onClick={toggleSidebar}>
          ☰
        </button>
        <div className="header-title-container">
        </div>
        <h1 className="header-title-text">Sistema de logistica RODVAL</h1>
        <div className="header-controls">
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button
            className="logout-button"
            onClick={onLogout}
            title="Cerrar sesión"
          >
            
            <LogoutIcon sx={{ fontSize: 30 }} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
