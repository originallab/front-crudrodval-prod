import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './App.css';

// Importa tus componentes CRUD
// import Servicio1 from './pages/Servicio1';
// import Servicio2 from './pages/Servicio2';
// etc.

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('inicio');
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const handlePageChange = (pageId: string) => {
    setCurrentPage(pageId);
    closeSidebar();
  };
  
  // Estructura del menú con submenús
  const menuItems = [
    {
      title: 'Inicio',
      id: 'inicio',
      subMenu: []
    },
    {
      title: 'Servicios',
      id: 'servicios',
      subMenu: [
        { title: 'Servicio 1', id: 'servicio1' },
        { title: 'Servicio 2', id: 'servicio2' },
        { title: 'Servicio 3', id: 'servicio3' },
      ]
    },
    {
      title: 'Productos',
      id: 'productos',
      subMenu: [
        { title: 'Producto 1', id: 'producto1' },
        { title: 'Producto 2', id: 'producto2' },
      ]
    },
    {
      title: 'Contacto',
      id: 'contacto',
      subMenu: []
    }
  ];
  
  // Función para renderizar el componente actual basado en currentPage
  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'inicio':
        return <div className="page-content"><h2>Página de Inicio</h2></div>;
      case 'servicio1':
        // return <Servicio1 />;
        return <div className="page-content"><h2>Componente de Servicio 1</h2></div>;
      case 'servicio2':
        // return <Servicio2 />;
        return <div className="page-content"><h2>Componente de Servicio 2</h2></div>;
      case 'servicio3':
        // return <Servicio3 />;
        return <div className="page-content"><h2>Componente de Servicio 3</h2></div>;
      case 'producto1':
        // return <Producto1 />;
        return <div className="page-content"><h2>Componente de Producto 1</h2></div>;
      case 'producto2':
        // return <Producto2 />;
        return <div className="page-content"><h2>Componente de Producto 2</h2></div>;
      case 'contacto':
        // return <Contacto />;
        return <div className="page-content"><h2>Página de Contacto</h2></div>;
      default:
        return <div className="page-content"><h2>Página de Inicio</h2></div>;
    }
  };
  
  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <Header 
        title="Mi Aplicación" 
        toggleSidebar={toggleSidebar} 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <Sidebar 
        isOpen={sidebarOpen} 
        menuItems={menuItems} 
        onClose={closeSidebar} 
        onItemClick={handlePageChange} 
      />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;