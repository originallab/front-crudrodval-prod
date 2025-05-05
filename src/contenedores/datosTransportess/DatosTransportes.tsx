import { useState } from 'react';
import Operadores from './Operadores';
import Origen from './Origen';
import DatosTransportesForm from './DatosTransportesForm';
import './../DatosBasicos.css'; // Importa los estilos

export default function DatosTransportes() {
  const [activeTab, setActiveTab] = useState('datosTransportes'); // Estado para la pestaña activa

  return (
    <div className="container">
      <div className="card">
        <div className="p-6">
          <h1 className="title">Mantenedor de datos de operadores y transportes</h1>
          
          {/* Pestañas */}
          <div className="tabs">
           
            <button
              className={`tab ${activeTab === 'operadores' ? 'active' : ''}`}
              onClick={() => setActiveTab('operadores')}
            >
              Datos de los operadores
            </button>
            <button
              className={`tab ${activeTab === 'origen' ? 'active' : ''}`}
              onClick={() => setActiveTab('origen')}
            >
              File para posible cotizador
            </button>
            
            <button
              className={`tab ${activeTab === 'datosTransportesForm' ? 'active' : ''}`}
              onClick={() => setActiveTab('datosTransportesForm')}
            >
              Datos de los transportes
            </button>
          </div>
          
          {/* Contenido del formulario */}
          <div className="form-container">
           
            {activeTab === 'operadores' && <Operadores />}
            {activeTab === 'origen' && <Origen />}
         
            {activeTab === 'datosTransportesForm' && <DatosTransportesForm />}
          </div>
        </div>
      </div>
    </div>
  );
}