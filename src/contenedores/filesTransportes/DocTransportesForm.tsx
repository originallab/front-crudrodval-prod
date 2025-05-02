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
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import { Grid } from '@mui/material'; // Importación directa
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton'; // Importación directa
import CircularProgress from '@mui/material/CircularProgress';

type Item = {
  id_documentoTransportes: number;
  fecha_registro: string;
  id_unidad: number;
  registroMercantil: string;
  seguro: string;
  tarjetaCirculacion: string;
};

type Unidad = {
  id_unidad: number;
  nombre: string;
};

export default function DocTransportesForm() {
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState<
    Omit<Item, "id_documentoTransportes"> & { id_documentoTransportes?: number }
  >({
    id_unidad: 0,
    fecha_registro: "",
    registroMercantil: "",
    seguro: "",
    tarjetaCirculacion: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>("");
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [fileRegistroMercantil, setFileRegistroMercantil] =
    useState<File | null>(null);
  const [fileSeguro, setFileSeguro] = useState<File | null>(null);
  const [fileTarjetaCirculacion, setFileTarjetaCirculacion] =
    useState<File | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [fileUrls, setFileUrls] = useState({
    registroMercantil: "",
    seguro: "",
    tarjetaCirculacion: "",
  });
  const [loadingUrls, setLoadingUrls] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [currentFileView, setCurrentFileView] = useState<{
    type: "registroMercantil" | "seguro" | "tarjetaCirculacion" | null;
    url: string;
    fileName: string;
  }>({ type: null, url: "", fileName: "" });

  const API_BASE_URL =
    "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "docs_Transportes";
  const unidadesTableName = "tipos_unidades";
  const CORS_ANYWHERE_URL = "https://cors-anywhere.herokuapp.com/";

  const filteredItems = items.filter(
    (item) =>
      item.registroMercantil?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.seguro?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.tarjetaCirculacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      unidades
        .find((unidad) => unidad.id_unidad === item.id_unidad)
        ?.nombre?.toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      String(item.id_unidad).toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

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
    setFileUrls({ registroMercantil: "", seguro: "", tarjetaCirculacion: "" });
    setCurrentFileView({ type: null, url: "", fileName: "" });

    try {
      if (item.registroMercantil) {
        const registroMercantilRequestBody = {
          fileName: item.registroMercantil,
        };
        const getResponse = await axios.post<{ url?: string }>(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
          registroMercantilRequestBody,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        if (getResponse.data?.url) {
          setFileUrls((prev) => ({
            ...prev,
            registroMercantil: getResponse.data.url || "",
          }));
        }
      }

      if (item.seguro) {
        const seguroRequestBody = { fileName: item.seguro };
        const postResponse = await axios.post<{ url?: string }>(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
          seguroRequestBody,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        if (postResponse.data?.url) {
          setFileUrls((prev) => ({
            ...prev,
            seguro: postResponse.data.url || "",
          }));
        }
      }

      if (item.tarjetaCirculacion) {
        const tarjetaCirculacionRequestBody = {
          fileName: item.tarjetaCirculacion,
        };
        const tarjetaCirculacionResponse = await axios.post<{ url?: string }>(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
          tarjetaCirculacionRequestBody,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        if (tarjetaCirculacionResponse.data?.url) {
          setFileUrls((prev) => ({
            ...prev,
            tarjetaCirculacion: tarjetaCirculacionResponse.data.url || "",
          }));
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

  const handleViewFile = (
    type: "registroMercantil" | "seguro" | "tarjetaCirculacion",
    url: string,
    fileName: string
  ) => {
    setCurrentFileView({ type, url, fileName });
  };

  const handleCloseFileView = () => {
    setCurrentFileView({ type: null, url: "", fileName: "" });
  };

  const uploadFile = async (
    file: File,
    fileNameKey: "registroMercantil" | "seguro" | "tarjetaCirculacion"
  ): Promise<{ success: boolean }> => {
    const filename = file.name;

    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const fileBlob = new Blob([fileArrayBuffer], { type: file.type });

      const response = await axios.put<{ success?: boolean }>(
        `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/folder/bucket-rodval/${filename}`,
        fileBlob,
        {
          headers: {
            "Content-Type": file.type,
          },
        }
      );

      return { success: response.data?.success || false };
    } catch (error: unknown) {
      console.error(`Error al subir archivo ${fileNameKey}:`, error);
      throw new Error(`Error al subir el archivo ${fileNameKey}: ${file.name}`);
    }
  };

  const getNombreUnidad = (idUnidad: number): string => {
    const unidad = unidades.find((u) => u.id_unidad === idUnidad);
    return unidad?.nombre || `ID: ${idUnidad}`;
  };

  useEffect(() => {
    fetchItems();
    fetchUnidades();
  }, []);

  const resetForm = () => {
    setFormData({
      id_unidad: 0,
      fecha_registro: "",
      registroMercantil: "",
      seguro: "",
      tarjetaCirculacion: "",
    });
    setSelectedDate(null);
    setFileRegistroMercantil(null);
    setFileSeguro(null);
    setFileTarjetaCirculacion(null);
    setIsEditing(false);
    setError(null);
  };

  const fetchItems = async (): Promise<void> => {
    setLoading(true);
    try {
      await fetchUnidades();

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
        id_documentoTransportes: item.id_documentoTransportes || 0,
        id_unidad: item.id_unidad || 0,
        fecha_registro: item.fecha_registro || "",
        registroMercantil: item.registroMercantil || "",
        seguro: item.seguro || "",
        tarjetaCirculacion: item.tarjetaCirculacion || "",
      }));

      setItems(itemsWithId);
    } catch (err: unknown) {
      setError("Error al cargar los datos de documentos de transporte");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnidades = async (): Promise<void> => {
    try {
      const response = await axios.get<{ records: Unidad[] }>(
        `${API_BASE_URL}/${unidadesTableName}/all`,
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
          },
          timeout: 30000,
        }
      );

      setUnidades(response.data.records);
    } catch (err: unknown) {
      console.error("Error al cargar unidades:", err);
      setUnidades([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const fechaFormateada = selectedDate?.toISOString().split("T")[0] || "";

      const updatedFormData = { ...formData, fecha_registro: fechaFormateada };

      if (fileRegistroMercantil) {
        const uploadResult = await uploadFile(
          fileRegistroMercantil,
          "registroMercantil"
        ).catch((error: unknown) => {
          throw new Error(
            `Fallo subida Registro Mercantil: ${
              error instanceof Error ? error.message : "Error desconocido"
            }`
          );
        });
        if (uploadResult.success) {
          updatedFormData.registroMercantil = fileRegistroMercantil.name;
        }
      } else {
        if (formData.registroMercantil !== undefined) {
          updatedFormData.registroMercantil = formData.registroMercantil;
        }
      }

      const url =
        isEditing && formData.id_documentoTransportes
          ? `${API_BASE_URL}/${tableName}/${formData.id_documentoTransportes}`
          : `${API_BASE_URL}/${tableName}`;

      const method = isEditing ? "patch" : "post";

      const response = await axios[method]<Item>(
        url,
        { data: updatedFormData },
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
            item.id_documentoTransportes === formData.id_documentoTransportes
              ? result
              : item
          )
        );
      } else {
        setItems([...items, result]);
      }

      resetForm();
      setSuccess(
        `Registro de transporte ${
          isEditing ? "actualizado" : "agregado"
        } correctamente`
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al guardar los datos del transporte");
      } else {
        setError("Error desconocido al guardar los datos del transporte");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileRegistroMercantilChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileRegistroMercantil(selectedFile);
      setFormData({
        ...formData,
        registroMercantil: selectedFile.name,
      });
    } else {
      setFileRegistroMercantil(null);
      setFormData({
        ...formData,
        registroMercantil: "",
      });
    }
  };

  const handleFileSeguroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileSeguro(selectedFile);
      setFormData({
        ...formData,
        seguro: selectedFile.name,
      });
    } else {
      setFileSeguro(null);
      setFormData({
        ...formData,
        seguro: "",
      });
    }
  };

  const handleFileTarjetaCirculacionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileTarjetaCirculacion(selectedFile);
      setFormData({
        ...formData,
        tarjetaCirculacion: selectedFile.name,
      });
    } else {
      setFileTarjetaCirculacion(null);
      setFormData({
        ...formData,
        tarjetaCirculacion: "",
      });
    }
  };

  const handleDelete = async (id_documentoTransportes: number) => {
    if (
      window.confirm("¿Estás seguro de eliminar este documento de transporte?")
    ) {
      setLoading(true);
      try {
        await axios.delete(
          `${API_BASE_URL}/${tableName}/${id_documentoTransportes}`,
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
            (item) => item.id_documentoTransportes !== id_documentoTransportes
          )
        );
        setSuccess("Registro de transporte eliminado correctamente");
      } catch (err) {
        setError("Error al eliminar el documento de transporte");
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
    setFileUrls({ registroMercantil: "", seguro: "", tarjetaCirculacion: "" });
    setCurrentItem(null);
    setCurrentFileView({ type: null, url: "", fileName: "" });
  };

  const renderFileIcon = (fileName: string) => {
    const type = getFileType(fileName);
    switch (type) {
      case "pdf":
        return <PictureAsPdfIcon style={{ color: "#e53935" }} />;
      case "image":
        return <ImageIcon style={{ color: "#43a047" }} />;
      default:
        return <InsertDriveFileIcon style={{ color: "#757575" }} />;
    }
  };

  const renderFilePreview = () => {
    if (!currentFileView.url || !currentFileView.fileName) return null;

    const fileType = getFileType(currentFileView.fileName);

    return (
      <div className="file-preview-container">
        <div className="file-preview-header">
          <h4>{currentFileView.fileName}</h4>
          <Button
            onClick={handleCloseFileView}
            startIcon={<CloseIcon />}
            variant="outlined"
            size="small"
          >
            Cerrar
          </Button>
        </div>

        <div className="file-preview-content">
          {fileType === "pdf" ? (
            <iframe
              src={currentFileView.url}
              width="100%"
              height="500px"
              title="PDF Viewer"
            />
          ) : fileType === "image" ? (
            <img
              src={currentFileView.url}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "500px" }}
            />
          ) : (
            <div className="unsupported-file">
              <p>Previsualización no disponible</p>
              <Button
                variant="contained"
                color="primary"
                href={currentFileView.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Descargar archivo
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>Documentos de Transportes</h2>
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
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: { xs: "90%", sm: "70%", md: "60%" }, // Responsive width
      maxWidth: "800px",
      maxHeight: "90vh",
      bgcolor: "background.paper",
      border: "2px solid",
      borderColor: "primary.main",
      borderRadius: "12px",
      boxShadow: 24,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Header del Modal */}
    <Box
      sx={{
        padding: "16px 24px",
        background: "linear-gradient(135deg, #0709ab 0%, #2196f3 100%)",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      <Typography
        id="modal-modal-title"
        variant="h6"
        component="h2"
        sx={{
          fontSize: "1.5rem",
          fontWeight: "600",
          letterSpacing: "0.5px",
        }}
      >
        Documentos de Transporte
      </Typography>
      <IconButton
        onClick={handleCloseModal}
        sx={{
          color: "white",
          '&:hover': {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <CloseIcon />
      </IconButton>
    </Box>

    {/* Contenido del Modal */}
    <Box
      sx={{
        p: 4,
        overflowY: "auto",
        background: "linear-gradient(145deg, #f9f9ff, #ffffff)",
        flex: 1,
      }}
    >
      {currentItem && (
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: '8px',
            background: 'rgba(25, 118, 210, 0.05)',
            border: '1px solid rgba(25, 118, 210, 0.2)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Typography variant="h6" sx={{ color: '#1976d2', textAlign: 'center', mb: 2 }}>
            Detalles del registro de transportes
          </Typography>
          <Grid container spacing={2}>
            <Grid >
              <Typography><strong>ID Documento:</strong> {currentItem.id_documentoTransportes}</Typography>
            </Grid>
            <Grid >
              <Typography><strong>Unidad:</strong> {getNombreUnidad(currentItem.id_unidad)}</Typography>
            </Grid>
            <Grid>
              <Typography><strong>Fecha Registro:</strong> {currentItem.fecha_registro}</Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      {loadingUrls ? (
        <Box sx={{ textAlign: 'center', py: 4, color: '#1976d2' }}>
          <CircularProgress color="inherit" />
          <Typography variant="body1" sx={{ mt: 2 }}>Cargando documentos...</Typography>
        </Box>
      ) : (
        <Box>
          {currentFileView.type ? (
            renderFilePreview()
          ) : (
            <Grid container spacing={3}>
              {/* Tarjeta Registro Mercantil */}
              <Grid >
                <Box sx={{
                  height: '100%',
                  p: 3,
                  border: '1px solid rgba(25, 118, 210, 0.3)',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  },
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InsertDriveFileIcon sx={{ color: '#1976d2', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 'medium' }}>
                      Registro Mercantil
                    </Typography>
                  </Box>
                  {fileUrls.registroMercantil && currentItem?.registroMercantil ? (
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        onClick={() => handleViewFile("registroMercantil", fileUrls.registroMercantil, currentItem.registroMercantil)}
                        sx={{
                          background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                          color: 'white',
                          fontWeight: '600',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                          }
                        }}
                        fullWidth
                      >
                        Ver Archivo
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.disabled', mt: 'auto' }}>No disponible</Typography>
                  )}
                </Box>
              </Grid>

              {/* Tarjeta Seguro */}
              <Grid >
                <Box sx={{
                  height: '100%',
                  p: 3,
                  border: '1px solid rgba(25, 118, 210, 0.3)',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  },
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InsertDriveFileIcon sx={{ color: '#1976d2', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 'medium' }}>
                      Seguro
                    </Typography>
                  </Box>
                  {fileUrls.seguro && currentItem?.seguro ? (
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        onClick={() => handleViewFile("seguro", fileUrls.seguro, currentItem.seguro)}
                        sx={{
                          background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                          color: 'white',
                          fontWeight: '600',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                          }
                        }}
                        fullWidth
                      >
                        Ver Archivo
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.disabled', mt: 'auto' }}>No disponible</Typography>
                  )}
                </Box>
              </Grid>

              {/* Tarjeta Circulación */}
              <Grid >
                <Box sx={{
                  height: '100%',
                  p: 3,
                  border: '1px solid rgba(25, 118, 210, 0.3)',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  },
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InsertDriveFileIcon sx={{ color: '#1976d2', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 'medium' }}>
                      Tarjeta de Circulación
                    </Typography>
                  </Box>
                  {fileUrls.tarjetaCirculacion && currentItem?.tarjetaCirculacion ? (
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        onClick={() => handleViewFile("tarjetaCirculacion", fileUrls.tarjetaCirculacion, currentItem.tarjetaCirculacion)}
                        sx={{
                          background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                          color: 'white',
                          fontWeight: '600',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                          }
                        }}
                        fullWidth
                      >
                        Ver Archivo
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.disabled', mt: 'auto' }}>No disponible</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Box>
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
              value={formData.id_documentoTransportes || ""}
              disabled
              className="w-full max-w-lg p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Unidad:
          </label>
          <Select
            options={unidades.map((unidad) => ({
              value: unidad.id_unidad,
              label: unidad.nombre || `Unidad ${unidad.id_unidad}`,
            }))}
            value={
              formData.id_unidad
                ? {
                    value: formData.id_unidad,
                    label: getNombreUnidad(formData.id_unidad),
                  }
                : null
            }
            onChange={(selectedOption) =>
              setFormData({
                ...formData,
                id_unidad: selectedOption?.value || 0,
              })
            }
            placeholder="Seleccione una unidad"
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
            Archivo Registro Mercantil:
          </label>
          <input
            type="file"
            onChange={handleFileRegistroMercantilChange}
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            disabled={loading}
            required={!isEditing || (isEditing && !formData.registroMercantil)}
          />
          {fileRegistroMercantil && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: {fileRegistroMercantil.name}
            </p>
          )}
          {isEditing &&
            !fileRegistroMercantil &&
            formData.registroMercantil && (
              <p className="mt-2 text-sm text-gray-600">
                Archivo actual: {formData.registroMercantil}
              </p>
            )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Archivo Seguro:
          </label>
          <input
            type="file"
            onChange={handleFileSeguroChange}
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            disabled={loading}
            required={!isEditing || (isEditing && !formData.seguro)}
          />
          {fileSeguro && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: {fileSeguro.name}
            </p>
          )}
          {isEditing && !fileSeguro && formData.seguro && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo actual: {formData.seguro}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Archivo Tarjeta de Circulación:
          </label>
          <input
            type="file"
            onChange={handleFileTarjetaCirculacionChange}
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            disabled={loading}
            required={!isEditing || (isEditing && !formData.tarjetaCirculacion)}
          />
          {fileTarjetaCirculacion && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: {fileTarjetaCirculacion.name}
            </p>
          )}
          {isEditing &&
            !fileTarjetaCirculacion &&
            formData.tarjetaCirculacion && (
              <p className="mt-2 text-sm text-gray-600">
                Archivo actual: {formData.tarjetaCirculacion}
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
            fetchUnidades();
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
              <th>Unidad</th>
              <th>Fecha Registro</th>
              <th>Registro Mercantil</th>
              <th>Seguro</th>
              <th>Tarjeta Circulación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && !currentItems.length ? (
              <tr>
                <td colSpan={7} className="text-center">
                  Cargando...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  No hay documentos disponibles
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.id_documentoTransportes}>
                  <td>{item.id_documentoTransportes}</td>
                  <td>{getNombreUnidad(item.id_unidad)}</td>
                  <td>{item.fecha_registro}</td>
                  <td>{item.registroMercantil || "No disponible"}</td>
                  <td>{item.seguro || "No disponible"}</td>
                  <td>{item.tarjetaCirculacion || "No disponible"}</td>
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
                        <ImageIcon fontSize="small" />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(item.id_documentoTransportes)
                        }
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
