import { useState, useEffect } from 'react';
import axios from 'axios';
import './../DatosBasicos.css';
import Select from 'react-select';
import Multiselect from 'multiselect-react-dropdown';
import DeleteIcon from "@mui/icons-material/Delete";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
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
    destino: string;
    estado: number;
  };

  // Estados
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState<Omit<Item, 'id_transportes'> & { id_transportes?: number }>({
    fecha_registro: '',
    rfc: '',
    direccion: '',
    telefono: '',
    cuenta_bancaria: '',
    cuenta_espejo: '',
    tipo_unidades: 0,
    operador: 0,
    destino: '',
    estado: 0,
  });
  const [busqueda, setBusqueda] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Datos de las tablas referenciadas
  const [tiposUnidades, setTiposUnidades] = useState<any[]>([]);
  const [operadores, setOperadores] = useState<any[]>([]);
  const [origenes, setOrigenes] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const formattedDate = startDate ? startDate.toISOString().split('T')[0] : '';

  // Paginación mejorada
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Configuración de la API
  const API_BASE_URL = "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "transportes";

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

  // Función para obtener datos de las tablas referenciadas
  const fetchReferencedData = async () => {
    try {
      const [tiposUnidadesRes, operadoresRes, origenesRes, estadosRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/tipos_unidades/all`, { headers: { 'apikey': API_KEY } }),
        axios.get(`${API_BASE_URL}/operadores/all`, { headers: { 'apikey': API_KEY } }),
        axios.get(`${API_BASE_URL}/origen/all`, { headers: { 'apikey': API_KEY } }),
        axios.get(`${API_BASE_URL}/estado/all`, { headers: { 'apikey': API_KEY } }),
      ]);

      setTiposUnidades(tiposUnidadesRes.data.records);
      setOperadores(operadoresRes.data.records);
      setOrigenes(origenesRes.data.records);
      setEstados(estadosRes.data.records);
    } catch (err) {
      console.error('Error al cargar datos referenciados:', err);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing && formData.id_transportes
        ? `${API_BASE_URL}/${tableName}/${formData.id_transportes}`
        : `${API_BASE_URL}/${tableName}`;

      const method = isEditing && formData.id_transportes ? 'patch' : 'post';

      // Formatear la fecha correctamente para el envío
      const formattedDate = startDate ? startDate.toISOString().split('T')[0] : '';

      // Preparar los datos a enviar incluyendo la fecha formateada
      const dataToSend = {
        ...formData,
        fecha_registro: formattedDate,
        id_transportes: isEditing ? formData.id_transportes : undefined
      };

      const response = await axios[method](
        url,
        { data: dataToSend },
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
        setItems(items.map(item => (item.id_transportes === formData.id_transportes ? result : item)));
      } else {
        setItems([...items, result]);
      }

      // Recargar datos referenciados
      fetchReferencedData();

      // Limpiar el formulario
      setFormData({
        fecha_registro: '',
        rfc: '',
        direccion: '',
        telefono: '',
        cuenta_bancaria: '',
        cuenta_espejo: '',
        tipo_unidades: 0,
        operador: 0,
        destino: '',
        estado: 0,
      });
      setStartDate(null);
      setIsEditing(false);
    } catch (err) {
      setError('Error al guardar los datos');
      console.error('Error en handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un elemento
  const handleDelete = async (id_transportes: number) => {
    if (window.confirm('¿Estás seguro de eliminar este elemento?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/${tableName}/${id_transportes}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'apikey': API_KEY,
          },
          timeout: 30000,
        });
        setItems(items.filter(item => item.id_transportes !== id_transportes));
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
    setStartDate(new Date(item.fecha_registro));
    setIsEditing(true);
  };

  // Función para obtener nombres de los IDs en el multiselect
  const getDestinoNames = (destinoIds: string) => {
    const ids = destinoIds.split(',').map(Number);
    return origenes
      .filter((origen) => ids.includes(origen.id_origen))
      .map((origen) => origen.origen)
      .join(', ');
  };

  // Filtrar elementos según la búsqueda
  const filteredItems = items.filter(item =>
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
          <label>RFC: </label>
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
          <label>Dirección: </label>
          <input
            type="text"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese la direccion"
          />
        </div>

        <div className="mb-4">
          <label>Teléfono: </label>
          <input
            type="text"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el telefono"
          />
        </div>

        <div className="mb-4">
          <label>Cuenta Bancaria: </label>
          <input
            type="text"
            value={formData.cuenta_bancaria}
            onChange={(e) => setFormData({ ...formData, cuenta_bancaria: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese el telefono"
          />
        </div>

        <div className="mb-4">
          <label>Cuenta Espejo: </label>
          <input
            type="text"
            value={formData.cuenta_espejo}
            onChange={(e) => setFormData({ ...formData, cuenta_espejo: e.target.value })}
            required
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Ingrese la cuenta espejo"
          />
        </div>

        <div className="mb-4">
          <label>Tipo de Unidad</label>
          <Select
            options={tiposUnidades.map((item) => ({ value: item.id_unidad, label: item.nombre }))}
            onChange={(selectedOption) =>
              setFormData({ ...formData, tipo_unidades: selectedOption?.value || 0 })
            }
            placeholder="Seleccione el tipo de unidad"
          />
        </div>

        <div className="mb-4">
          <label>Operador</label>
          <Select
            options={operadores.map((item) => ({ value: item.id_operador, label: item.nombre_operador }))}
            onChange={(selectedOption) =>
              setFormData({ ...formData, operador: selectedOption?.value || 0 })
            }
            placeholder="Seleccione el operador"
          />
        </div>

        <div className="mb-4">
          <label>Destino</label>
          <Multiselect
            options={origenes.map((item) => ({ value: item.id_origen, label: item.origen }))}
            selectedValues={formData.destino
              .split(',')
              .map((id) => origenes.find((origen) => origen.id_origen === Number(id)))
              .filter(Boolean)
              .map((origen) => ({ value: origen.id_origen, label: origen.origen }))}
            onSelect={(selectedList) =>
              setFormData({ ...formData, destino: selectedList.map((item: {value: string}) => item.value).join(',') })
            }
            onRemove={(selectedList) =>
              setFormData({ ...formData, destino: selectedList.map((item: {value: string}) => item.value).join(',') })
            }
            displayValue="label"
            placeholder="Seleccione los destinos"
            showCheckbox
            closeIcon="circle"
          />
        </div>

        <div className="mb-4">
          <label>Estado</label>
          <Select
            options={estados.map((item) => ({ value: item.id_estado, label: item.estado }))}
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
            {loading ? 'Procesando...' : isEditing ? 'Actualizar' : 'Agregar'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  fecha_registro: '',
                  rfc: '',
                  direccion: '',
                  telefono: '',
                  cuenta_bancaria: '',
                  cuenta_espejo: '',
                  tipo_unidades: 0,
                  operador: 0,
                  destino: '',
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
        <label>Buscar en transportes:</label>
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
              <th>Fecha de Registro</th>
              <th>RFC</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Cuenta Bancaria</th>
              <th>Cuenta Espejo</th>
              <th>Tipo de Unidad</th>
              <th>Operador</th>
              <th>Destino</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} className="text-center">Cargando...</td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center">No hay elementos disponibles</td>
              </tr>
            ) : (
              currentItems.map((item) => {
                const tipoUnidad = tiposUnidades.find((tu) => tu.id_unidad === Number(item.tipo_unidades));
                const operador = operadores.find((op) => op.id_operador === Number(item.operador));
                const estado = estados.find((es) => es.id_estado === Number(item.estado));

                return (
                  <tr key={item.id_transportes}>
                    <td>{item.id_transportes}</td>
                    <td>{item.fecha_registro}</td>
                    <td>{item.rfc}</td>
                    <td>{item.direccion}</td>
                    <td>{item.telefono}</td>
                    <td>{item.cuenta_bancaria}</td>
                    <td>{item.cuenta_espejo}</td>
                    <td>{tipoUnidad?.nombre || 'No encontrado'}</td>
                    <td>{operador?.nombre_operador || 'No encontrado'}</td>
                    <td>{getDestinoNames(item.destino)}</td>
                    <td>{estado?.estado || 'No encontrado'}</td>
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
                          onClick={() => handleDelete(item.id_transportes)}
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
                );
              })
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