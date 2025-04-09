import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import "./../DatosBasicos.css";
import DeleteIcon from "@mui/icons-material/Delete";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import ChatIcon from "@mui/icons-material/Chat";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

type Item = {
  id_documentoOperador: number;
  id_operador: string;
  fecha_registro: string;
  nombre_getAWS: string;
  nombre_postAWS: string;
};

type Operador = {
  id_operador: string;
  nombre_operador?: string;
  [key: string]: any;
};

export default function DocOperadoresForm() {
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState<
    Omit<Item, "id_documentoOperador"> & { id_documentoOperador?: number }
  >({
    id_operador: "",
    fecha_registro: "",
    nombre_getAWS: "",
    nombre_postAWS: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>("");
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [fileGetAWS, setFileGetAWS] = useState<File | null>(null);
  const [filePostAWS, setFilePostAWS] = useState<File | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [fileUrls, setFileUrls] = useState({
    getAWS: "",
    postAWS: "",
  });
  const [loadingUrls, setLoadingUrls] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const API_BASE_URL =
    "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "doc_operadores";
  const CORS_ANYWHERE_URL = "https://cors-anywhere.herokuapp.com/"; // URL de CORS Anywhere

  const filteredItems = items.filter(
    (item) =>
      item.nombre_getAWS.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.id_operador.toLowerCase().includes(busqueda.toLowerCase()) ||
      operadores
        .find((op) => op.id_operador === item.id_operador)
        ?.nombre_operador?.toLowerCase()
        .includes(busqueda.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  // Función para determinar el tipo de archivo basado en su nombre
  const getFileType = (fileName: string): "image" | "pdf" | "other" => {
    if (!fileName) return "other";

    const lowerFileName = fileName.toLowerCase();

    if (lowerFileName.endsWith(".pdf")) {
      return "pdf";
    } else if (/\.(jpe?g|png|gif|bmp|svg)$/i.test(lowerFileName)) {
      return "image";
    } else {
      return "other";
    }
  };

  const handleOpenModal = async (item: Item) => {
    setCurrentItem(item);
    setOpenModal(true);
    setLoadingUrls(true);
    setError(null);
    setFileUrls({ getAWS: "", postAWS: "" });

    try {
      console.log(
        "Obteniendo URLs para archivos:",
        item.nombre_getAWS,
        item.nombre_postAWS
      );

      // Obtener URL para nombre_getAWS
      if (item.nombre_getAWS) {
        console.log("Solicitando URL para GET AWS:", item.nombre_getAWS);
        const getAWSRequestBody = { fileName: item.nombre_getAWS };
        const getResponse = await axios.post<{ url?: string }>(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`, // URL modificada
          getAWSRequestBody,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        console.log("Respuesta GET AWS:", getResponse.data);
        if (getResponse.data?.url) {
          setFileUrls((prev) => ({
            ...prev,
            getAWS: getResponse.data.url || "",
          }));
          console.log("URL GET AWS configurada:", getResponse.data.url);
        } else {
          console.log("No se recibió URL válida para GET AWS");
        }
      }

      // Obtener URL para nombre_postAWS si existe
      if (item.nombre_postAWS) {
        console.log("Solicitando URL para POST AWS:", item.nombre_postAWS);
        const postAWSRequestBody = { fileName: item.nombre_postAWS };
        const postResponse = await axios.post<{ url?: string }>(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`, // URL modificada
          postAWSRequestBody,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        console.log("Respuesta POST AWS:", postResponse.data);
        if (postResponse.data?.url) {
          setFileUrls((prev) => ({
            ...prev,
            postAWS: postResponse.data.url || "",
          }));
          console.log("URL POST AWS configurada:", postResponse.data.url);
        } else {
          console.log("No se recibió URL válida para POST AWS");
        }
      }
    } catch (error: unknown) {
      console.error("Error al obtener URLs:", error);
      let errorMessage = "No se pudo obtener los archivos. Intenta más tarde";

      if (axios.isAxiosError(error)) {
        console.error("Error Axios:", error.message, error.response?.data);
        if (error.code === "ERR_NETWORK") {
          errorMessage = "Error de conexión. Verifica tu internet";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoadingUrls(false);
    }
  };

  const uploadFileGetAWS = async (
    file: File
  ): Promise<{ success: boolean }> => {
    const filename = file.name;

    try {
      console.log(`Subiendo archivo GET AWS: ${filename}`);

      // Obtenemos el contenido binario del archivo directamente
      const fileArrayBuffer = await file.arrayBuffer();
      const fileBlob = new Blob([fileArrayBuffer], { type: file.type });

      const response = await axios.put<{ success?: boolean }>(
        `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/folder/bucket-rodval/${filename}`, // URL modificada
        fileBlob, // Enviamos el archivo binario directamente
        {
          headers: {
            "Content-Type": file.type, // Usamos el tipo MIME correcto del archivo
          },
        }
      );

      console.log(`Respuesta de subida GET AWS:`, response.data);
      return { success: response.data?.success || false };
    } catch (error: unknown) {
      console.error("Error al subir archivo GET AWS:", error);
      throw new Error(`Error al subir el archivo nombre_getAWS: ${file.name}`);
    }
  };

  const uploadFilePostAWS = async (
    file: File
  ): Promise<{ success: boolean }> => {
    const filename = file.name;

    try {
      console.log(`Subiendo archivo POST AWS: ${filename}`);

      // Obtenemos el contenido binario del archivo directamente
      const fileArrayBuffer = await file.arrayBuffer();
      const fileBlob = new Blob([fileArrayBuffer], { type: file.type });

      const response = await axios.put<{ success?: boolean }>(
        `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/folder/bucket-rodval/${filename}`, // URL modificada
        fileBlob, // Enviamos el archivo binario directamente
        {
          headers: {
            "Content-Type": file.type, // Usamos el tipo MIME correcto del archivo
          },
        }
      );

      console.log(`Respuesta de subida POST AWS:`, response.data);
      return { success: response.data?.success || false };
    } catch (error: unknown) {
      console.error("Error al subir archivo POST AWS:", error);
      throw new Error(`Error al subir el archivo nombre_postAWS: ${file.name}`);
    }
  };

  const getNombreOperador = (idOperador: string): string => {
    const operador = operadores.find((op) => op.id_operador === idOperador);
    return operador?.nombre_operador || `ID: ${idOperador}`;
  };

  useEffect(() => {
    fetchItems();
    fetchOperadores();
  }, []);

  const resetForm = () => {
    setFormData({
      id_operador: "",
      fecha_registro: "",
      nombre_getAWS: "",
      nombre_postAWS: "",
    });
    setSelectedDate(null);
    setFileGetAWS(null);
    setFilePostAWS(null);
    setIsEditing(false);
    setError(null);
  };

  const fetchItems = async (): Promise<void> => {
    setLoading(true);
    try {
      await fetchOperadores();

      const response = await axios.get<{ records: Item[] }>(
        `${API_BASE_URL}/${tableName}/all`,
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
          },
          timeout: 30000,
        }
      );

      const itemsWithId = response.data.records.map((item) => ({
        id_documentoOperador: item.id_documentoOperador || 0,
        id_operador: String(item.id_operador || ""),
        fecha_registro: item.fecha_registro || "",
        nombre_getAWS: item.nombre_getAWS || "",
        nombre_postAWS: item.nombre_postAWS || "",
      }));

      setItems(itemsWithId);
    } catch (err: unknown) {
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const fetchOperadores = async (): Promise<void> => {
    try {
      const response = await axios.get<{ records: Operador[] }>(
        `${API_BASE_URL}/operadores/all`,
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
          },
          timeout: 30000,
        }
      );

      const operadoresConNombres = response.data.records.map(
        (op: Operador) => ({
          ...op,
          nombre_operador: op.nombre_operador || `Operador ${op.id_operador}`,
        })
      );

      setOperadores(operadoresConNombres);
    } catch (err: unknown) {
      console.error("Error al cargar operadores:", err);
      setOperadores([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const fechaFormateada = selectedDate?.toISOString().split("T")[0] || "";

      const uploadPromises: Promise<{ success: boolean }>[] = [];

      if (fileGetAWS) {
        uploadPromises.push(
          uploadFileGetAWS(fileGetAWS).catch((error: unknown) => {
            throw new Error(
              `Fallo subida GET: ${
                error instanceof Error ? error.message : "Error desconocido"
              }`
            );
          })
        );
      }

      if (filePostAWS) {
        uploadPromises.push(
          uploadFilePostAWS(filePostAWS).catch((error: unknown) => {
            throw new Error(
              `Fallo subida POST: ${
                error instanceof Error ? error.message : "Error desconocido"
              }`
            );
          })
        );
      }

      await Promise.all(uploadPromises);

      const dataToSend = {
        ...formData,
        fecha_registro: fechaFormateada,
      };

      const url =
        isEditing && formData.id_documentoOperador
          ? `${API_BASE_URL}/${tableName}/${formData.id_documentoOperador}`
          : `${API_BASE_URL}/${tableName}`;

      const method = isEditing ? "patch" : "post";

      const response = await axios[method]<Item>(
        url,
        { data: dataToSend },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
          },
          timeout: 30000,
        }
      );

      const result = response.data;
      if (isEditing) {
        setItems(
          items.map((item) =>
            item.id_documentoOperador === formData.id_documentoOperador
              ? result
              : item
          )
        );
      } else {
        setItems([...items, result]);
      }

      resetForm();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al guardar los datos");
      } else {
        setError("Error desconocido al guardar los datos");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileGetAWSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileGetAWS(selectedFile);
      setFormData({
        ...formData,
        nombre_getAWS: selectedFile.name,
      });
    } else {
      setFileGetAWS(null);
      setFormData({
        ...formData,
        nombre_getAWS: "",
      });
    }
  };

  const handleFilePostAWSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFilePostAWS(selectedFile);
      setFormData({
        ...formData,
        nombre_postAWS: selectedFile.name,
      });
    } else {
      setFilePostAWS(null);
      setFormData({
        ...formData,
        nombre_postAWS: "",
      });
    }
  };

  const handleDelete = async (id_documentoOperador: number) => {
    if (window.confirm("¿Estás seguro de eliminar este elemento?")) {
      setLoading(true);
      try {
        await axios.delete(
          `${API_BASE_URL}/${tableName}/${id_documentoOperador}`,
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
        setItems(
          items.filter(
            (item) => item.id_documentoOperador !== id_documentoOperador
          )
        );
        setSuccess("Registro eliminado correctamente");
      } catch (err) {
        setError("Error al eliminar el elemento");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (item: Item) => {
    setFormData(item);
    setSelectedDate(item.fecha_registro ? new Date(item.fecha_registro) : null);
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFileUrls({ getAWS: "", postAWS: "" });
    setCurrentItem(null);
  };

  return (
    <div>
      <h2>Documentos de Operadores</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            height: 800,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2 id="modal-modal-title">Visualización de Archivos</h2>

          {currentItem && (
            <div className="mb-4 p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-bold mb-2">Detalles del Documento</h3>
              <p>
                <strong>ID Documento:</strong>{" "}
                {currentItem.id_documentoOperador}
              </p>
              <p>
                <strong>Operador:</strong>{" "}
                {getNombreOperador(currentItem.id_operador)}
              </p>
              <p>
                <strong>Fecha Registro:</strong> {currentItem.fecha_registro}
              </p>
            </div>
          )}

          {loadingUrls ? (
            <p>Cargando URLs de archivos...</p>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Archivo GET AWS:</h3>
                {fileUrls.getAWS && currentItem?.nombre_getAWS ? (
                  <>
                    <p className="mb-2 break-all">
                      <strong>Nombre archivo:</strong>{" "}
                      {currentItem.nombre_getAWS}
                    </p>
                    {getFileType(currentItem.nombre_getAWS) === "pdf" ? (
                      <iframe
                        src={fileUrls.getAWS}
                        width="100%"
                        height="500px"
                        title="PDF Viewer"
                      />
                    ) : getFileType(currentItem.nombre_getAWS) === "image" ? (
                      <img
                        src={fileUrls.getAWS}
                        alt="Imagen GET AWS"
                        style={{ maxWidth: "100%", maxHeight: "500px" }}
                      />
                    ) : (
                      <p>
                        Previsualización no compatible.{" "}
                        <a
                          href={fileUrls.getAWS}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Abrir archivo
                        </a>
                      </p>
                    )}
                  </>
                ) : (
                  <p>No hay archivo GET AWS disponible</p>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Archivo POST AWS:</h3>
                {fileUrls.postAWS && currentItem?.nombre_postAWS ? (
                  <>
                    <p className="mb-2 break-all">
                      <strong>Nombre archivo:</strong>{" "}
                      {currentItem.nombre_postAWS}
                    </p>
                    {getFileType(currentItem.nombre_postAWS) === "pdf" ? (
                      <iframe
                        src={fileUrls.postAWS}
                        width="100%"
                        height="500px"
                        title="PDF Viewer"
                      />
                    ) : getFileType(currentItem.nombre_postAWS) === "image" ? (
                      <img
                        src={fileUrls.postAWS}
                        alt="Imagen POST AWS"
                        style={{ maxWidth: "100%", maxHeight: "500px" }}
                      />
                    ) : (
                      <p>
                        Previsualización no compatible.{" "}
                        <a
                          href={fileUrls.postAWS}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Abrir archivo
                        </a>
                      </p>
                    )}
                  </>
                ) : (
                  <p>No hay archivo POST AWS disponible</p>
                )}
              </div>

              <div className="mt-4">
                <Button
                  onClick={handleCloseModal}
                  variant="contained"
                  color="secondary"
                >
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </Box>
      </Modal>

      <form onSubmit={handleSubmit} className="form">
        {isEditing && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              ID Documento:
            </label>
            <input
              type="text"
              value={formData.id_documentoOperador || ""}
              disabled
              className="w-full max-w-lg p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Operador:
          </label>
          <Select
            options={operadores.map((op) => ({
              value: op.id_operador,
              label: op.nombre_operador || `Operador ${op.id_operador}`,
            }))}
            value={
              formData.id_operador
                ? {
                    value: formData.id_operador,
                    label: getNombreOperador(formData.id_operador),
                  }
                : null
            }
            onChange={(selectedOption) =>
              setFormData({
                ...formData,
                id_operador: selectedOption?.value || "",
              })
            }
            placeholder="Seleccione un operador"
            className="w-full max-w-lg"
            isDisabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Fecha de Registro:
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholderText="Seleccione la fecha"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Archivo (nombre_getAWS):
          </label>
          <input
            type="file"
            onChange={handleFileGetAWSChange}
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            disabled={loading}
            required={!isEditing}
          />
          {fileGetAWS && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: {fileGetAWS.name}
            </p>
          )}
          {isEditing && !fileGetAWS && formData.nombre_getAWS && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo actual: {formData.nombre_getAWS}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Nombre de Imagen (nombre_postAWS):
          </label>
          <input
            type="file"
            onChange={handleFilePostAWSChange}
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            disabled={loading}
            required={!isEditing}
          />
          {filePostAWS && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: {filePostAWS.name}
            </p>
          )}
          {isEditing && !filePostAWS && formData.nombre_postAWS && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo actual: {formData.nombre_postAWS}
            </p>
          )}
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
              onClick={resetForm}
              className="button button-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="search-container">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Buscar en documentos:
        </label>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          disabled={loading}
        />
      </div>

      <div style={{ overflow: "hidden" }}>
        <button
          onClick={() => {
            fetchItems();
            fetchOperadores();
          }}
          className="button button-primary"
          disabled={loading}
          style={{ float: "right" }}
        >
          {loading ? "Recargando..." : "Recargar Tabla"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID Documento</th>
              <th>Operador</th>
              <th>Fecha Registro</th>
              <th>Nombre Archivo</th>
              <th>Nombre Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && !currentItems.length ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Cargando...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  No hay documentos disponibles
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.id_documentoOperador}>
                  <td>{item.id_documentoOperador}</td>
                  <td>{getNombreOperador(item.id_operador)}</td>
                  <td>{item.fecha_registro}</td>
                  <td>{item.nombre_getAWS}</td>
                  <td>{item.nombre_postAWS || "No disponible"}</td>
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
                          (e.currentTarget.style.color = "#3b82f6")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.color = "#0447fb")
                        }
                        disabled={loading}
                      >
                        <EditSquareIcon fontSize="small" />
                      </button>

                      <button
                        onClick={() => handleOpenModal(item)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#10b981",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.color = "#059669")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.color = "#10b981")
                        }
                        disabled={loading}
                      >
                        <ChatIcon fontSize="small" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id_documentoOperador)}
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
                color: currentPage === 1 ? "#ccc" : "#3b82f6",
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
                color: currentPage === totalPages ? "#ccc" : "#3b82f6",
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
