import { useState } from 'react';
import DatosBasicosForm from './DatosBasicosForm';
import TiposUnidades from './TiposUnidades';
import './DatosBasicos.css'; // Importa los estilos

export default function DatosBasicos() {
  const [activeTab, setActiveTab] = useState('datosBasicos'); // Estado para la pestaña activa

  return (
    <div className="container">
      <div className="card">
        <div className="p-6">
           <div className="p-6"></div>
          <h1 className="title"></h1>
          
          {/* Pestañas */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'datosBasicos' ? 'active' : ''}`}
              onClick={() => setActiveTab('datosBasicos')}
            >
              Zonas de destino de los transportes
            </button>
            <button
              className={`tab ${activeTab === 'tiposUnidades' ? 'active' : ''}`}
              onClick={() => setActiveTab('tiposUnidades')}
            >
              Tipos de Unidades
            </button>
          
          </div>
          
          {/* Contenido del formulario */}
          <div className="form-container">
            {activeTab === 'datosBasicos' && <DatosBasicosForm />}
            {activeTab === 'tiposUnidades' && <TiposUnidades />}
         
          </div>
        </div>
      </div>
    </div>
  );
}