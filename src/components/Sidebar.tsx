import React, { useState } from 'react';
import './Sidebar.css';

interface MenuItem {
  title: string;
  id: string;
  subMenu: { title: string; id: string }[];
}

interface SidebarProps {
  isOpen: boolean;
  menuItems: MenuItem[];
  onClose: () => void;
  onItemClick: (pageId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, menuItems, onClose, onItemClick }) => {
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  
  const toggleSubMenu = (title: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };
  
  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    onItemClick(id);
  };
  
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <nav className="sidebar-nav">
          <ul className="menu">
            {menuItems.map((item, index) => (
              <li key={index} className="menu-item">
                {item.subMenu.length > 0 ? (
                  <>
                    <a 
                      href="#" 
                      className="menu-link has-submenu"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSubMenu(item.title);
                      }}
                    >
                      {item.title}
                      <span className={`submenu-arrow ${expandedMenus[item.title] ? 'expanded' : ''}`}>▼</span>
                    </a>
                    <ul className={`submenu ${expandedMenus[item.title] ? 'expanded' : ''}`}>
                      {item.subMenu.map((subItem, subIndex) => (
                        <li key={subIndex} className="submenu-item">
                          <a 
                            href="#" 
                            className="submenu-link"
                            onClick={(e) => handleItemClick(e, subItem.id)}
                          >
                            {subItem.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <a 
                    href="#" 
                    className="menu-link"
                    onClick={(e) => handleItemClick(e, item.id)}
                  >
                    {item.title}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;