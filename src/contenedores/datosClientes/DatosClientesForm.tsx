import { useState, useEffect } from "react";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "./DatosClientes.css";

// Definición de tipos TypeScript
type Contacto = {
  id_contacto?: number;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  puesto: string;
  [key: string]: string | number | undefined;
};

type DatosBancarios = {
  id_datos_bancarios?: number;
  beneficiario: string;
  banco: string;
  clave: string;
  cuenta: string;
};

type ReferenciaComercial = {
  id_referencia?: number;
  empresa: string;
  domicilio: string;
  pais: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  telefono: string;
  contacto: string;
  puesto: string;
  relacion_comercial_desde: string;
  [key: string]: string | number | undefined;
};

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
  created_at?: string;
  update_at?: string;
};

export default function AltaProveedorForm() {
  // Estados del formulario
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
  });

  const [contactos, setContactos] = useState<Contacto[]>([
    { nombre: "", apellido: "", telefono: "", correo: "", puesto: "" },
    { nombre: "", apellido: "", telefono: "", correo: "", puesto: "" },
  ]);

  const [datosBancarios, setDatosBancarios] = useState<DatosBancarios>({
    beneficiario: "",
    banco: "",
    clave: "",
    cuenta: "",
  });

  const [referencias, setReferencias] = useState<ReferenciaComercial[]>([
    {
      empresa: "",
      domicilio: "",
      pais: "",
      ciudad: "",
      estado: "",
      codigo_postal: "",
      telefono: "",
      contacto: "",
      puesto: "",
      relacion_comercial_desde: "",
    },
    {
      empresa: "",
      domicilio: "",
      pais: "",
      ciudad: "",
      estado: "",
      codigo_postal: "",
      telefono: "",
      contacto: "",
      puesto: "",
      relacion_comercial_desde: "",
    },
  ]);

  // Estados para la tabla de proveedores
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Configuración de la API
  const API_BASE_URL =
    "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";

  // Obtener proveedores
  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/proveedores/all`, {
        headers: { apikey: API_KEY },
      });
      setProveedores(response.data.records);
    } catch (err) {
      setError("Error al cargar proveedores");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Manejadores de cambios
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContactoChange = (
    index: number,
    field: keyof Contacto,
    value: string
  ) => {
    const updatedContactos = [...contactos];
    updatedContactos[index][field] = value;
    setContactos(updatedContactos);
  };

  const handleDatosBancariosChange = (
    field: keyof DatosBancarios,
    value: string
  ) => {
    setDatosBancarios((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReferenciaChange = (
    index: number,
    field: keyof ReferenciaComercial,
    value: string
  ) => {
    const updatedReferencias = [...referencias];
    updatedReferencias[index][field] = value;
    setReferencias(updatedReferencias);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Guardar PROVEEDOR (POST)
      const proveedorResponse = await axios.post(
        `${API_BASE_URL}/proveedores`,
        {
          data: formData,
        },
        {
          headers: { apikey: API_KEY },
        }
      );

      console.log("Respuesta del servidor:", proveedorResponse.data); // ¡VERIFICA ESTO!

      /* 
        Si el servidor no devuelve id_proveedor en la respuesta, hay dos opciones:
        A) El ID viene en otro campo (revisa el console.log)
        B) Necesitas hacer un GET para obtener el proveedor recién creado
      */

      // Opción A: Si el ID viene en otro campo (ej. 'id')
      let proveedorId =
        proveedorResponse.data.id_proveedor || proveedorResponse.data.id;

      if (!proveedorId) {
        // Opción B: Obtener el último proveedor creado (solución alternativa)
        const lastProveedor = await axios.get(
          `${API_BASE_URL}/proveedores/last`,
          {
            headers: { apikey: API_KEY },
          }
        );
        proveedorId = lastProveedor.data.id_proveedor;
      }

      if (!proveedorId)
        throw new Error("No se pudo obtener el ID del proveedor");

      // 2. Guardar CONTACTOS
      for (const contacto of contactos) {
        if (contacto.nombre.trim() !== "") {
          await axios.post(
            `${API_BASE_URL}/contactos_proveedores`,
            {
              data: {
                ...contacto,
                id_proveedor: proveedorId,
              },
            },
            {
              headers: { apikey: API_KEY },
            }
          );
        }
      }

      // 3. Guardar DATOS BANCARIOS
      if (datosBancarios.beneficiario.trim() !== "") {
        await axios.post(
          `${API_BASE_URL}/datos_bancarios_proveedores`,
          {
            data: {
              ...datosBancarios,
              id_proveedor: proveedorId,
            },
          },
          {
            headers: { apikey: API_KEY },
          }
        );
      }

      // 4. Guardar REFERENCIAS
      for (const referencia of referencias) {
        if (referencia.empresa.trim() !== "") {
          await axios.post(
            `${API_BASE_URL}/referencias_comerciales_proveedores`,
            {
              data: {
                ...referencia,
                id_proveedor: proveedorId,
              },
            },
            {
              headers: { apikey: API_KEY },
            }
          );
        }
      }

      // Actualización final
      await fetchProveedores();
      resetForm();
      setShowTable(true);
      alert("¡Registro completado con éxito!");
    } catch (error) {
      console.error("Error completo:", {
        message: error.message,
        response: error.response?.data,
      });
      setError(
        `Error al guardar: ${error.response?.data?.detail || error.message}`
      );
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
    });
    setContactos([
      { nombre: "", apellido: "", telefono: "", correo: "", puesto: "" },
      { nombre: "", apellido: "", telefono: "", correo: "", puesto: "" },
    ]);
    setDatosBancarios({
      beneficiario: "",
      banco: "",
      clave: "",
      cuenta: "",
    });
    setReferencias([
      {
        empresa: "",
        domicilio: "",
        pais: "",
        ciudad: "",
        estado: "",
        codigo_postal: "",
        telefono: "",
        contacto: "",
        puesto: "",
        relacion_comercial_desde: "",
      },
      {
        empresa: "",
        domicilio: "",
        pais: "",
        ciudad: "",
        estado: "",
        codigo_postal: "",
        telefono: "",
        contacto: "",
        puesto: "",
        relacion_comercial_desde: "",
      },
    ]);
    setIsEditing(false);
  };

  // Editar proveedor
  const handleEdit = async (proveedor: Proveedor) => {
    setLoading(true);
    try {
      // Obtener datos relacionados
      const [contactosRes, bancariosRes, referenciasRes] = await Promise.all([
        axios.get(
          `${API_BASE_URL}/contactos?proveedorId=${proveedor.id_proveedor}`,
          {
            headers: { apikey: API_KEY },
          }
        ),
        axios.get(
          `${API_BASE_URL}/datos-bancarios?proveedorId=${proveedor.id_proveedor}`,
          {
            headers: { apikey: API_KEY },
          }
        ),
        axios.get(
          `${API_BASE_URL}/referencias?proveedorId=${proveedor.id_proveedor}`,
          {
            headers: { apikey: API_KEY },
          }
        ),
      ]);

      setFormData(proveedor);
      setContactos(contactosRes.data.records.slice(0, 2));
      setDatosBancarios(
        bancariosRes.data.records[0] || {
          beneficiario: "",
          banco: "",
          clave: "",
          cuenta: "",
        }
      );
      setReferencias(referenciasRes.data.records.slice(0, 2));
      setIsEditing(true);
      setShowTable(false);
      window.scrollTo(0, 0);
    } catch (err) {
      setError("Error al cargar datos del proveedor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar proveedor
  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este proveedor?")) {
      try {
        await axios.delete(`${API_BASE_URL}/proveedores/${id}`, {
          headers: { apikey: API_KEY },
        });
        fetchProveedores();
      } catch (err) {
        setError("Error al eliminar proveedor");
        console.error(err);
      }
    }
  };

  // Paginación
  const filteredItems = proveedores.filter(
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
      fetchProveedores();
    }
  }, [showTable]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  return (
    <div className="rodval-container">
      {/* Encabezado */}
      <div className="rodval-header">
        <div className="rodval-logo">rodval LOGISTICS</div>
        <h1 className="rodval-title">ALTA PROVEEDOR</h1>
      </div>

      {/* Botón para mostrar/ocultar tabla */}
      <div className="rodval-table-toggle">
        <button
          onClick={() => setShowTable(!showTable)}
          className={`rodval-button ${
            showTable ? "rodval-button-secondary" : "rodval-button-primary"
          }`}
        >
          {showTable ? (
            <>
              <CloseIcon fontSize="small" /> Ocultar Tabla
            </>
          ) : (
            <>
              <VisibilityIcon fontSize="small" /> Ver Tabla de Proveedores
            </>
          )}
        </button>
      </div>

      {/* Tabla de proveedores */}
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
              onClick={fetchProveedores}
              className="rodval-button rodval-button-primary"
              disabled={loading}
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
                  <th>Pais</th>
                  <th>Codigo postal</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th>Unidades Propias</th>
                  <th>Cuenta GPS</th>
                  <th>Creada</th>
                  <th>Actualizada</th>
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
                      <td>{item.pais}</td>
                      <td>{item.codigo_postal}</td>
                      <td>{item.ciudad}</td>
                      <td>{item.estado}</td>
                      <td>{item.unidades_propias ? "Sí" : "No"}</td>
                      <td>{item.cuenta_espejo_gps ? "Sí" : "No"}</td>
                      <td>{item.created_at}</td>
                      <td>{item.update_at}</td>
                      <td>
                        <div className="rodval-actions">
                          <button
                            onClick={() =>
                              item.id_proveedor && handleEdit(item)
                            }
                            className="rodval-icon-button rodval-edit"
                            title="Editar"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                          <button
                            onClick={() =>
                              item.id_proveedor &&
                              handleDelete(item.id_proveedor)
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
                    <td colSpan={7} className="rodval-no-data">
                      {loading
                        ? "Cargando..."
                        : "No se encontraron proveedores"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredItems.length > itemsPerPage && (
            <div className="rodval-pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="rodval-pagination-button"
              >
                <ArrowBackIosIcon fontSize="small" />
              </button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || loading}
                className="rodval-pagination-button"
              >
                <ArrowForwardIosIcon fontSize="small" />
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
                  <span className="rodval-required">*</span> CONSTANCIA SITUACION
                  FISCAL (ACTUAL)
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
            <h2 className="rodval-section-title">INFORMACIÓN DE CONTACTOS (2)</h2>

            {contactos.map((contacto, index) => (
              <div key={index} className="rodval-contact-card">
                <h3 className="rodval-contact-title">Contacto {index + 1}</h3>

                <div className="rodval-form-row rodval-form-row-5">
                  <div className="rodval-form-group">
                    <label className="rodval-label">NOMBRE(S)</label>
                    <input
                      type="text"
                      value={contacto.nombre}
                      onChange={(e) =>
                        handleContactoChange(index, "nombre", e.target.value)
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                  <div className="rodval-form-group">
                    <label className="rodval-label">APELLIDO</label>
                    <input
                      type="text"
                      value={contacto.apellido}
                      onChange={(e) =>
                        handleContactoChange(index, "apellido", e.target.value)
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                  <div className="rodval-form-group">
                    <label className="rodval-label">TELÉFONO</label>
                    <input
                      type="text"
                      value={contacto.telefono}
                      onChange={(e) =>
                        handleContactoChange(index, "telefono", e.target.value)
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                  <div className="rodval-form-group">
                    <label className="rodval-label">CORREO</label>
                    <input
                      type="email"
                      value={contacto.correo}
                      onChange={(e) =>
                        handleContactoChange(index, "correo", e.target.value)
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                  <div className="rodval-form-group">
                    <label className="rodval-label">PUESTO</label>
                    <input
                      type="text"
                      value={contacto.puesto}
                      onChange={(e) =>
                        handleContactoChange(index, "puesto", e.target.value)
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DATOS BANCARIOS */}
          <div className="rodval-section">
            <h2 className="rodval-section-title">DATOS BANCARIOS</h2>

            <div className="rodval-form-row">
              <div className="rodval-form-group">
                <label className="rodval-label">BENEFICIARIO</label>
                <input
                  type="text"
                  value={datosBancarios.beneficiario}
                  onChange={(e) =>
                    handleDatosBancariosChange("beneficiario", e.target.value)
                  }
                  required
                  className="rodval-input"
                />
              </div>
              <div className="rodval-form-group">
                <label className="rodval-label">BANCO</label>
                <input
                  type="text"
                  value={datosBancarios.banco}
                  onChange={(e) =>
                    handleDatosBancariosChange("banco", e.target.value)
                  }
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
                  value={datosBancarios.clave}
                  onChange={(e) =>
                    handleDatosBancariosChange("clave", e.target.value)
                  }
                  required
                  className="rodval-input"
                />
              </div>
              <div className="rodval-form-group">
                <label className="rodval-label">CUENTA</label>
                <input
                  type="text"
                  value={datosBancarios.cuenta}
                  onChange={(e) =>
                    handleDatosBancariosChange("cuenta", e.target.value)
                  }
                  required
                  className="rodval-input"
                />
              </div>
            </div>
          </div>

          {/* REFERENCIAS COMERCIALES */}
          {referencias.map((referencia, index) => (
            <div key={index} className="rodval-section">
              <h2 className="rodval-section-title">
                REFERENCIA COMERCIAL {index + 1}
              </h2>

              <div className="rodval-reference-card">
                <div className="rodval-form-row">
                  <div className="rodval-form-group">
                    <label className="rodval-label">EMPRESA</label>
                    <input
                      type="text"
                      value={referencia.empresa}
                      onChange={(e) =>
                        handleReferenciaChange(index, "empresa", e.target.value)
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                  <div className="rodval-form-group">
                    <label className="rodval-label">DOMICILIO</label>
                    <input
                      type="text"
                      value={referencia.domicilio}
                      onChange={(e) =>
                        handleReferenciaChange(
                          index,
                          "domicilio",
                          e.target.value
                        )
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                </div>

                <div className="rodval-form-row rodval-form-row-5">
                  <div className="rodval-form-group">
                    <label className="rodval-label">PAÍS</label>
                    <input
                      type="text"
                      value={referencia.pais}
                      onChange={(e) =>
                        handleReferenciaChange(index, "pais", e.target.value)
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                  <div className="rodval-form-group">
                    <label className="rodval-label">CIUDAD</label>
                    <input
                      type="text"
                      value={referencia.ciudad}
                      onChange={(e) =>
                        handleReferenciaChange(index, "ciudad", e.target.value)
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                  <div className="rodval-form-group">
                    <label className="rodval-label">ESTADO</label>
                    <input
                      type="text"
                      value={referencia.estado}
                      onChange={(e) =>
                        handleReferenciaChange(index, "estado", e.target.value)
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                  <div className="rodval-form-group">
                    <label className="rodval-label">CÓDIGO POSTAL</label>
                    <input
                      type="text"
                      value={referencia.codigo_postal}
                      onChange={(e) =>
                        handleReferenciaChange(
                          index,
                          "codigo_postal",
                          e.target.value
                        )
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                  <div className="rodval-form-group">
                    <label className="rodval-label">TELÉFONO</label>
                    <input
                      type="text"
                      value={referencia.telefono}
                      onChange={(e) =>
                        handleReferenciaChange(
                          index,
                          "telefono",
                          e.target.value
                        )
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                </div>

                <div className="rodval-form-row">
                  <div className="rodval-form-group">
                    <label className="rodval-label">CONTACTO</label>
                    <input
                      type="text"
                      value={referencia.contacto}
                      onChange={(e) =>
                        handleReferenciaChange(
                          index,
                          "contacto",
                          e.target.value
                        )
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                  <div className="rodval-form-group">
                    <label className="rodval-label">PUESTO</label>
                    <input
                      type="text"
                      value={referencia.puesto}
                      onChange={(e) =>
                        handleReferenciaChange(index, "puesto", e.target.value)
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                  <div className="rodval-form-group">
                    <label className="rodval-label">
                      RELACIÓN COMERCIAL DESDE
                    </label>
                    <input
                      type="date"
                      value={referencia.relacion_comercial_desde}
                      onChange={(e) =>
                        handleReferenciaChange(
                          index,
                          "relacion_comercial_desde",
                          e.target.value
                        )
                      }
                      required
                      className="rodval-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

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
