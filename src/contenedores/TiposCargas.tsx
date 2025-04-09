import { useState, useEffect } from 'react';
import axios from 'axios';
import './DatosBasicos.css';
import DeleteIcon from "@mui/icons-material/Delete";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function DatosBasicosForm() {
  // Definir el tipo Item para la nueva tabla
  type Item = {
    id_carga: number;
    tipo: string;
    descripcion: string;
  };

  // Estados
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState<Omit<Item, 'id_carga'> & { id_carga?: number }>({
    tipo: '',
    descripcion: '',
  });
  const [busqueda, setBusqueda] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Configuración de la API
  const API_BASE_URL = "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "tipos_cargas";

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
      setItems(response.data.records);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error en fetchItems:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing && formData.id_carga
        ? `${API_BASE_URL}/${tableName}/${formData.id_carga}`
        : `${API_BASE_URL}/${tableName}`;

      const method = isEditing && formData.id_carga ? 'patch' : 'post';

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
        setItems(items.map(item => (item.id_carga === formData.id_carga ? result : item)));
      } else {
        setItems([...items, result]);
      }

      setFormData({ tipo: '', descripcion: '' });
      setIsEditing(false);
    } catch (err) {
      setError('Error al guardar los datos');
      console.error('Error en handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un elemento
  const handleDelete = async (id_carga: number) => {
    if (window.confirm('¿Estás seguro de eliminar este elemento?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/${tableName}/${id_carga}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'apikey': API_KEY,
          },
          timeout: 30000,
        });
        setItems(items.filter(item => item.id_carga !== id_carga));
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
    item.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
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
      <h2>Tipos de Cargas</h2>
      {error && <div className="error-message">{error}</div>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="form">
        {isEditing && (
          <div className="mb-4">
            <label>ID</label>
            <input
              type="text"
              value={formData.id_carga}
              disabled
              className="input"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Tipo de carga:
          </label>
          <input
            type="text"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el tipo de carga"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Descripción:
          </label>
          <input
            type="text"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
          >
            {loading ? 'Procesando...' : isEditing ? 'Actualizar' : 'Agregar'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setFormData({ tipo: '', descripcion: '' });
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
          Buscar en tipos de cargas:
        </label>
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
      <div style={{ overflow: 'hidden' }}>
        <button
          onClick={fetchItems}
          className="button button-primary"
          disabled={loading}
          style={{ float: 'right' }}
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
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center">Cargando...</td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">No hay elementos disponibles</td>
              </tr>
            ) : (
              currentItems.map(item => (
                <tr key={item.id_carga}>
                  <td>{item.id_carga}</td>
                  <td>{item.tipo}</td>
                  <td>{item.descripcion}</td>
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
                        onClick={() => handleDelete(item.id_carga)}
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

        {/* Paginación mejorada */}
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
              disabled={currentPage === 1}
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
              disabled={currentPage === totalPages}
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