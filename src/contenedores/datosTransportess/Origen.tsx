import { useState, useEffect } from "react";
import axios from "axios";
import "./../DatosBasicos.css";
import Select from "react-select";
import DeleteIcon from "@mui/icons-material/Delete";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function OrigenForm() {
  // Definir tipos de datos
  type Item = {
    id_origen: number;
    origen: string;
    id_zonasDestino: number;
  };

  type ZonaDestino = {
    id_zonasDestino: number;
    nombre: string;
  };

  // Estados
  const [items, setItems] = useState<Item[]>([]);
  const [zonasDestino, setZonasDestino] = useState<ZonaDestino[]>([]);
  const [formData, setFormData] = useState<
    Omit<Item, "id_origen"> & { id_origen?: number }
  >({
    origen: "",
    id_zonasDestino: 0,
  });
  const [busqueda, setBusqueda] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Configuración de la API
  const API_BASE_URL =
    "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "origen";
  const zonasTableName = "zona_destinos";

  // Obtener los datos al cargar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchZonasDestino();
        await fetchItems();
        setDataLoaded(true);
      } catch (err) {
        setError("Error al cargar los datos iniciales");
      }
    };
    loadData();
  }, []);

  // Función para obtener los orígenes
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
      setError("Error al cargar los orígenes");
      console.error("Error en fetchItems:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener las zonas destino
  const fetchZonasDestino = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${zonasTableName}/all`,
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
      setZonasDestino(response.data.records);
    } catch (err) {
      setError("Error al cargar las zonas destino");
      console.error("Error en fetchZonasDestino:", err);
    }
  };

  // Función para recargar todos los datos
  const reloadData = async () => {
    setLoading(true);
    setError("");
    try {
      await fetchZonasDestino();
      await fetchItems();
    } catch (err) {
      setError("Error al recargar datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url =
        isEditing && formData.id_origen
          ? `${API_BASE_URL}/${tableName}/${formData.id_origen}`
          : `${API_BASE_URL}/${tableName}`;

      const method = isEditing && formData.id_origen ? "patch" : "post";

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
            item.id_origen === formData.id_origen ? result : item
          )
        );
      } else {
        setItems([...items, result]);
      }

      // Limpiar el formulario
      setFormData({ origen: "", id_zonasDestino: 0 });
      setIsEditing(false);
    } catch (err) {
      setError("Error al guardar los datos");
      console.error("Error en handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un origen
  const handleDelete = async (id_origen: number) => {
    if (window.confirm("¿Estás seguro de eliminar este origen?")) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/${tableName}/${id_origen}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Cache-Control": "no-cache",
            apikey: API_KEY,
          },
          timeout: 30000,
        });
        setItems(items.filter((item) => item.id_origen !== id_origen));
      } catch (err) {
        setError("Error al eliminar el origen");
        console.error("Error en handleDelete:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para editar un origen
  const handleEdit = (item: Item) => {
    setFormData(item);
    setIsEditing(true);
  };

  // Obtener nombre de zona destino
  const getNombreZonaDestino = (id: number): string => {
    const zona = zonasDestino.find((z) => z.id_zonasDestino === id);
    return zona ? zona.nombre : "No encontrado";
  };

  // Filtrar elementos según la búsqueda
  const filteredItems = items.filter(
    (item) =>
      item.origen.toLowerCase().includes(busqueda.toLowerCase()) ||
      getNombreZonaDestino(item.id_zonasDestino)
        .toLowerCase()
        .includes(busqueda.toLowerCase())
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
      <h2>Orígenes</h2>
      {error && <div className="error-message">{error}</div>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="form">
        {isEditing && (
          <div className="mb-4">
            <label>ID</label>
            <input
              type="text"
              value={formData.id_origen}
              disabled
              className="input"
            />
          </div>
        )}

        <div className="mb-4">
          <label>Origen:</label>
          <input
            type="text"
            name="origen"
            value={formData.origen}
            onChange={handleChange}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el origen"
          />
        </div>

        <div className="mb-4">
          <label>Zona Destino:</label>
          <Select
            options={zonasDestino.map((zona) => ({
              value: zona.id_zonasDestino,
              label: zona.nombre,
            }))}
            value={zonasDestino
              .filter(
                (zona) => zona.id_zonasDestino === formData.id_zonasDestino
              )
              .map((zona) => ({
                value: zona.id_zonasDestino,
                label: zona.nombre,
              }))}
            onChange={(selectedOption) =>
              setFormData({
                ...formData,
                id_zonasDestino: selectedOption?.value || 0,
              })
            }
            placeholder="Seleccione una zona destino"
            className="basic-single"
            classNamePrefix="select"
            isClearable={false}
            isSearchable={true}
            required
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
                setFormData({ origen: "", id_zonasDestino: 0 });
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
        <label>Buscar en orígenes:</label>
        <input
          type="text"
          placeholder="Buscar por origen o zona destino..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* Botón de recargar */}
      <div style={{ overflow: "hidden" }}>
        <button
          onClick={reloadData}
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
              <th>Origen</th>
              <th>Zona Destino</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center">
                  Cargando...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">
                  No hay orígenes disponibles
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.id_origen}>
                  <td>{item.id_origen}</td>
                  <td>{item.origen}</td>
                  <td>{getNombreZonaDestino(item.id_zonasDestino)}</td>
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
                        onClick={() => handleDelete(item.id_origen)}
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
              ))
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
