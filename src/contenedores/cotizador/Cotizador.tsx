import { useState } from 'react';
import CotizadorForm from './CotizadorForm';
import './../DatosBasicos.css'; // Importa los estilos

export default function Cotizador() {
  const [activeTab, setActiveTab] = useState('cotizadorForm'); // Estado para la pestaña activa

  return (
    <div className="container">
      <div className="card">
        <div className="p-6">
        <h1 className="title"></h1>
          {/* Pestañas */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'cotizadorForm' ? 'active' : ''}`}
              onClick={() => setActiveTab('cotizadorForm')}
            >
              Cotizador de Rutas
            </button>
          </div>
          
          {/* Contenido del formulario */}
          <div className="form-container">
            {activeTab === 'cotizadorForm' && <CotizadorForm />}
          </div>
        </div>
      </div>
    </div>
  );
}