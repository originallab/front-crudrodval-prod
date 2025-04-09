import { useState, useEffect } from "react";
import axios from "axios";
import "./../DatosBasicos.css";
import Select from "react-select";
import Multiselect from "multiselect-react-dropdown";
import DeleteIcon from "@mui/icons-material/Delete";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function DatosClientesForm() {
  // Definir el tipo Item para la nueva tabla
  type Item = {
    id_cliente: number;
    fecha_registro: string;
    constancia: string;
    rfc: string;
    ubicacion: string;
    giro: string;
    nombre: string;
    telefono: string;
    informacion_cobranza: string;
    flujo_movimiento: string;
    estado: number;
  };

  // Estados
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState<
    Omit<Item, "id_cliente"> & { id_cliente?: number }
  >({
    fecha_registro: "",
    constancia: "",
    rfc: "",
    ubicacion: "",
    giro: "",
    nombre: "",
    telefono: "",
    informacion_cobranza: "",
    flujo_movimiento: "",
    estado: 0,
  });
  const [busqueda, setBusqueda] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Datos de las tablas referenciadas
  const [estados, setEstados] = useState<any[]>([]);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Configuración de la API
  const API_BASE_URL =
    "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "clientess";

  // Obtener los datos al cargar el componente
  useEffect(() => {
    fetchItems();
    fetchReferencedData();
  }, []);

  // Función para obtener los elementos
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/${tableName}/all`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Cache-Control": "no-cache",
          apikey: API_KEY,
        },
        timeout: 30000,
      });
      setItems(response.data.records);
    } catch (err) {
      setError("Error al cargar los datos");
      console.error("Error en fetchItems:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener datos de las tablas referenciadas
  const fetchReferencedData = async () => {
    try {
      const [estadosRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/estado/all`, {
          headers: { apikey: API_KEY },
        }),
      ]);

      setEstados(estadosRes.data.records);
    } catch (err) {
      console.error("Error al cargar datos referenciados:", err);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url =
        isEditing && formData.id_cliente
          ? `${API_BASE_URL}/${tableName}/${formData.id_cliente}`
          : `${API_BASE_URL}/${tableName}`;

      const method = isEditing && formData.id_cliente ? "patch" : "post";

      // Formatear la fecha correctamente para el envío
      const formattedDate = startDate ? startDate.toISOString().split('T')[0] : '';

      // Preparar los datos a enviar incluyendo la fecha formateada
      const dataToSend = {
        ...formData,
        fecha_registro: formattedDate,
        id_cliente: isEditing ? formData.id_cliente : undefined
      };

      const response = await axios[method](
        url,
        { data: dataToSend },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Cache-Control": "no-cache",
            apikey: API_KEY,
          },
          timeout: 30000,
        }
      );

      const result = response.data;
      if (isEditing) {
        setItems(
          items.map((item) =>
            item.id_cliente === formData.id_cliente ? result : item
          )
        );
      } else {
        setItems([...items, result]);
      }

      // Recargar datos referenciados
      fetchReferencedData();

      // Limpiar el formulario
      setFormData({
        fecha_registro: "",
        constancia: "",
        rfc: "",
        ubicacion: "",
        giro: "",
        nombre: "",
        telefono: "",
        informacion_cobranza: "",
        flujo_movimiento: "",
        estado: 0,
      });
      setStartDate(null);
      setIsEditing(false);
    } catch (err) {
      setError("Error al guardar los datos");
      console.error("Error en handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un elemento
  const handleDelete = async (id_cliente: number) => {
    if (window.confirm("¿Estás seguro de eliminar este elemento?")) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/${tableName}/${id_cliente}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Cache-Control": "no-cache",
            apikey: API_KEY,
          },
          timeout: 30000,
        });
        setItems(items.filter((item) => item.id_cliente !== id_cliente));
      } catch (err) {
        setError("Error al eliminar el elemento");
        console.error("Error en handleDelete:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para editar un elemento
  const handleEdit = (item: Item) => {
    setFormData(item);
    // Parsear la fecha string a objeto Date
    const fecha = item.fecha_registro ? new Date(item.fecha_registro) : null;
    setStartDate(fecha);
    setIsEditing(true);
  };

  // Filtrar elementos según la búsqueda
  const filteredItems = items.filter(
    (item) =>
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.rfc.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.giro.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Cálculos para paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  return (
    <div>
      <h2>Clientes</h2>
      {error && <div className="error-message">{error}</div>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="form">
        {isEditing && (
          <div className="mb-4">
            <label>ID</label>
            <input
              type="text"
              value={formData.id_cliente}
              disabled
              className="input"
            />
          </div>
        )}

        <div className="mb-4">
          <label>Fecha de Registro: </label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholderText="Seleccione la fecha de registro"
            required
          />
        </div>

        <div className="mb-4">
          <label>Constancia: </label>
          <input
            type="text"
            value={formData.constancia}
            onChange={(e) =>
              setFormData({ ...formData, constancia: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingresar la constancia"
          />
        </div>

        <div className="mb-4">
          <label>Rfc: </label>
          <input
            type="text"
            value={formData.rfc}
            onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el Rfc"
          />
        </div>

        <div className="mb-4">
          <label>Ubicacion: </label>
          <input
            type="text"
            value={formData.ubicacion}
            onChange={(e) =>
              setFormData({ ...formData, ubicacion: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese la ubicacion"
          />
        </div>

        <div className="mb-4">
          <label>Giro: </label>
          <input
            type="text"
            value={formData.giro}
            onChange={(e) => setFormData({ ...formData, giro: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingresar el giro"
          />
        </div>

        <div className="mb-4">
          <label>Nombre: </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el nombre"
          />
        </div>

        <div className="mb-4">
          <label>Telefono: </label>
          <input
            type="text"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el teléfono"
          />
        </div>

        <div className="mb-4">
          <label>Informacion de Cobranza: </label>
          <input
            type="text"
            value={formData.informacion_cobranza}
            onChange={(e) =>
              setFormData({ ...formData, informacion_cobranza: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese la informacion de cobranza"
          />
        </div>

        <div className="mb-4">
          <label>Flujo de movimiento: </label>
          <input
            type="text"
            value={formData.flujo_movimiento}
            onChange={(e) =>
              setFormData({ ...formData, flujo_movimiento: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el flujo de movimiento"
          />
        </div>

        <div className="mb-4">
          <label>Estado</label>
          <Select
            options={estados.map((item) => ({
              value: item.id_estado,
              label: item.estado,
            }))}
            value={estados
              .filter((option) => option.id_estado === formData.estado)
              .map((item) => ({
                value: item.id_estado,
                label: item.estado,
              }))}
            onChange={(selectedOption) =>
              setFormData({ ...formData, estado: selectedOption?.value || 0 })
            }
            placeholder="Seleccione el estado"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? "Procesando..." : isEditing ? "Actualizar" : "Agregar"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  fecha_registro: "",
                  constancia: "",
                  rfc: "",
                  ubicacion: "",
                  giro: "",
                  nombre: "",
                  telefono: "",
                  informacion_cobranza: "",
                  flujo_movimiento: "",
                  estado: 0,
                });
                setStartDate(null);
                setIsEditing(false);
              }}
              className="button button-secondary"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Barra de búsqueda */}
      <div className="search-container">
        <label>Buscar en Clientes:</label>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          required
          className="search-input w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* Botón de recargar */}
      <div style={{ overflow: "hidden" }}>
        <button
          onClick={fetchItems}
          className="button button-primary"
          disabled={loading}
          style={{ float: "right" }}
        >
          {loading ? "Recargando..." : "Recargar Tabla"}
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha de Registro</th>
              <th>Nombre</th>
              <th>RFC</th>
              <th>Giro</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center">
                  Cargando...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  No hay elementos disponibles
                </td>
              </tr>
            ) : (
              currentItems.map((item) => {
                const estado = estados.find(
                  (es) => es.id_estado === Number(item.estado)
                );

                return (
                  <tr key={item.id_cliente}>
                    <td>{item.id_cliente}</td>
                    <td>{item.fecha_registro}</td>
                    <td>{item.nombre}</td>
                    <td>{item.rfc}</td>
                    <td>{item.giro}</td>
                    <td>{item.telefono}</td>
                    <td>{estado?.estado || "No encontrado"}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#0447fb",
                            cursor: "pointer",
                            padding: "4px",
                          }}
                        >
                          <EditSquareIcon fontSize="small" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_cliente)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            padding: "4px",
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Paginación con iconos */}
        {filteredItems.length > itemsPerPage && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '20px',
            gap: '15px'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: currentPage === 1 ? '#ccc' : '#3b82f6'
              }}
            >
              <ArrowBackIosIcon fontSize="medium" />
            </button>
            
            <span style={{ margin: '0 10px' }}>
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: currentPage === totalPages ? '#ccc' : '#3b82f6'
              }}
            >
              <ArrowForwardIosIcon fontSize="medium" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}