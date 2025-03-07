"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

// Configuración de las tablas y sus campos
const TABLE_CONFIGS = {
  datos_empresa: {
    fields: [
      { name: "fecha_registro", type: "text" },
      { name: "rfc", type: "text" },
      { name: "direccion", type: "text" },
      { name: "telefono", type: "text" },
      { name: "cuenta_bancaria", type: "text" },
      { name: "cuenta_espejo", type: "text" },
      { name: "unidad", type: "select", reference: "tipos_unidades", displayKey: "nombre" },
      { name: "operadores", type: "select", reference: "operadores", displayKey: "nombre_operador" },
      { name: "destinos", type: "multiselect", reference: "origen", displayKey: "origen" },
      { name: "estadoss", type: "select", reference: "estado", displayKey: "estado" },
    ],
  },
  tipos_unidades: {
    fields: [
      { name: "nombre", type: "text" },
      { name: "foto_url", type: "text" },
      { name: "capacidad", type: "text" },
      { name: "descripcion", type: "text" },
    ],
  },
  operadores: {
    fields: [
      { name: "nombre_operador", type: "text" },
      { name: "rfc", type: "text" },
      { name: "telefono", type: "text" },
      { name: "licencia", type: "text" },
    ],
  },
  origen: {
    fields: [
      { name: "origen", type: "text" },
      { name: "destino", type: "text" },
    ],
  },
  estado: {
    fields: [
      { name: "estado", type: "text" },
      { name: "descripcion", type: "text" },
    ],
  },
};

