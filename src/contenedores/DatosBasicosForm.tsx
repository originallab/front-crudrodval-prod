import { useState, useEffect } from 'react';
import axios from 'axios';
import './DatosBasicos.css';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import DeleteIcon from "@mui/icons-material/Delete";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';


export default function DatosBasicosForm() {
  type Item = {
    id_zonasdestino: number;
    nombre: string;
    descripcion: string;
  };

  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState<Omit<Item, 'id_zonasdestino'> & { id_zonasdestino?: number }>({
    nombre: '',
    descripcion: '',
  });
  const [busqueda, setBusqueda] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const API_BASE_URL = "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "zonas_destinos";

  useEffect(() => {
    fetchItems();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing && formData.id_zonasdestino
        ? `${API_BASE_URL}/${tableName}/${formData.id_zonasdestino}`
        : `${API_BASE_URL}/${tableName}`;

      const method = isEditing && formData.id_zonasdestino ? 'patch' : 'post';

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
        setItems(items.map(item => (item.id_zonasdestino === formData.id_zonasdestino ? result : item)));
      } else {
        setItems([...items, result]);
      }

      setFormData({ nombre: '', descripcion: '' });
      setIsEditing(false);
    } catch (err) {
      setError('Error al guardar los datos');
      console.error('Error en handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id_zonasdestino: number) => {
    if (window.confirm('¿Estás seguro de eliminar este elemento?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/${tableName}/${id_zonasdestino}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'apikey': API_KEY,
          },
          timeout: 30000,
        });
        setItems(items.filter(item => item.id_zonasdestino !== id_zonasdestino));
      } catch (err) {
        setError('Error al eliminar el elemento');
        console.error('Error en handleDelete:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (item: Item) => {
    setFormData(item);
    setIsEditing(true);
  };

  const filteredItems = items.filter(item =>
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
      <h2>Zonas de Destino</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        {isEditing && (
          <div className="mb-4">
            <label>ID</label>
            <input
              type="text"
              value={formData.id_zonasdestino}
              disabled
              className="input"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Nombre de la zona:
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el nombre"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Descripcion de la zona:
          </label>
          <input
            type="text"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese la descripcion"
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
                setFormData({ nombre: '', descripcion: '' });
                setIsEditing(false);
              }}
              className="button button-secondary"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="search-container">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Buscar en zonas de destino
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

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
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
                <tr key={item.id_zonasdestino}>
                  <td>{item.id_zonasdestino}</td>
                  <td>{item.nombre}</td>
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
                        onClick={() => handleDelete(item.id_zonasdestino)}
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

        {/* Paginación con iconos */}
        {filteredItems.length > itemsPerPage && (
  <div className="pagination-container">
    <button
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1 || loading}
      className="pagination-button"
    >
      <ArrowBackIosIcon fontSize="medium" sx={{ color: '#3b82f6' }} />
    </button>
    
    <span className="pagination-info">
      Página {currentPage} de {totalPages}
    </span>
    
    <button
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages || loading}
      className="pagination-button"
    >
      <ArrowForwardIosIcon fontSize="medium" sx={{ color: '#3b82f6' }} />
    </button>
  </div>
)}
      </div>
    </div>
  );
}