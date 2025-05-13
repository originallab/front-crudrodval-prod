import { useState, useEffect } from "react";
import axios from "axios";
import "./../DatosBasicos.css";
import Select from "react-select";
import Multiselect from "multiselect-react-dropdown";
import DeleteIcon from "@mui/icons-material/Delete";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DatosBasicosForm() {
  // Definir el tipo Item para la nueva tabla
  type Item = {
    id_transportes: number;
    fecha_registro: string;
    rfc: string;
    direccion: string;
    telefono: string;
    cuenta_bancaria: string;
    cuenta_espejo: string;
    tipo_unidades: number;
    operador: number;
    tarjeta_circulacion: string;
    poliza: string;
  };

  // polizas
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState<
    Omit<Item, "id_transportes"> & { id_transportes?: number }
  >({
    fecha_registro: "",
    rfc: "",
    direccion: "",
    telefono: "",
    cuenta_bancaria: "",
    cuenta_espejo: "",
    tipo_unidades: 0,
    operador: 0,
    tarjeta_circulacion: "",
    poliza: "",
  });
  const [busqueda, setBusqueda] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Datos de las tablas referenciadas
  const [tiposUnidades, setTiposUnidades] = useState<any[]>([]);
  const [operadores, setOperadores] = useState<any[]>([]);
  const [origenes, setOrigenes] = useState<any[]>([]);
  const formattedDate = startDate ? startDate.toISOString().split("T")[0] : "";

  // Paginación mejorada
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Configuración de la API
  const API_BASE_URL =
    "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "transportess";

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
      const [tiposUnidadesRes, operadoresRes, origenesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/tipo_unidades/all`, {
          headers: { apikey: API_KEY },
        }),
        axios.get(`${API_BASE_URL}/operadores/all`, {
          headers: { apikey: API_KEY },
        }),
      ]);

      setTiposUnidades(tiposUnidadesRes.data.records);
      setOperadores(operadoresRes.data.records);
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
        isEditing && formData.id_transportes
          ? `${API_BASE_URL}/${tableName}/${formData.id_transportes}`
          : `${API_BASE_URL}/${tableName}`;

      const method = isEditing && formData.id_transportes ? "patch" : "post";

      // Formatear la fecha correctamente para el envío
      const formattedDate = startDate
        ? startDate.toISOString().split("T")[0]
        : "";

      // Preparar los datos a enviar incluyendo la fecha formateada
      const dataToSend = {
        ...formData,
        fecha_registro: formattedDate,
        id_transportes: isEditing ? formData.id_transportes : undefined,
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
            item.id_transportes === formData.id_transportes ? result : item
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
        rfc: "",
        direccion: "",
        telefono: "",
        cuenta_bancaria: "",
        cuenta_espejo: "",
        tipo_unidades: 0,
        operador: 0,
        tarjeta_circulacion: "",
        poliza: "",
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
  const handleDelete = async (id_transportes: number) => {
    if (window.confirm("¿Estás seguro de eliminar este elemento?")) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/${tableName}/${id_transportes}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Cache-Control": "no-cache",
            apikey: API_KEY,
          },
          timeout: 30000,
        });
        setItems(
          items.filter((item) => item.id_transportes !== id_transportes)
        );
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
    setStartDate(new Date(item.fecha_registro));
    setIsEditing(true);
  };

  // Filtrar elementos según la búsqueda
  const filteredItems = items.filter(
    (item) =>
      item.rfc.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.direccion.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Cálculos para paginación mejorada
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
      <h2>Transportes</h2>
      {error && <div className="error-message">{error}</div>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="form">
        {isEditing && (
          <div className="mb-4">
            <label>ID</label>
            <input
              type="text"
              value={formData.id_transportes}
              disabled
              className="input"
            />
          </div>
        )}

        <div className="mb-4">
          <label>Fecha de Registro:</label>
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
          <label className="block text-gray-700 text-sm font-medium mb-2">
            RFC:
          </label>
          <input
            type="text"
            value={formData.rfc}
            onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el RFC"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Direccion:
          </label>
          <input
            type="text"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingresa la direccion"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Telefono:
          </label>
          <input
            type="text"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingresa el telefono"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Cuenta Bancaria:
          </label>
          <input
            type="text"
            value={formData.cuenta_bancaria}
            onChange={(e) =>
              setFormData({ ...formData, cuenta_bancaria: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese la cuenta bancaria"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Cuenta Espejo:
          </label>
          <input
            type="text"
            value={formData.cuenta_espejo}
            onChange={(e) =>
              setFormData({ ...formData, cuenta_espejo: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese la cuenta espejo"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Tipo de Unidad:
          </label>
          <Select
            options={tiposUnidades.map((item) => ({
              value: item.id_unidad,
              label: item.nombre,
            }))}
            value={tiposUnidades
              .filter((item) => item.id_unidad === formData.tipo_unidades)
              .map((item) => ({ value: item.id_unidad, label: item.nombre }))}
            onChange={(selectedOption) =>
              setFormData({
                ...formData,
                tipo_unidades: selectedOption?.value || 0,
              })
            }
            placeholder="Seleccione el tipo de unidad"
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            classNamePrefix="select"
            isClearable={false}
            isSearchable={true}
            required
          />
        </div>

        <div className="mb-4">
          <label>Operador:</label>
          <Select
            options={operadores.map((item) => ({
              value: item.id_operador,
              label: item.nombre_operador,
            }))}
            value={operadores
              .filter((item) => item.id_operador === formData.operador)
              .map((item) => ({
                value: item.id_operador,
                label: item.nombre_operador,
              }))}
            onChange={(selectedOption) =>
              setFormData({ ...formData, operador: selectedOption?.value || 0 })
            }
            placeholder="Seleccione el operador"
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            classNamePrefix="select"
            isClearable={false}
            isSearchable={true}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Tarjeta de circulación:
          </label>
          <input
            type="text"
            value={formData.tarjeta_circulacion}
            onChange={(e) =>
              setFormData({ ...formData, tarjeta_circulacion: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el numero de la tarjeta de circulacion"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Póliza:
          </label>
          <input
            type="text"
            value={formData.poliza}
            onChange={(e) =>
              setFormData({ ...formData, poliza: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el numero de la poliza"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
            style={{
              backgroundColor: isEditing ? "#0A2D5A " : "#0A2D5A ",
              float: "left",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "999px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Procesando..." : isEditing ? "Actualizar" : "Agregar"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  fecha_registro: "",
                  rfc: "",
                  direccion: "",
                  telefono: "",
                  cuenta_bancaria: "",
                  cuenta_espejo: "",
                  tipo_unidades: 0,
                  operador: 0,
                  tarjeta_circulacion: "",
                  poliza: "",
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
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Buscar en operadores:
        </label>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          required
          className="search-input w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <span className="search-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
      </div>

      {/* Botón de recargar */}
      <div style={{ overflow: "hidden" }}>
        <button
          onClick={fetchItems}
          className="button button-primary"
          disabled={loading}
          style={{
            backgroundColor: isEditing ? "#0A2D5A " : "#0A2D5A ",
            float: "right",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "999px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Recargando..." : "Recargar Tabla"}
        </button>
      </div>

      {/* Tabla */}
  <div className="rodval-table-wrapper">
  <table className="rodval-table">
    <thead>
      <tr>
        <th>ID Transporte</th>
        <th>Fecha Registro</th>
        <th>RFC</th>
        <th>Dirección</th>
        <th>Teléfono</th>
        <th>Cuenta Bancaria</th>
        <th>Cuenta Espejo</th>
        <th>Tipo de Unidad</th>
        <th>Operador</th>
        <th>Tarjeta Circulación</th>
        <th>Póliza</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {loading && !currentItems.length ? (
        <tr>
          <td colSpan={12} className="rodval-no-data">
            <div className="rodval-loading-spinner"></div>
            Cargando transportes...
          </td>
        </tr>
      ) : currentItems.length === 0 ? (
        <tr>
          <td colSpan={12} className="rodval-no-data">
            No hay transportes registrados
          </td>
        </tr>
      ) : (
        currentItems.map((item) => {
          const tipoUnidad = tiposUnidades.find(
            (tu) => tu.id_unidad === Number(item.tipo_unidades)
          );
          const operador = operadores.find(
            (op) => op.id_operador === Number(item.operador)
          );

          return (
            <tr key={item.id_transportes}>
              <td>{item.id_transportes}</td>
              <td>{item.fecha_registro || <span className="rodval-empty">Sin fecha</span>}</td>
              <td className="rodval-truncate" title={item.rfc}>
                {item.rfc || <span className="rodval-empty">Sin RFC</span>}
              </td>
              <td className="rodval-truncate" title={item.direccion}>
                {item.direccion || <span className="rodval-empty">Sin dirección</span>}
              </td>
              <td className="rodval-truncate" title={item.telefono}>
                {item.telefono || <span className="rodval-empty">Sin teléfono</span>}
              </td>
              <td className="rodval-truncate" title={item.cuenta_bancaria}>
                {item.cuenta_bancaria || <span className="rodval-empty">Sin cuenta</span>}
              </td>
              <td className="rodval-truncate" title={item.cuenta_espejo}>
                {item.cuenta_espejo || <span className="rodval-empty">Sin cuenta espejo</span>}
              </td>
              <td className="rodval-truncate" title={tipoUnidad?.nombre}>
                {tipoUnidad?.nombre || <span className="rodval-warning">No asignado</span>}
              </td>
              <td className="rodval-truncate" title={operador?.nombre_operador}>
                {operador?.nombre_operador || <span className="rodval-warning">No asignado</span>}
              </td>
              <td className="rodval-truncate" title={item.tarjeta_circulacion}>
                {item.tarjeta_circulacion || <span className="rodval-warning">No registrada</span>}
              </td>
              <td className="rodval-truncate" title={item.poliza}>
                {item.poliza || <span className="rodval-warning">No registrada</span>}
              </td>
              <td>
                <div className="rodval-actions">
                  <button
                    onClick={() => handleEdit(item)}
                    className="rodval-icon-button rodval-edit"
                    title="Editar transporte"
                    disabled={loading}
                  >
                    <EditSquareIcon fontSize="small" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id_transportes)}
                    className="rodval-icon-button rodval-delete"
                    title="Eliminar transporte"
                    disabled={loading}
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
          <div className="pagination-container">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="pagination-button"
            >
              <ArrowBackIosIcon fontSize="medium" sx={{ color: " #0A2D5A" }} />
            </button>

            <span className="pagination-info">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || loading}
              className="pagination-button"
            >
              <ArrowForwardIosIcon
                fontSize="medium"
                sx={{ color: " #0A2D5A" }}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
