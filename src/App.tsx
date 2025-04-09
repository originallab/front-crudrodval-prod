import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './components/login/Login';
import iconoRodval from './imagenes/iconoRodval.svg';

import './App.css';

// Importa tus componentes CRUD
import DatosBasicos from './contenedores/DatosBasicos';
import DatosTransportes from './contenedores/datosTransportess/DatosTransportes';
import DatosClientes from './contenedores/datosClientes/DatosClientes';
import DocOperadores from './contenedores/filesOperadores/DocOperadores';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('inicio');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación
  
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

  // Función para manejar el login exitoso
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Función para manejar el logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('inicio');
  };
  
  // Estructura del menú con submenús
  const menuItems = [
    
    {
      title: 'Mantenedores',
      id: 'servicios',
      subMenu: [
        { title: 'Datos Basicos', id: 'DatosBasicos' },
        { title: 'Datos Clientes', id: 'DatosClientes' },
        { title: 'Datos Transportes', id: 'DatosTransportes' },
      ]
    },
    {
      title: 'Documentos',
      id: 'productos',
      subMenu: [
        { title: 'Documentos de operadores', id: 'DocOperadores' },
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
      case 'DatosBasicos':
        return <DatosBasicos />; 
      case 'DatosClientes':
        return <DatosClientes />;
      case 'DatosTransportes':
        return <DatosTransportes />;
      case 'DocOperadores':
        return <DocOperadores />;
      case 'producto2':
        return <div className="page-content"><h2>Componente de Producto 2</h2></div>;
      case 'contacto':
        return <div className="page-content"><h2>Página de Contacto</h2></div>;
      //default:
        //return <div className="page-content"><h2>Página de Inicio</h2></div>;
    }
  };
  
  // Si no está autenticado, mostrar solo el login
  if (!isAuthenticated) {
    return (
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }
  
  // Si está autenticado, mostrar la aplicación normal
  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <Header 
        title="" 
        toggleSidebar={toggleSidebar} 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        logoImage="./imagenes/iconoRodval.svg"
        
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