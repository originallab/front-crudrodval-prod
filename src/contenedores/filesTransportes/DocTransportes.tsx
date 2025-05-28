import { useState } from 'react';
import DocTransportesForm from './DocTransportesForm';
import './../DatosBasicos.css'; // Importa los estilos

export default function DocTransportes() {
  const [activeTab, setActiveTab] = useState('docTransportesForm'); // Estado para la pestaña activa

  return (
    <div className="container">
      <div className="card">
        <div className="p-6">
        <div className="p-6"></div>
          {/* Pestañas */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'docTransportesForm' ? 'active' : ''}`}
              onClick={() => setActiveTab('docTransportesForm')}
            >
             Archivos de Transportes
            </button>
          </div>
          
          {/* Contenido del formulario */}
          <div className="form-container">
            {activeTab === 'docTransportesForm' && <DocTransportesForm />}
          </div>
        </div>
      </div>
    </div>
  );
}