export default function Dashboard() {
  const API_BASE_URL = "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";

  const [tablas, setTablas] = useState({});
  const [formData, setFormData] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTable, setActiveTable] = useState("datos_empresa");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDestinos, setSelectedDestinos] = useState([]);
  const [tablesLoaded, setTablesLoaded] = useState({});
  const [loadingTables, setLoadingTables] = useState({});
  const [showMultiselectDropdown, setShowMultiselectDropdown] = useState(false);
  const [multiselectSearchTerm, setMultiselectSearchTerm] = useState("");

  // Inicializar el formData para todas las tablas
  useEffect(() => {
    const initialFormData = {};
    Object.keys(TABLE_CONFIGS).forEach((tableName) => {
      initialFormData[tableName] = Object.fromEntries(
        TABLE_CONFIGS[tableName].fields.map((field) => [field.name, field.type === "multiselect" ? [] : ""])
      );
    });
    setFormData(initialFormData);
  }, []);

  // Cargar datos de las tablas en orden
  useEffect(() => {
    const referenceTables = ["tipos_unidades", "operadores", "origen", "estado"]; // Asegúrate de incluir "origen"
    const loadTablesInOrder = async () => {
      try {
        // Cargar primero las tablas de referencia
        for (const table of referenceTables) {
          await fetchTableData(table);
        }
        // Luego cargar datos_empresa
        await fetchTableData("datos_empresa");
      } catch (err) {
        console.error("Error cargando tablas en secuencia:", err);
        setError("Error cargando tablas. Verifica la consola para más detalles.");
      }
    };
    loadTablesInOrder();
  }, []);

  // Función para obtener datos de la tabla
  const fetchTableData = async (tableName) => {
    if (loadingTables[tableName]) return; // Evitar múltiples solicitudes simultáneas

    setLoadingTables((prev) => ({ ...prev, [tableName]: true }));
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/${tableName}/all`, {
        headers: { "Content-Type": "application/json", apikey: API_KEY },
      });

      console.log(`Respuesta de la API para ${tableName}:`, response.data); // Depuración

      if (response.data && response.data.records && Array.isArray(response.data.records)) {
        setTablas((prev) => ({ ...prev, [tableName]: response.data.records }));
        setTablesLoaded((prev) => ({ ...prev, [tableName]: true }));
      } else {
        setError(`Formato inesperado para ${tableName}`);
      }
    } catch (error) {
      console.error(`Error al obtener datos de ${tableName}:`, error);
      setError(`Error al cargar ${tableName}: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingTables((prev) => ({ ...prev, [tableName]: false }));
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e, tableName) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [tableName]: { ...prev[tableName], [name]: value },
    }));
  };

  // Manejar cambios en los items del multiselect
  const handleDestinoChange = (destinoValue) => {
    let newSelectedDestinos = [...selectedDestinos];

    if (newSelectedDestinos.includes(destinoValue)) {
      newSelectedDestinos = newSelectedDestinos.filter((d) => d !== destinoValue);
    } else {
      newSelectedDestinos.push(destinoValue);
    }

    setSelectedDestinos(newSelectedDestinos);

    // Actualizar formData con la cadena de destinos separados por coma
    setFormData((prev) => ({
      ...prev,
      [activeTable]: { ...prev[activeTable], destinos: newSelectedDestinos.join(",") },
    }));
  };

  // Eliminar un destino seleccionado
  const removeDestino = (destinoValue) => {
    const newSelectedDestinos = selectedDestinos.filter((d) => d !== destinoValue);
    setSelectedDestinos(newSelectedDestinos);

    // Actualizar formData con la nueva lista
    setFormData((prev) => ({
      ...prev,
      [activeTable]: { ...prev[activeTable], destinos: newSelectedDestinos.join(",") },
    }));
  };

  // Limpiar el formulario
  const clearForm = () => {
    const initialFormData = {};
    Object.keys(TABLE_CONFIGS).forEach((tableName) => {
      initialFormData[tableName] = Object.fromEntries(
        TABLE_CONFIGS[tableName].fields.map((field) => [field.name, field.type === "multiselect" ? [] : ""])
      );
    });
    setFormData(initialFormData);
    setSelectedDestinos([]);
    setSelectedItem(null);
  };

  // Enviar datos del formulario
  const handleSubmit = async (tableName) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = selectedItem
        ? `${API_BASE_URL}/${tableName}/${selectedItem.id}`
        : `${API_BASE_URL}/${tableName}`;
      const method = selectedItem ? "patch" : "post";

      const response = await axios({
        method,
        url,
        data: { data: formData[tableName] },
        headers: { "Content-Type": "application/json", apikey: API_KEY },
      });

      alert(selectedItem ? "Registro actualizado" : "Registro agregado");
      clearForm();
      fetchTableData(tableName);
    } catch (error) {
      setError(`Error al procesar la solicitud: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un registro
  const handleDelete = async (tableName, id) => {
    if (!window.confirm("¿Deseas eliminar este registro?")) return;
    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/${tableName}/${id}`, {
        headers: { "Content-Type": "application/json", apikey: API_KEY },
      });
      alert("Registro eliminado");
      fetchTableData(tableName);
    } catch (error) {
      setError(`Error al eliminar registro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar un registro para editar
  const handleSelectItem = (item, tableName) => {
    setSelectedItem(item);

    // Para datos_empresa, manejar los destinos seleccionados
    if (tableName === "datos_empresa" && item.destinos) {
      const destinosArray = item.destinos.split(",").filter((d) => d.trim() !== "");
      setSelectedDestinos(destinosArray);
    } else {
      setSelectedDestinos([]);
    }

    setFormData((prev) => ({ ...prev, [tableName]: { ...item } }));
  };

  // Filtrar datos según el término de búsqueda
  const filteredData = tablas[activeTable]?.filter((item) => {
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filtrar opciones del multiselect según el término de búsqueda
  const filteredDestinos = tablas["origen"]?.filter((item) => {
    return item.origen.toLowerCase().includes(multiselectSearchTerm.toLowerCase());
  });

  // Verificar si un destino está seleccionado
  const isDestinoSelected = (destinoValue) => {
    return selectedDestinos.includes(destinoValue);
  };

  // Recargar una tabla específica
  const reloadTable = (tableName) => {
    fetchTableData(tableName);
  };

  // Renderizado del componente
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center bg-no-repeat bg-[url('/imagenes/rodval.png')]">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-8 bg-opacity-100 ml-40">
        <h1 className="text-3xl font-bold text-center mb-6">Mantenedor de los transportes</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button className="float-right text-red-700 font-bold" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        )}

        <div className="mb-4 text-sm text-gray-600">
          <p>Estado de carga de tablas:</p>
          <ul className="flex flex-wrap gap-2 mt-1">
            {Object.keys(TABLE_CONFIGS).map((table) => (
              <li key={table} className="flex items-center">
                <span
                  className={`w-3 h-3 rounded-full mr-1 ${
                    loadingTables[table]
                      ? "bg-yellow-500"
                      : tablesLoaded[table]
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></span>
                {table} {loadingTables[table] && "(cargando...)"}
                {!loadingTables[table] && !tablesLoaded[table] && (
                  <button
                    className="ml-1 text-xs text-blue-500 underline"
                    onClick={() => reloadTable(table)}
                  >
                    Reintentar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-center mb-6">
          {Object.keys(TABLE_CONFIGS).map((table) => (
            <button
              key={table}
              onClick={() => {
                setActiveTable(table);
                clearForm();
              }}
              className={`px-4 py-2 mx-2 rounded-xl ${
                activeTable === table ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {table.replace(/_/g, " ").toUpperCase()}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">
            {selectedItem ? "Editar Registro" : "Agregar Nuevo Registro"}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(activeTable);
            }}
          >
            {TABLE_CONFIGS[activeTable].fields.map((field) => {
              if (field.type === "select") {
                const hasOptions = tablas[field.reference] && tablas[field.reference].length > 0;
                return (
                  <div key={field.name} className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      {field.name.replace(/_/g, " ").toUpperCase()}
                    </label>
                    <div className="flex items-center">
                      <select
                        name={field.name}
                        value={formData[activeTable]?.[field.name] || ""}
                        onChange={(e) => handleInputChange(e, activeTable)}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">Selecciona la opción</option>
                        {hasOptions &&
                          tablas[field.reference]?.map((item) => (
                            <option key={item.id} value={item[field.displayKey]}>
                              {item[field.displayKey]}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => reloadTable(field.reference)}
                        className="ml-2 p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        title="Recargar opciones"
                      >
                        🔄
                      </button>
                    </div>
                    {!hasOptions && (
                      <p className="text-red-500 text-xs mt-1">
                        No hay datos disponibles para este selector. Verifique la tabla {field.reference}.
                        <button
                          type="button"
                          className="ml-1 underline"
                          onClick={() => reloadTable(field.reference)}
                        >
                          Recargar tabla
                        </button>
                      </p>
                    )}
                  </div>
                );
              } else if (field.type === "multiselect") {
                const hasOptions = tablas[field.reference] && tablas[field.reference].length > 0;
                return (
                  <div key={field.name} className="mb-4 relative" id="multiselect-dropdown">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium mb-1">
                        {field.name.replace(/_/g, " ").toUpperCase()} (Selección múltiple)
                      </label>
                      <button
                        type="button"
                        onClick={() => reloadTable(field.reference)}
                        className="ml-2 p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        title="Recargar opciones"
                      >
                        🔄
                      </button>
                    </div>
                    
                    {/* Campo de selección estilo multiselect moderno */}
                    <div 
                      className="p-2 border rounded-lg bg-white cursor-pointer flex flex-wrap gap-1 min-h-10"
                      onClick={() => setShowMultiselectDropdown(!showMultiselectDropdown)}
                    >
                      {selectedDestinos.length > 0 ? (
                        selectedDestinos.map((destino, idx) => (
                          <div key={idx} className="bg-blue-500 text-white px-2 py-1 rounded-full flex items-center text-sm">
                            {destino}
                            <button 
                              type="button"
                              className="ml-1 text-white hover:text-red-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeDestino(destino);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">Seleccione destinos</span>
                      )}
                    </div>
                    
                    {/* Dropdown del multiselect */}
                    {showMultiselectDropdown && hasOptions && (
                      <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 border-b sticky top-0 bg-white">
                          <input
                            type="text"
                            className="w-full p-2 border rounded"
                            placeholder="Buscar destinos..."
                            value={multiselectSearchTerm}
                            onChange={(e) => setMultiselectSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div>
                          {filteredDestinos?.map((item, index) => (
                            <div 
                              key={index} 
                              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                                isDestinoSelected(item[field.displayKey]) ? 'bg-blue-50' : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDestinoChange(item[field.displayKey]);
                              }}
                            >
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={isDestinoSelected(item[field.displayKey])}
                                  onChange={() => {}}
                                  className="mr-2"
                                />
                                <span>{item[field.displayKey]}</span>
                              </div>
                            </div>
                          ))}
                          {filteredDestinos?.length === 0 && (
                            <div className="p-3 text-center text-gray-500">
                              No se encontraron destinos
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {!hasOptions && (
                      <div>
                        <p className="text-red-500 text-xs mt-1">
                          No hay datos disponibles para las opciones. Verifique la tabla {field.reference}.
                        </p>
                        <button
                          type="button"
                          className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded"
                          onClick={() => reloadTable(field.reference)}
                        >
                          Cargar tabla {field.reference}
                        </button>
                      </div>
                    )}
                    
                    {/* Área que muestra los destinos seleccionados como texto */}
                    <input 
                      type="hidden" 
                      name={field.name} 
                      value={selectedDestinos.join(",")} 
                    />
                  </div>
                );
              } else {
                return (
                  <div key={field.name} className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      {field.name.replace(/_/g, " ").toUpperCase()}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[activeTable]?.[field.name] || ""}
                      onChange={(e) => handleInputChange(e, activeTable)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                );
              }
            })}
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-5 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : selectedItem ? "Actualizar" : "Agregar nuevo registro"}
              </button>
              {selectedItem && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-5 py-3 bg-gray-500 text-white rounded-xl shadow-md hover:bg-gray-600"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div className="mb-4 text-right">
          <button
            onClick={() => fetchTableData(activeTable)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loadingTables[activeTable]}
          >
            {loadingTables[activeTable]
              ? "Cargando..."
              : `Recargar tabla ${activeTable.replace(/_/g, " ")}`}
          </button>
        </div>

        {loadingTables[activeTable] ? (
          <div className="text-center py-4">
            <p className="mb-2">Cargando datos de {activeTable}...</p>
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : !tablas[activeTable] || !tablas[activeTable].length ? (
          <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="mb-2">No hay datos disponibles en esta tabla</p>
            <button
              onClick={() => fetchTableData(activeTable)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refrescar datos
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border rounded-xl shadow-lg overflow-hidden mt-6">
              <thead>
                <tr className="bg-gray-300">
                  {tablas[activeTable][0] &&
                    Object.keys(tablas[activeTable][0]).map((key) => (
                      <th key={key} className="p-3 border text-left">
                        {key.toUpperCase()}
                      </th>
                    ))}
                  <th className="p-3 border text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {!filteredData || filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        tablas[activeTable][0]
                          ? Object.keys(tablas[activeTable][0]).length + 1
                          : 2
                      }
                      className="p-3 border text-center"
                    >
                      No se encontraron registros
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="bg-white hover:bg-gray-100">
                      {Object.entries(item).map(([key, value]) => (
                        <td key={key} className="p-3 border">
                          {value !== null && value !== undefined ? String(value) : ""}
                        </td>
                      ))}
                      <td className="p-3 border text-center">
                        <button
                          onClick={() => handleSelectItem(item, activeTable)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg mr-2 hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(activeTable, item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}