import { useState, useEffect } from "react";
import axios from "axios";
import "./DatosBasicos.css";
import DeleteIcon from "@mui/icons-material/Delete";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function TiposUnidades() {
  // Definir el tipo Item para la nueva tabla
  type Item = {
    id_unidad: number;
    nombre: string;
    capacidad: string;
    descripcion: string;
  };

  // Estados
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState<
    Omit<Item, "id_unidad"> & { id_unidad?: number }
  >({
    nombre: "",
    capacidad: "",
    descripcion: "",
  });
  const [busqueda, setBusqueda] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Configuración de la API
  const API_BASE_URL =
    "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "tipo_unidades"; // Cambiar el nombre de la tabla

  // Obtener los datos al cargar el componente
  useEffect(() => {
    fetchItems();
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
      setItems(response.data.records); // Asegúrate de que response.data.records sea un array
    } catch (err) {
      setError("Error al cargar los datos");
      console.error("Error en fetchItems:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el envío del formulario (crear o actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url =
        isEditing && formData.id_unidad
          ? `${API_BASE_URL}/${tableName}/${formData.id_unidad}`
          : `${API_BASE_URL}/${tableName}`;

      const method = isEditing && formData.id_unidad ? "patch" : "post";

      const response = await axios[method](
        url,
        { data: formData },
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
            item.id_unidad === formData.id_unidad ? result : item
          )
        );
      } else {
        setItems([...items, result]);
      }

      // Limpiar el formulario
      setFormData({ nombre: "", capacidad: "", descripcion: "" });
      setIsEditing(false);
    } catch (err) {
      setError("Error al guardar los datos");
      console.error("Error en handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un elemento
  const handleDelete = async (id_unidad: number) => {
    if (window.confirm("¿Estás seguro de eliminar este elemento?")) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/${tableName}/${id_unidad}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Cache-Control": "no-cache",
            apikey: API_KEY,
          },
          timeout: 30000,
        });
        setItems(items.filter((item) => item.id_unidad !== id_unidad));
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
    setIsEditing(true);
  };

  // Filtrar elementos según la búsqueda
  const filteredItems = items.filter(
    (item) =>
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(busqueda.toLowerCase())
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
      <h2>Tipos de Unidades</h2>
      {error && <div className="error-message">{error}</div>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="form">
        {isEditing && (
          <div className="mb-4">
            <label>ID</label>
            <input
              type="text"
              value={formData.id_unidad}
              disabled
              className="input"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Nombre de la unidad:
          </label>
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
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Capacidad:
          </label>
          <input
            type="text"
            value={formData.capacidad}
            onChange={(e) =>
              setFormData({ ...formData, capacidad: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese la capacidad"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Descripción:
          </label>
          <input
            type="text"
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese la descripción"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
            style={{
              backgroundColor: isEditing ? "#0A2D5A " : "#0A2D5A ",
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
              className="button"
              onClick={() => {
                setFormData({ nombre: "", capacidad: "", descripcion: "" });
                setIsEditing(false);
              }}
              style={{
                backgroundColor: isEditing ? "#0A2D5A " : "#0A2D5A ",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "999px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Barra de búsqueda */}
      <div className="search-container">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Buscar en tipos de unidades:
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
            backgroundColor: loading ? "#0A2D5A" : "#0A2D5A",
            float: "right",
            borderRadius: "999px",
            color: "white",
            padding: "10px 20px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Recargando..." : "Recargar Tabla"}
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
      <table className="rodval-table">
    <thead>
      <tr>
        <th>ID Unidad</th>
        <th>Nombre</th>
        <th>Capacidad</th>
        <th>Descripción</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {loading && !currentItems.length ? (
        <tr>
          <td colSpan={5} className="rodval-no-data">
            <div className="rodval-loading-spinner"></div>
            Cargando unidades...
          </td>
        </tr>
      ) : currentItems.length === 0 ? (
        <tr>
          <td colSpan={5} className="rodval-no-data">
            No hay unidades registradas
          </td>
        </tr>
      ) : (
        currentItems.map((item) => (
          <tr key={item.id_unidad}>
            <td>{item.id_unidad}</td>
            <td className="rodval-truncate" title={item.nombre}>
              {item.nombre}
            </td>
            <td>{item.capacidad}</td>
            <td className="rodval-truncate" title={item.descripcion}>
              {item.descripcion || <span className="rodval-empty">Sin descripción</span>}
            </td>
            <td>
              <div className="rodval-actions">
                <button
                  onClick={() => handleEdit(item)}
                  className="rodval-icon-button rodval-edit"
                  title="Editar unidad"
                  disabled={loading}
                >
                  <EditSquareIcon fontSize="small" />
                </button>
                <button
                  onClick={() => handleDelete(item.id_unidad)}
                  className="rodval-icon-button rodval-delete"
                  title="Eliminar unidad"
                  disabled={loading}
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>

        {/* Paginación con iconos */}
        {filteredItems.length > itemsPerPage && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "20px",
              gap: "15px",
            }}
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: currentPage === 1 ? "#ccc" : " #0A2D5A",
              }}
            >
              <ArrowBackIosIcon fontSize="medium" />
            </button>

            <span style={{ margin: "0 10px" }}>
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: currentPage === totalPages ? "#ccc" : " #0A2D5A",
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
