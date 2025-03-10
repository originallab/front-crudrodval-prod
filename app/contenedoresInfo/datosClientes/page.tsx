"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Item } from "@radix-ui/react-dropdown-menu";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

export default function Dashboard() {
  // URL base para todas las solicitudes a la API
  const API_BASE_URL = "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety"; // Define tu API Key aquí

  const [tablas, setTablas] = useState({
    clientes: [],
  });

  // Definir el crud de las tablas que se van a manejar
  const [formData, setFormData] = useState({
    clientes: {
      fecha_registro: new Date().toISOString().split('T')[0],
      id_empresa: "",
      constancia: "",
      rfc: "",
      ubicacion: "",
      giro: "",
      nombre: "",
      telefono: "",
      informacion_cobranza: "",
      flujo_movimiento: "",
      estado: 0,}
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTable, setActiveTable] = useState("clientes");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [segundoCampo, setSegundoCampo] = useState(null);

  // Método para obtener los datos de la tabla con reintentos
  const fetchTableData = async (tableName) => {
    setIsLoading(true);
    setError(null);

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        console.log(`Intento ${attempts + 1}: Fetching data from: ${API_BASE_URL}/${tableName}/all`);

        if (attempts > 0) {
          setRetrying(true);
        }

        // Realiza la solicitud a la API con timeout aumentado
        const response = await axios.get(`${API_BASE_URL}/${tableName}/all`, {
          timeout: 30000, // Timeout aumentado a 30 segundos
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'apikey': API_KEY, // Agrega la API Key aquí
          },
        });

        console.log("Response:", response.data);

        // Verifica si la respuesta tiene el formato esperado
        if (response.data && Array.isArray(response.data.records)) {
          setTablas((prev) => ({ ...prev, [tableName]: response.data.records }));
          setRetrying(false);
          setIsLoading(false);
          return; // Salir del bucle si la solicitud fue exitosa
        } else {
          console.error(`Data from ${tableName} is not in expected format:`, response.data);
          throw new Error(`Formato de respuesta inesperado para ${tableName}`);
        }
      } catch (error) {
        attempts++;
        console.error(`Error al obtener datos de ${tableName} (intento ${attempts}):`, error);
        console.error("Detalles del error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));

        if (error.response) {
          // El servidor respondió con un código de estado fuera del rango 2xx
          console.error("Respuesta del servidor:", error.response.status, error.response.data);
          setError(`Error ${error.response.status}: ${error.response.data?.message || "Error en el servidor"}`);
        } else if (error.request) {
          // La solicitud fue hecha pero no se recibió respuesta
          console.error("Solicitud enviada pero sin respuesta:", error.request);
          setError("No se recibió respuesta del servidor. Reintentando conexión...");
        } else {
          // Otros errores
          setError(`Error al realizar la solicitud: ${error.message}`);
        }

        if (attempts === maxAttempts) {
          // Se agotaron los intentos
          setTablas((prev) => ({ ...prev, [tableName]: [] }));
          setError(`No se pudieron obtener los datos después de ${maxAttempts} intentos. Por favor, verifica la conexión al servidor.`);
          setRetrying(false);
          break;
        }

        // Esperar antes de reintentar (con backoff exponencial)
        const waitTime = 1000 * Math.pow(2, attempts);
        console.log(`Esperando ${waitTime}ms antes de reintentar...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    setIsLoading(false);
  };

  // Cargar datos al inicio
  useEffect(() => {
    const loadAllTables = async () => {
      await fetchTableData("clientes");
    };

    loadAllTables();
  }, []);

  // Recargar datos cuando se cambia de tabla
  useEffect(() => {
    fetchTableData(activeTable);
  }, [activeTable]);

  // Manejar cambios en los formularios
  const handleInputChange = (e, tableName) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [tableName]: { ...prev[tableName], [name]: value },
    }));
  };

  // Agregar o editar un registro
  const handleSubmit = async (tableName) => {
    // Verificar que los campos obligatorios estén completos
    const requiredFields = Object.keys(formData[tableName]);
    const hasEmptyFields = requiredFields.some((field) => formData[tableName][field] === "");

    if (hasEmptyFields) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      if (selectedItem) {
        // Editar registro
        console.log(`Editando registro de ${tableName} con ID ${selectedItem[segundoCampo]}`);
        
    const response = await axios.patch(
    `${API_BASE_URL}/${tableName}/${selectedItem[segundoCampo]}`,
     { data: formData[tableName] },
     {
          headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'apikey': API_KEY,
    },
    timeout: 30000,
  }
);

        console.log("Edit response:", response.data);
        alert("Registro actualizado correctamente.");
      } else {
        // Agregar registro
        console.log(`Agregando nuevo registro a ${tableName}`);
        console.log("Data to send:", formData[tableName]);

        const response = await axios.post(
          `${API_BASE_URL}/${tableName}`,
          { data: formData[tableName] },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
              'apikey': API_KEY,
            },
            timeout: 30000,
          }
        );

        console.log("Add response:", response.data);
        alert("Registro agregado correctamente.");
      }

      // Resetear formulario y estado de selección
      setSelectedItem(null);
      setFormData((prev) => ({
        ...prev,
        [tableName]: Object.fromEntries(
          Object.keys(prev[tableName]).map((key) => [key, ""])
        ),
      }));

      // Recargar los datos de la tabla
      fetchTableData(tableName);
    } catch (error) {
      console.error(`Error al ${selectedItem ? "editar" : "agregar"} registro:`, error);
      if (error.response) {
        console.error("Detalles del error:", error.response.data);
        setError(`Error: ${error.response.data.message || "Datos inválidos"}`);
      } else {
        setError(`Error: ${error.message}`);
      }
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un registro
  const handleDelete = async (tableName, id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este registro?")) {
      setIsLoading(true);
      setError(null);
      console.log("ID recibido:", id);
      try {
        console.log(`Eliminando registro de ${tableName} con ID ${id}`);
        const response = await axios.delete(
          `${API_BASE_URL}/${tableName}/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
              'apikey': API_KEY,
            },
            timeout: 30000,
          }
        );

        console.log("Delete response:", response.data);
        alert("Registro eliminado correctamente.");

        // Recargar los datos de la tabla
        fetchTableData(tableName);
      } catch (error) {
        console.error("Error al eliminar registro:", error);
        setError(`Error al eliminar registro: ${error.message}`);
        alert(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Seleccionar un registro para editar
  const handleSelectItem = (item, tableName) => {
    console.log("Item seleccionado:", item);
    setSelectedItem(item);

    // Obtener las claves del objeto
    const campos = Object.keys(item);
    const segundoCampo = campos[0]; // Accede al segundo campo
    setSegundoCampo(segundoCampo); // Guarda el segundo campo en el estado

    console.log(`Valor del segundo campo (${segundoCampo}):`, item[segundoCampo]);

    // Actualizar el estado formData
    setFormData((prev) => ({
      ...prev,
      [tableName]: {
        ...item, // Copia todas las propiedades de item
      },
    }));
  };

  // Limpiar el formulario y deseleccionar el item
  const handleCancelEdit = () => {
    setSelectedItem(null);
    setFormData((prev) => ({
      ...prev,
      [activeTable]: Object.fromEntries(
        Object.keys(prev[activeTable]).map((key) => [key, ""])
      ),
    }));
  };

  // Forzar recarga manual de los datos
  const handleForceRefresh = () => {
    fetchTableData(activeTable);
  };

  // Filtrar registros basados en la búsqueda
  const filteredData = tablas[activeTable]?.filter((item) => {
    const itemId = Number(item.id || item.ID || item._id); // Maneja diferentes nombres de id

    if (/^\d+$/.test(searchTerm)) {
      return itemId === parseInt(searchTerm, 10);
    }

    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundImage: "url('/imagenes/rodval.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        minHeight: "100vh",
        position: "absolute",
        top: "0",
        left: "0",
      }}
    >
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-8 bg-opacity-100 ml-40">
        <h1 className="text-3xl font-bold text-center mb-6">Mantenedor de Clientes</h1>

        {/* Selector de tabla */}
        <div className="flex justify-center mb-6">
          {["Informacion de los clientes"].map((table) => (
            <button
              key={table}
              onClick={() => {
                setActiveTable(table);
                setSelectedItem(null);
                setFormData((prev) => ({
                  ...prev,
                  [table]: Object.fromEntries(
                    Object.keys(prev[table]).map((key) => [key, ""])
                  ),
                }));
              }}
              className={`px-4 py-2 mx-2 rounded-xl ${
                activeTable === table ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {table.replace(/_/g, " ").toUpperCase()}
            </button>
          ))}
        </div>

        {/* Mensaje de error y botón de recarga */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <p>{error}</p>
            <button
              onClick={handleForceRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={isLoading || retrying}
            >
              {retrying ? "Reintentando..." : "Reintentar carga"}
            </button>
          </div>
        )}

        {/* Estado de carga */}
        {isLoading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-center">
            Cargando datos... Por favor espere.
          </div>
        )}

        {/* Formulario dinámico */}
        <div className="p-6 rounded-2xl shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedItem ? "Editar" : "Agregar"} {activeTable.replace(/_/g, " ").toUpperCase()}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(formData[activeTable]).map((key) => (
              <div key={key} className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key.replace(/_/g, " ").toUpperCase()}
                </label>
                <input
                  type="text"
                  placeholder={key.replace(/_/g, " ").toUpperCase()}
                  name={key}
                  value={formData[activeTable][key] || ""}
                  onChange={(e) => handleInputChange(e, activeTable)}
                  className="border p-3 rounded-xl shadow-inner w-full"
                />
              </div>
            ))}
          </div>
          <div className="flex mt-4 space-x-2">
            <button
              onClick={() => handleSubmit(activeTable)}
              disabled={isLoading}
              className="px-5 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 disabled:bg-gray-400"
            >
              {isLoading
                ? "Procesando..."
                : selectedItem
                ? "Guardar Cambios"
                : "Agregar Registro"}
            </button>
            {selectedItem && (
              <button
                onClick={handleCancelEdit}
                className="px-5 py-3 bg-gray-500 text-white rounded-xl shadow-md hover:bg-gray-600"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar (ID o texto)
          </label>
          <input
            type="text"
            placeholder="Ingresa ID o texto para buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-3 rounded-xl shadow-inner w-full"
          />
        </div>

        {/* Tabla dinámica */}
        {isLoading ? (
          <div className="text-center py-4">Cargando datos...</div>
        ) : tablas[activeTable].length === 0 ? (
          <div className="text-center py-4">
            No hay datos disponibles en esta tabla
            <button
              onClick={handleForceRefresh}
              className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refrescar datos
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border rounded-xl shadow-lg overflow-hidden mt-6">
              <thead>
                <tr className="bg-gray-300">
                  {tablas[activeTable][0] && Object.keys(tablas[activeTable][0]).map((key) => (
                    <th key={key} className="p-3 border text-left">
                      {key.toUpperCase()}
                    </th>
                  ))}
                  <th className="p-3 border text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
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
                          {String(value)}
                        </td>
                      ))}
                      <td className="p-3 border text-center">
                        <button
                          onClick={() => handleSelectItem(item, activeTable)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg mr-2 hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(activeTable, item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <MdDelete />
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