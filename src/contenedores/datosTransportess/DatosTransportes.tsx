import { useState } from 'react';
import TiposUnidades from './TiposUnidades';
import Operadores from './Operadores';
import Origen from './Origen';
import Estado from './Estado';
import DatosTransportesForm from './DatosTransportesForm';
import './../DatosBasicos.css'; // Importa los estilos

export default function DatosTransportes() {
  const [activeTab, setActiveTab] = useState('datosTransportes'); // Estado para la pestaña activa

  return (
    <div className="container">
      <div className="card">
        <div className="p-6">
          <h1 className="title">Mantenedor de datos de transportes</h1>
          
          {/* Pestañas */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'tiposUnidades' ? 'active' : ''}`}
              onClick={() => setActiveTab('tiposUnidades')}
            >
              Tipos de Unidades
            </button>
            <button
              className={`tab ${activeTab === 'operadores' ? 'active' : ''}`}
              onClick={() => setActiveTab('operadores')}
            >
              Operadores
            </button>
            <button
              className={`tab ${activeTab === 'origen' ? 'active' : ''}`}
              onClick={() => setActiveTab('origen')}
            >
              Origen
            </button>
            <button
              className={`tab ${activeTab === 'estado' ? 'active' : ''}`}
              onClick={() => setActiveTab('estado')}
            >
              Estado
            </button>
            <button
              className={`tab ${activeTab === 'datosTransportesForm' ? 'active' : ''}`}
              onClick={() => setActiveTab('datosTransportesForm')}
            >
              Transportes
            </button>
          </div>
          
          {/* Contenido del formulario */}
          <div className="form-container">
            {activeTab === 'tiposUnidades' && <TiposUnidades />}
            {activeTab === 'operadores' && <Operadores />}
            {activeTab === 'origen' && <Origen />}
            {activeTab === 'estado' && <Estado />}
            {activeTab === 'datosTransportesForm' && <DatosTransportesForm />}
          </div>
        </div>
      </div>
    </div>
  );
}