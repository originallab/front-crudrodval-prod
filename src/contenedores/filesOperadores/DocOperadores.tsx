import { useState } from 'react';
import DocOperadoresForm from './DocOperadoresForm';
import './../DatosBasicos.css'; // Importa los estilos

export default function DocOperadores() {
  const [activeTab, setActiveTab] = useState('docOperadoresForm'); // Estado para la pestaña activa

  return (
    <div className="container">
      <div className="card">
        <div className="p-6">
        <h1 className="title"></h1>
        <h1 className="title"></h1>
          {/* Pestañas */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'docOperadoresForm' ? 'active' : ''}`}
              onClick={() => setActiveTab('docOperadoresForm')}
            >
             Archivos Operadores
            </button>
          </div>
          
          {/* Contenido del formulario */}
          <div className="form-container">
            {activeTab === 'docOperadoresForm' && <DocOperadoresForm />}
          </div>
        </div>
      </div>
    </div>
  );
}