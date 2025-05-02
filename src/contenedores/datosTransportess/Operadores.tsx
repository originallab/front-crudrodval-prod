import { useState, useEffect } from 'react';
import axios from 'axios';
import './../DatosBasicos.css';
import DeleteIcon from "@mui/icons-material/Delete";
import EditSquareIcon from "@mui/icons-material/EditSquare";

export default function Operadores() {
  // Definir el tipo Item para la nueva tabla
  type Item = {
    id_operador: number;
    nombre_operador: string;
    rfc: string;
    telefono: string;
    licencia: string;
    // Puedes cambiar el tipo si es necesario
  };

  // Estados
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState<Omit<Item, 'id_operador'> & { id_operador?: number }>({
    nombre_operador: '',
    rfc: '',
    telefono: '',
    licencia: '',
   
  });
  const [busqueda, setBusqueda] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Configuración de la API
  const API_BASE_URL = "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "operadores"; // Cambiar el nombre de la tabla

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
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'apikey': API_KEY,
        },
        timeout: 30000,
      });
      setItems(response.data.records); // Asegúrate de que response.data.records sea un array
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error en fetchItems:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el envío del formulario (crear o actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing && formData.id_operador
        ? `${API_BASE_URL}/${tableName}/${formData.id_operador}`
        : `${API_BASE_URL}/${tableName}`;

      const method = isEditing && formData.id_operador ? 'patch' : 'post';

      const response = await axios[method](
        url,
        { data: formData },
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

      const result = response.data;
      if (isEditing) {
        setItems(items.map(item => (item.id_operador === formData.id_operador ? result : item)));
      } else {
        setItems([...items, result]);
      }

      // Limpiar el formulario
      setFormData({ nombre_operador: '', rfc: '', telefono: '', licencia: '' });
      setIsEditing(false);
    } catch (err) {
      setError('Error al guardar los datos');
      console.error('Error en handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un elemento
  const handleDelete = async (id_operador: number) => {
    if (window.confirm('¿Estás seguro de eliminar este elemento?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/${tableName}/${id_operador}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'apikey': API_KEY,
          },
          timeout: 30000,
        });
        setItems(items.filter(item => item.id_operador !== id_operador));
      } catch (err) {
        setError('Error al eliminar el elemento');
        console.error('Error en handleDelete:', err);
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
  const filteredItems = items.filter(item =>
    item.nombre_operador.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.rfc.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <h2>Operadores</h2>
      {error && <div className="error-message">{error}</div>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="form">
        {isEditing && (
          <div className="mb-4">
            <label>ID</label>
            <input
              type="text"
              value={formData.id_operador}
              disabled
              className="input"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Nombre del operador:
          </label>
          <input
            type="text"
            value={formData.nombre_operador}
            onChange={(e) => setFormData({ ...formData, nombre_operador: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el nombre del operador"
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
            Teléfono:
          </label>
          <input
            type="text"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el teléfono"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Licencia:
          </label>
          <input
            type="text"
            value={formData.licencia}
            onChange={(e) => setFormData({ ...formData, licencia: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese la licencia"
          />
        </div>

       

        <div className="flex gap-2">
          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? 'Procesando...' : isEditing ? 'Actualizar' : 'Agregar'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setFormData({ nombre_operador: '', rfc: '', telefono: '', licencia: '' });
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
      <div style={{ overflow: 'hidden' }}>
        <button
          onClick={fetchItems}
          className="button button-primary"
          disabled={loading}
          style={{ float: 'right' }} // Mueve el botón a la derecha
        >
          {loading ? 'Recargando...' : 'Recargar Tabla'}
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Operador</th>
              <th>RFC</th>
              <th>Teléfono</th>
              <th>Licencia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center">Cargando...</td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">No hay elementos disponibles</td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id_operador}>
                  <td>{item.id_operador}</td>
                  <td>{item.nombre_operador}</td>
                  <td>{item.rfc}</td>
                  <td>{item.telefono}</td>
                  <td>{item.licencia}</td>
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
                          onMouseOver={(e) =>
                            (e.currentTarget.style.color = "#0447fb")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = "#0447fb")
                          }
                        >
                          <EditSquareIcon fontSize="small" />
                        </button>
                     
                      <button
                        onClick={() => handleDelete(item.id_operador)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.color = "#dc2626")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.color = "#ef4444")
                        }
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
      </div>
    </div>
  );
}