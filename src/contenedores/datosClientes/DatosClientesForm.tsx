import { useState, useEffect } from "react";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "./DatosClientes.css";
import banner from '../../assets/images/BannerRodval.png';

// Definición del tipo Proveedor con todos los campos en una sola tabla
type Proveedor = {
  id_proveedor?: number;
  nombre_razon_social: string;
  rfc: string;
  direccion: string;
  pais: string;
  codigo_postal: string;
  ciudad: string;
  estado: string;
  unidades_propias: boolean;
  cuenta_espejo_gps: boolean;
  
  // Contacto 1
  contacto1_nombre: string;
  contacto1_apellido: string;
  contacto1_telefono: string;
  contacto1_correo: string;
  contacto1_puesto: string;
  
  // Contacto 2
  contacto2_nombre: string;
  contacto2_apellido: string;
  contacto2_telefono: string;
  contacto2_correo: string;
  contacto2_puesto: string;
  
  // Datos bancarios
  beneficiario: string;
  banco: string;
  clave_bancaria: string;
  cuenta_bancaria: string;
  
  // Referencia comercial 1
  ref1_empresa: string;
  ref1_domicilio: string;
  ref1_pais: string;
  ref1_ciudad: string;
  ref1_estado: string;
  ref1_codigo_postal: string;
  ref1_telefono: string;
  ref1_contacto: string;
  ref1_puesto: string;
  ref1_relacion_comercial_desde: string;
  
  // Referencia comercial 2
  ref2_empresa: string;
  ref2_domicilio: string;
  ref2_pais: string;
  ref2_ciudad: string;
  ref2_estado: string;
  ref2_codigo_postal: string;
  ref2_telefono: string;
  ref2_contacto: string;
  ref2_puesto: string;
  ref2_relacion_comercial_desde: string;
  
  fecha_creacion?: string;
  fecha_actualizacion?: string;
};

