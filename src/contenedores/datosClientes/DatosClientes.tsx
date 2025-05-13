import { useState } from 'react';
import DatosClientesForm from './DatosClientesForm';
import './../DatosBasicos.css'; // Importa los estilos

export default function DatosClientes() {
  const [activeTab, setActiveTab] = useState('datosClientesForm'); // Estado para la pestaña activa

  return (
    <div className="container">
      <div className="card">
        <div className="p-6">
        <h1 className="title"></h1>
          {/* Pestañas */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'datosClientesForm' ? 'active' : ''}`}
              onClick={() => setActiveTab('datosClientesForm')}
            >
              Datos Clientes
            </button>
          </div>
          
          {/* Contenido del formulario */}
          <div className="form-container">
            {activeTab === 'datosClientesForm' && <DatosClientesForm />}
          </div>
        </div>
      </div>
    </div>
  );
}