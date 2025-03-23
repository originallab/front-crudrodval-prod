import React from 'react';
import './Header.css';

interface HeaderProps {
  title: string;
  toggleSidebar: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, toggleSidebar, darkMode, toggleDarkMode }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="empty-space"></div>
        <h1 className="title">{title}</h1>
        <div className="header-buttons">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="hamburger-button" onClick={toggleSidebar}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;