export default function DatosClientesForm() {
  // Estado del formulario con todos los campos
  const [formData, setFormData] = useState<Proveedor>({
    nombre_razon_social: "",
    rfc: "",
    direccion: "",
    pais: "",
    codigo_postal: "",
    ciudad: "",
    estado: "",
    unidades_propias: false,
    cuenta_espejo_gps: false,
    
    // Contactos
    contacto1_nombre: "",
    contacto1_apellido: "",
    contacto1_telefono: "",
    contacto1_correo: "",
    contacto1_puesto: "",
    
    contacto2_nombre: "",
    contacto2_apellido: "",
    contacto2_telefono: "",
    contacto2_correo: "",
    contacto2_puesto: "",
    
    // Datos bancarios
    beneficiario: "",
    banco: "",
    clave_bancaria: "",
    cuenta_bancaria: "",
    
    // Referencias
    ref1_empresa: "",
    ref1_domicilio: "",
    ref1_pais: "",
    ref1_ciudad: "",
    ref1_estado: "",
    ref1_codigo_postal: "",
    ref1_telefono: "",
    ref1_contacto: "",
    ref1_puesto: "",
    ref1_relacion_comercial_desde: "",
    
    ref2_empresa: "",
    ref2_domicilio: "",
    ref2_pais: "",
    ref2_ciudad: "",
    ref2_estado: "",
    ref2_codigo_postal: "",
    ref2_telefono: "",
    ref2_contacto: "",
    ref2_puesto: "",
    ref2_relacion_comercial_desde: ""
  });

  // Estados para la tabla de proveedores1
  const [proveedores1, setproveedores1] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Configuración de la API
  const API_BASE_URL = "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";

  // Obtener proveedores1
  const fetchproveedores1 = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/proveedores1/all`, {
        headers: { apikey: API_KEY },
      });
      setproveedores1(response.data.records);
      console.log("Datos recibidos:", response.data.records);
    } catch (err) {
      setError("Error al cargar proveedores1");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Manejador de cambios para todos los campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Manejador de cambios para campos de fecha
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && formData.id_proveedor) {
        // Actualizar proveedor existente
        await axios.put(
          `${API_BASE_URL}/proveedores1/${formData.id_proveedor}`,
          { data: formData },
          { headers: { apikey: API_KEY } }
        );
      } else {
        // Crear nuevo proveedor
        await axios.post(
          `${API_BASE_URL}/proveedores1`,
          { data: formData },
          { headers: { apikey: API_KEY } }
        );
      }

      await fetchproveedores1();
      resetForm();
      setShowTable(true);
      alert(`Proveedor ${isEditing ? 'actualizado' : 'creado'} con éxito!`);
    } catch (error) {
      console.error("Error:", error);
      setError(`Error al guardar: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre_razon_social: "",
      rfc: "",
      direccion: "",
      pais: "",
      codigo_postal: "",
      ciudad: "",
      estado: "",
      unidades_propias: false,
      cuenta_espejo_gps: false,
      
      // Contactos
      contacto1_nombre: "",
      contacto1_apellido: "",
      contacto1_telefono: "",
      contacto1_correo: "",
      contacto1_puesto: "",
      
      contacto2_nombre: "",
      contacto2_apellido: "",
      contacto2_telefono: "",
      contacto2_correo: "",
      contacto2_puesto: "",
      
      // Datos bancarios
      beneficiario: "",
      banco: "",
      clave_bancaria: "",
      cuenta_bancaria: "",
      
      // Referencias
      ref1_empresa: "",
      ref1_domicilio: "",
      ref1_pais: "",
      ref1_ciudad: "",
      ref1_estado: "",
      ref1_codigo_postal: "",
      ref1_telefono: "",
      ref1_contacto: "",
      ref1_puesto: "",
      ref1_relacion_comercial_desde: "",
      
      ref2_empresa: "",
      ref2_domicilio: "",
      ref2_pais: "",
      ref2_ciudad: "",
      ref2_estado: "",
      ref2_codigo_postal: "",
      ref2_telefono: "",
      ref2_contacto: "",
      ref2_puesto: "",
      ref2_relacion_comercial_desde: ""
    });
    setIsEditing(false);
  };

  // Editar proveedor
  const handleEdit = (proveedor: Proveedor) => {
    setFormData(proveedor);
    setIsEditing(true);
    setShowTable(false);
    window.scrollTo(0, 0);
  };

  // Eliminar proveedor
  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este proveedor?")) {
      try {
        await axios.delete(`${API_BASE_URL}/proveedores1/${id}`, {
          headers: { apikey: API_KEY },
        });
        fetchproveedores1();
      } catch (err) {
        setError("Error al eliminar proveedor");
        console.error(err);
      }
    }
  };

  // Paginación
  const filteredItems = proveedores1.filter(
    (item) =>
      item.nombre_razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.rfc.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Efectos
  useEffect(() => {
    if (showTable) {
      fetchproveedores1();
    }
  }, [showTable]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  return (
    <div className="rodval-container">
      {/* Encabezado */}
      <div className="rodval-header">
        <img 
          src={banner} 
          alt="Banner Rodval"
          style={{ 
            width: '100%',
            maxHeight: '200px',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Botón para mostrar/ocultar tabla */}
      <div className="rodval-table-toggle">
        <button
          onClick={() => setShowTable(!showTable)}
          className={`rodval-button ${
            showTable ? "rodval-button-secondary" : "rodval-button-primary"
          }`}
          style={{
            backgroundColor: isEditing ? "#0A2D5A" : "#0A2D5A",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "999px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {showTable ? (
            <>
              <CloseIcon fontSize="small" /> Ocultar Tabla
            </>
          ) : (
            <>
              <VisibilityIcon fontSize="small" /> Ver Tabla de proveedores1
            </>
          )}
        </button>
      </div>

      {/* Tabla de proveedores1 */}
      {showTable && (
        <div className="rodval-table-container">
          {/* Búsqueda y recargar */}
          <div className="rodval-table-controls">
            <input
              type="text"
              placeholder="Buscar por nombre o RFC..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="rodval-search-input"
            />
            <button
              onClick={fetchproveedores1}
              className="rodval-button rodval-button-primary"
              disabled={loading}
              style={{
                backgroundColor: isEditing ? "#0A2D5A" : "#0A2D5A",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "999px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Cargando..." : "Recargar"}
            </button>
          </div>

          {/* Tabla */}
          <div className="rodval-table-wrapper">
            <table className="rodval-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre/Razón Social</th>
                  <th>RFC</th>
                  <th>Dirección</th>
                  <th>Contacto 1</th>
                  <th>Teléfono</th>
                  <th>Banco</th>
                  <th>Cuenta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id_proveedor}>
                      <td>{item.id_proveedor}</td>
                      <td>{item.nombre_razon_social}</td>
                      <td>{item.rfc}</td>
                      <td>{item.direccion}</td>
                      <td>{item.contacto1_nombre} {item.contacto1_apellido}</td>
                      <td>{item.contacto1_telefono}</td>
                      <td>{item.banco}</td>
                      <td>{item.cuenta_bancaria}</td>
                      <td>
                        <div className="rodval-actions">
                          <button
                            onClick={() => handleEdit(item)}
                            className="rodval-icon-button rodval-edit"
                            title="Editar"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                          <button
                            onClick={() =>
                              item.id_proveedor && handleDelete(item.id_proveedor)
                            }
                            className="rodval-icon-button rodval-delete"
                            title="Eliminar"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="rodval-no-data">
                      {loading
                        ? "Cargando..."
                        : "No se encontraron proveedores1"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
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
                  color: currentPage === 1 ? "#ccc" : "#0A2D5A",
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
                  color: currentPage === totalPages ? "#ccc" : "#0A2D5A",
                }}
              >
                <ArrowForwardIosIcon fontSize="medium" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Formulario de Alta Proveedor */}
      {!showTable && (
        <form onSubmit={handleSubmit} className="rodval-form">
          {/* DOCUMENTOS REQUERIDOS */}
          <div className="rodval-section">
            <h2 className="rodval-section-title">DOCUMENTOS REQUERIDOS</h2>
            <div className="rodval-documents-info">
              <p>
                A continuación se listan los documentos necesarios para el
                registro del proveedor:
              </p>
              <ul className="rodval-documents-list">
                <li>
                  <span className="rodval-required">*</span> COMPROBANTE DE
                  DOMICILIO
                </li>
                <li>
                  <span className="rodval-required">*</span> ID REPRESENTANTE
                  LEGAL
                </li>
                <li>
                  <span className="rodval-required">*</span> CARATURA A BANCARIA
                </li>
                <li>
                  <span className="rodval-required">*</span> CONSTANCIA
                  SITUACION FISCAL (ACTUAL)
                </li>
                <li>
                  <span className="rodval-required">*</span> OPINION POSITIVA
                  RECIENTE
                </li>
              </ul>
              <p className="rodval-note">
                Nota: Estos documentos deben ser entregados físicamente o por
                correo electrónico.
              </p>
            </div>
          </div>

          {/* INFORMACIÓN GENERAL */}
          <div className="rodval-section">
            <h2 className="rodval-section-title">INFORMACIÓN GENERAL</h2>

            <div className="rodval-form-row">
              <div className="rodval-form-group">
                <label className="rodval-label">NOMBRE / RAZÓN SOCIAL</label>
                <input
                  type="text"
                  name="nombre_razon_social"
                  value={formData.nombre_razon_social}
                  onChange={handleInputChange}
                  required
                  className="rodval-input"
                />
              </div>
              <div className="rodval-form-group">
                <label className="rodval-label">RFC</label>
                <input
                  type="text"
                  name="rfc"
                  value={formData.rfc}
                  onChange={handleInputChange}
                  required
                  className="rodval-input"
                />
              </div>
            </div>

            <div className="rodval-form-group">
              <label className="rodval-label">DIRECCIÓN</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                required
                className="rodval-input"
              />
            </div>

            <div className="rodval-form-row rodval-form-row-4">
              <div className="rodval-form-group">
                <label className="rodval-label">PAÍS</label>
                <input
                  type="text"
                  name="pais"
                  value={formData.pais}
                  onChange={handleInputChange}
                  required
                  className="rodval-input"
                />
              </div>
              <div className="rodval-form-group">
                <label className="rodval-label">CÓDIGO POSTAL</label>
                <input
                  type="text"
                  name="codigo_postal"
                  value={formData.codigo_postal}
                  onChange={handleInputChange}
                  required
                  className="rodval-input"
                />
              </div>
              <div className="rodval-form-group">
                <label className="rodval-label">CIUDAD</label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  required
                  className="rodval-input"
                />
              </div>
              <div className="rodval-form-group">
                <label className="rodval-label">ESTADO</label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                  className="rodval-input"
                />
              </div>
            </div>
          </div>

          {/* UNIDADES PROPIAS Y CUENTA ESPEJO GPS */}
          <div className="rodval-section">
            <h2 className="rodval-section-title">CONFIGURACIÓN</h2>
            <div className="rodval-checkbox-group">
              <label className="rodval-checkbox">
                <input
                  type="checkbox"
                  name="unidades_propias"
                  checked={formData.unidades_propias}
                  onChange={handleInputChange}
                />
                <span>
                  UNIDADES PROPIAS: {formData.unidades_propias ? "SÍ" : "NO"}
                </span>
              </label>
              <label className="rodval-checkbox">
                <input
                  type="checkbox"
                  name="cuenta_espejo_gps"
                  checked={formData.cuenta_espejo_gps}
                  onChange={handleInputChange}
                />
                <span>
                  CUENTA ESPEJO GPS: {formData.cuenta_espejo_gps ? "SÍ" : "NO"}
                </span>
              </label>
            </div>
          </div>

          {/* INFORMACIÓN DE CONTACTOS */}
          <div className="rodval-section">
            <h2 className="rodval-section-title">
              INFORMACIÓN DE CONTACTOS (2)
            </h2>

            {/* Contacto 1 */}
            <div className="rodval-contact-card">
              <h3 className="rodval-contact-title">Contacto 1</h3>

              <div className="rodval-form-row rodval-form-row-5">
                <div className="rodval-form-group">
                  <label className="rodval-label">NOMBRE(S)</label>
                  <input
                    type="text"
                    name="contacto1_nombre"
                    value={formData.contacto1_nombre}
                    onChange={handleInputChange}
                    required
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">APELLIDO</label>
                  <input
                    type="text"
                    name="contacto1_apellido"
                    value={formData.contacto1_apellido}
                    onChange={handleInputChange}
                    required
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">TELÉFONO</label>
                  <input
                    type="text"
                    name="contacto1_telefono"
                    value={formData.contacto1_telefono}
                    onChange={handleInputChange}
                    required
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">CORREO</label>
                  <input
                    type="email"
                    name="contacto1_correo"
                    value={formData.contacto1_correo}
                    onChange={handleInputChange}
                    required
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">PUESTO</label>
                  <input
                    type="text"
                    name="contacto1_puesto"
                    value={formData.contacto1_puesto}
                    onChange={handleInputChange}
                    required
                    className="rodval-input"
                  />
                </div>
              </div>
            </div>

            {/* Contacto 2 */}
            <div className="rodval-contact-card">
              <h3 className="rodval-contact-title">Contacto 2</h3>

              <div className="rodval-form-row rodval-form-row-5">
                <div className="rodval-form-group">
                  <label className="rodval-label">NOMBRE(S)</label>
                  <input
                    type="text"
                    name="contacto2_nombre"
                    value={formData.contacto2_nombre}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">APELLIDO</label>
                  <input
                    type="text"
                    name="contacto2_apellido"
                    value={formData.contacto2_apellido}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">TELÉFONO</label>
                  <input
                    type="text"
                    name="contacto2_telefono"
                    value={formData.contacto2_telefono}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">CORREO</label>
                  <input
                    type="email"
                    name="contacto2_correo"
                    value={formData.contacto2_correo}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">PUESTO</label>
                  <input
                    type="text"
                    name="contacto2_puesto"
                    value={formData.contacto2_puesto}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DATOS BANCARIOS */}
          <div className="rodval-section">
            <h2 className="rodval-section-title">DATOS BANCARIOS</h2>

            <div className="rodval-form-row">
              <div className="rodval-form-group">
                <label className="rodval-label">BENEFICIARIO</label>
                <input
                  type="text"
                  name="beneficiario"
                  value={formData.beneficiario}
                  onChange={handleInputChange}
                  required
                  className="rodval-input"
                />
              </div>
              <div className="rodval-form-group">
                <label className="rodval-label">BANCO</label>
                <input
                  type="text"
                  name="banco"
                  value={formData.banco}
                  onChange={handleInputChange}
                  required
                  className="rodval-input"
                />
              </div>
            </div>

            <div className="rodval-form-row">
              <div className="rodval-form-group">
                <label className="rodval-label">CLAVE</label>
                <input
                  type="text"
                  name="clave_bancaria"
                  value={formData.clave_bancaria}
                  onChange={handleInputChange}
                  required
                  className="rodval-input"
                />
              </div>
              <div className="rodval-form-group">
                <label className="rodval-label">CUENTA</label>
                <input
                  type="text"
                  name="cuenta_bancaria"
                  value={formData.cuenta_bancaria}
                  onChange={handleInputChange}
                  required
                  className="rodval-input"
                />
              </div>
            </div>
          </div>

          {/* REFERENCIAS COMERCIALES */}
          
          {/* Referencia Comercial 1 */}
          <div className="rodval-section">
            <h2 className="rodval-section-title">
              REFERENCIA COMERCIAL 1
            </h2>

            <div className="rodval-reference-card">
              <div className="rodval-form-row">
                <div className="rodval-form-group">
                  <label className="rodval-label">EMPRESA</label>
                  <input
                    type="text"
                    name="ref1_empresa"
                    value={formData.ref1_empresa}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">DOMICILIO</label>
                  <input
                    type="text"
                    name="ref1_domicilio"
                    value={formData.ref1_domicilio}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
              </div>

              <div className="rodval-form-row rodval-form-row-5">
                <div className="rodval-form-group">
                  <label className="rodval-label">PAÍS</label>
                  <input
                    type="text"
                    name="ref1_pais"
                    value={formData.ref1_pais}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">CIUDAD</label>
                  <input
                    type="text"
                    name="ref1_ciudad"
                    value={formData.ref1_ciudad}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">ESTADO</label>
                  <input
                    type="text"
                    name="ref1_estado"
                    value={formData.ref1_estado}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">CÓDIGO POSTAL</label>
                  <input
                    type="text"
                    name="ref1_codigo_postal"
                    value={formData.ref1_codigo_postal}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">TELÉFONO</label>
                  <input
                    type="text"
                    name="ref1_telefono"
                    value={formData.ref1_telefono}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
              </div>

              <div className="rodval-form-row">
                <div className="rodval-form-group">
                  <label className="rodval-label">CONTACTO</label>
                  <input
                    type="text"
                    name="ref1_contacto"
                    value={formData.ref1_contacto}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">PUESTO</label>
                  <input
                    type="text"
                    name="ref1_puesto"
                    value={formData.ref1_puesto}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">
                    RELACIÓN COMERCIAL DESDE
                  </label>
                  <input
                    type="date"
                    name="ref1_relacion_comercial_desde"
                    value={formData.ref1_relacion_comercial_desde}
                    onChange={handleDateChange}
                    className="rodval-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Referencia Comercial 2 */}
          <div className="rodval-section">
            <h2 className="rodval-section-title">
              REFERENCIA COMERCIAL 2
            </h2>

            <div className="rodval-reference-card">
              <div className="rodval-form-row">
                <div className="rodval-form-group">
                  <label className="rodval-label">EMPRESA</label>
                  <input
                    type="text"
                    name="ref2_empresa"
                    value={formData.ref2_empresa}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">DOMICILIO</label>
                  <input
                    type="text"
                    name="ref2_domicilio"
                    value={formData.ref2_domicilio}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
              </div>

              <div className="rodval-form-row rodval-form-row-5">
                <div className="rodval-form-group">
                  <label className="rodval-label">PAÍS</label>
                  <input
                    type="text"
                    name="ref2_pais"
                    value={formData.ref2_pais}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">CIUDAD</label>
                  <input
                    type="text"
                    name="ref2_ciudad"
                    value={formData.ref2_ciudad}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">ESTADO</label>
                  <input
                    type="text"
                    name="ref2_estado"
                    value={formData.ref2_estado}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">CÓDIGO POSTAL</label>
                  <input
                    type="text"
                    name="ref2_codigo_postal"
                    value={formData.ref2_codigo_postal}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">TELÉFONO</label>
                  <input
                    type="text"
                    name="ref2_telefono"
                    value={formData.ref2_telefono}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
              </div>

              <div className="rodval-form-row">
                <div className="rodval-form-group">
                  <label className="rodval-label">CONTACTO</label>
                  <input
                    type="text"
                    name="ref2_contacto"
                    value={formData.ref2_contacto}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">PUESTO</label>
                  <input
                    type="text"
                    name="ref2_puesto"
                    value={formData.ref2_puesto}
                    onChange={handleInputChange}
                    className="rodval-input"
                  />
                </div>
                <div className="rodval-form-group">
                  <label className="rodval-label">
                    RELACIÓN COMERCIAL DESDE
                  </label>
                  <input
                    type="date"
                    name="ref2_relacion_comercial_desde"
                    value={formData.ref2_relacion_comercial_desde}
                    onChange={handleDateChange}
                    className="rodval-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones del formulario */}
          <div className="rodval-form-actions">
            <button
              type="submit"
              className="rodval-button rodval-button-primary"
              disabled={loading}
            >
              {loading
                ? "Procesando..."
                : isEditing
                ? "Actualizar Proveedor"
                : "Agregar Proveedor"}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="rodval-button rodval-button-secondary"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}