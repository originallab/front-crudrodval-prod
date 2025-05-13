import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import "./../DatosBasicos.css";
import "./../styles.css";
import DeleteIcon from "@mui/icons-material/Delete";
import EditSquareIcon from "@mui/icons-material/EditSquare";
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
import Stack from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid"; // Importación directa

//datos de la tabla de transportes
type Item = {
  id_documentoOperador: number;
  id_operador: string;
  fecha_registro: string;
  licencia: string;
  identificacionO: string;
  tarjeta_circulacion: string;
  poliza: string;
  foto_unidadFrontal: string;
  foto_unidadTrasera: string;
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
    licencia: "",
    identificacionO: "",
    tarjeta_circulacion: "",
    poliza: "",
    foto_unidadFrontal: "",
    foto_unidadTrasera: "",
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
  const [fileTarjetaCirculacion, setFileTarjetaCirculacion] =
    useState<File | null>(null);
  const [filePoliza, setFilePoliza] = useState<File | null>(null);
  const [fileFotoFrontal, setFileFotoFrontal] = useState<File | null>(null);
  const [fileFotoTrasera, setFileFotoTrasera] = useState<File | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [fileUrls, setFileUrls] = useState({
    licencia: "",
    identificacionO: "",
    tarjeta_circulacion: "",
    poliza: "",
    foto_unidadFrontal: "",
    foto_unidadTrasera: "",
  });
  const [loadingUrls, setLoadingUrls] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [currentFileView, setCurrentFileView] = useState<{
    type:
      | "licencia"
      | "identificacionO"
      | "tarjeta_circulacion"
      | "poliza"
      | "foto_unidadFrontal"
      | "foto_unidadTrasera"
      | null;
    url: string;
    fileName: string;
  }>({ type: null, url: "", fileName: "" });

  const API_BASE_URL =
    "http://theoriginallab-crud-rodval-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "doc_operadore";
  const operadoresTableName = "operadores";
  const CORS_ANYWHERE_URL = "";

  const filteredItems = items.filter(
    (item) =>
      item.licencia?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.identificacionO?.toLowerCase().includes(busqueda.toLowerCase()) ||
      operadores
        .find((operador) => operador.id_operador === item.id_operador)
        ?.nombre_operador?.toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      item.id_operador.toLowerCase().includes(busqueda.toLowerCase())
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
    setFileUrls({
      licencia: "",
      identificacionO: "",
      tarjeta_circulacion: "",
      poliza: "",
      foto_unidadFrontal: "",
      foto_unidadTrasera: "",
    });
    setCurrentFileView({ type: null, url: "", fileName: "" });

    try {
      // Licencia
      if (item.licencia) {
        const getAWSRequestBody = { fileName: item.licencia };
        const getResponse = await axios.post<{ url?: string }>(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
          getAWSRequestBody,
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
            licencia: getResponse.data.url || "",
          }));
        }
      }

      // Identificación
      if (item.identificacionO) {
        const postAWSRequestBody = { fileName: item.identificacionO };
        const postResponse = await axios.post<{ url?: string }>(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
          postAWSRequestBody,
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
            identificacionO: postResponse.data.url || "",
          }));
        }
      }

      // Tarjeta de circulación
      if (item.tarjeta_circulacion) {
        const tarjetaCirculacionBody = { fileName: item.tarjeta_circulacion };
        const tarjetaResponse = await axios.post<{ url?: string }>(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
          tarjetaCirculacionBody,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        if (tarjetaResponse.data?.url) {
          setFileUrls((prev) => ({
            ...prev,
            tarjeta_circulacion: tarjetaResponse.data.url || "",
          }));
        }
      }

      // Póliza
      if (item.poliza) {
        const polizaBody = { fileName: item.poliza };
        const polizaResponse = await axios.post<{ url?: string }>(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
          polizaBody,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        if (polizaResponse.data?.url) {
          setFileUrls((prev) => ({
            ...prev,
            poliza: polizaResponse.data.url || "",
          }));
        }
      }

      // Foto frontal
      if (item.foto_unidadFrontal) {
        const fotoFrontalBody = { fileName: item.foto_unidadFrontal };
        const fotoFrontalResponse = await axios.post<{ url?: string }>(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
          fotoFrontalBody,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        if (fotoFrontalResponse.data?.url) {
          setFileUrls((prev) => ({
            ...prev,
            foto_unidadFrontal: fotoFrontalResponse.data.url || "",
          }));
        }
      }

      // Foto trasera
      if (item.foto_unidadTrasera) {
        const fotoTraseraBody = { fileName: item.foto_unidadTrasera };
        const fotoTraseraResponse = await axios.post<{ url?: string }>(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
          fotoTraseraBody,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        if (fotoTraseraResponse.data?.url) {
          setFileUrls((prev) => ({
            ...prev,
            foto_unidadTrasera: fotoTraseraResponse.data.url || "",
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
    type:
      | "licencia"
      | "identificacionO"
      | "tarjeta_circulacion"
      | "poliza"
      | "foto_unidadFrontal"
      | "foto_unidadTrasera",
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
    fileNameKey:
      | "licencia"
      | "identificacionO"
      | "tarjeta_circulacion"
      | "poliza"
      | "foto_unidadFrontal"
      | "foto_unidadTrasera"
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

  const getNombreOperador = (idOperador: string): string => {
    const operador = operadores.find((o) => o.id_operador === idOperador);
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
      licencia: "",
      identificacionO: "",
      tarjeta_circulacion: "",
      poliza: "",
      foto_unidadFrontal: "",
      foto_unidadTrasera: "",
    });
    setSelectedDate(null);
    setFileGetAWS(null);
    setFilePostAWS(null);
    setFileTarjetaCirculacion(null);
    setFilePoliza(null);
    setFileFotoFrontal(null);
    setFileFotoTrasera(null);
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
        id_operador: item.id_operador || "",
        fecha_registro: item.fecha_registro || "",
        licencia: item.licencia || "",
        identificacionO: item.identificacionO || "",
        tarjeta_circulacion: item.tarjeta_circulacion || "",
        poliza: item.poliza || "",
        foto_unidadFrontal: item.foto_unidadFrontal || "",
        foto_unidadTrasera: item.foto_unidadTrasera || "",
      }));

      setItems(itemsWithId);
    } catch (err: unknown) {
      setError("Error al cargar los datos de documentos de operadores");
    } finally {
      setLoading(false);
    }
  };

  const fetchOperadores = async (): Promise<void> => {
    try {
      const response = await axios.get<{ records: Operador[] }>(
        `${API_BASE_URL}/${operadoresTableName}/all`,
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
          },
          timeout: 30000,
        }
      );

      setOperadores(response.data.records);
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

      const updatedFormData = { ...formData, fecha_registro: fechaFormateada };

      // Subir archivos y actualizar nombres en formData
      const uploadPromises = [];

      if (fileGetAWS) {
        uploadPromises.push(
          uploadFile(fileGetAWS, "licencia")
            .then((result) => {
              if (result.success) {
                updatedFormData.licencia = fileGetAWS.name;
              }
            })
            .catch((error) => {
              throw new Error(
                `Fallo subida archivo licencia: ${error.message}`
              );
            })
        );
      }

      if (filePostAWS) {
        uploadPromises.push(
          uploadFile(filePostAWS, "identificacionO")
            .then((result) => {
              if (result.success) {
                updatedFormData.identificacionO = filePostAWS.name;
              }
            })
            .catch((error) => {
              throw new Error(
                `Fallo subida archivo identificación: ${error.message}`
              );
            })
        );
      }

      if (fileTarjetaCirculacion) {
        uploadPromises.push(
          uploadFile(fileTarjetaCirculacion, "tarjeta_circulacion")
            .then((result) => {
              if (result.success) {
                updatedFormData.tarjeta_circulacion =
                  fileTarjetaCirculacion.name;
              }
            })
            .catch((error) => {
              throw new Error(
                `Fallo subida archivo tarjeta circulación: ${error.message}`
              );
            })
        );
      }

      if (filePoliza) {
        uploadPromises.push(
          uploadFile(filePoliza, "poliza")
            .then((result) => {
              if (result.success) {
                updatedFormData.poliza = filePoliza.name;
              }
            })
            .catch((error) => {
              throw new Error(`Fallo subida archivo póliza: ${error.message}`);
            })
        );
      }

      if (fileFotoFrontal) {
        uploadPromises.push(
          uploadFile(fileFotoFrontal, "foto_unidadFrontal")
            .then((result) => {
              if (result.success) {
                updatedFormData.foto_unidadFrontal = fileFotoFrontal.name;
              }
            })
            .catch((error) => {
              throw new Error(
                `Fallo subida archivo foto frontal: ${error.message}`
              );
            })
        );
      }

      if (fileFotoTrasera) {
        uploadPromises.push(
          uploadFile(fileFotoTrasera, "foto_unidadTrasera")
            .then((result) => {
              if (result.success) {
                updatedFormData.foto_unidadTrasera = fileFotoTrasera.name;
              }
            })
            .catch((error) => {
              throw new Error(
                `Fallo subida archivo foto trasera: ${error.message}`
              );
            })
        );
      }

      // Esperar a que todas las subidas terminen
      await Promise.all(uploadPromises);

      const url =
        isEditing && formData.id_documentoOperador
          ? `${API_BASE_URL}/${tableName}/${formData.id_documentoOperador}`
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
            item.id_documentoOperador === formData.id_documentoOperador
              ? result
              : item
          )
        );
      } else {
        setItems([...items, result]);
      }

      resetForm();
      setSuccess(
        `Registro de operador ${
          isEditing ? "actualizado" : "agregado"
        } correctamente`
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al guardar los datos del operador");
      } else {
        setError("Error desconocido al guardar los datos del operador");
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
        licencia: selectedFile.name,
      });
    } else {
      setFileGetAWS(null);
      setFormData({
        ...formData,
        licencia: "",
      });
    }
  };

  const handleFilePostAWSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFilePostAWS(selectedFile);
      setFormData({
        ...formData,
        identificacionO: selectedFile.name,
      });
    } else {
      setFilePostAWS(null);
      setFormData({
        ...formData,
        identificacionO: "",
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
        tarjeta_circulacion: selectedFile.name,
      });
    } else {
      setFileTarjetaCirculacion(null);
      setFormData({
        ...formData,
        tarjeta_circulacion: "",
      });
    }
  };

  const handleFilePolizaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFilePoliza(selectedFile);
      setFormData({
        ...formData,
        poliza: selectedFile.name,
      });
    } else {
      setFilePoliza(null);
      setFormData({
        ...formData,
        poliza: "",
      });
    }
  };

  const handleFileFotoFrontalChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileFotoFrontal(selectedFile);
      setFormData({
        ...formData,
        foto_unidadFrontal: selectedFile.name,
      });
    } else {
      setFileFotoFrontal(null);
      setFormData({
        ...formData,
        foto_unidadFrontal: "",
      });
    }
  };

  const handleFileFotoTraseraChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileFotoTrasera(selectedFile);
      setFormData({
        ...formData,
        foto_unidadTrasera: selectedFile.name,
      });
    } else {
      setFileFotoTrasera(null);
      setFormData({
        ...formData,
        foto_unidadTrasera: "",
      });
    }
  };

  const handleDelete = async (id_documentoOperador: number) => {
    if (
      window.confirm("¿Estás seguro de eliminar este documento de operador?")
    ) {
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
        setSuccess("Registro de operador eliminado correctamente");
      } catch (err) {
        setError("Error al eliminar el documento de operador");
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
    // Resetear todos los estados relacionados con archivos
    setFileUrls({
      licencia: "",
      identificacionO: "",
      tarjeta_circulacion: "",
      poliza: "",
      foto_unidadFrontal: "",
      foto_unidadTrasera: "",
    });
    setCurrentFileView({ type: null, url: "", fileName: "" });
    setCurrentItem(null);
    setLoadingUrls(false);
  };

  const renderFileIcon = (fileName: string) => {
    const type = getFileType(fileName);
    switch (type) {
      case "pdf":
        return <PictureAsPdfIcon style={{ color: "#0A2D5A" }} />;
      case "image":
        return <ImageIcon style={{ color: "#0A2D5A" }} />;
      default:
        return <InsertDriveFileIcon style={{ color: "#0A2D5A" }} />;
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
            width: "80%",
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
              Documentos de Operador
            </Typography>
            <IconButton
              onClick={handleCloseModal}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

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
                  borderRadius: "8px",
                  background: "rgba(25, 118, 210, 0.05)",
                  border: "1px solid rgba(25, 118, 210, 0.2)",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "#1976d2", textAlign: "center", mb: 2 }}
                >
                  Detalles del registro de operador
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ width: { xs: "100%", md: "calc(50% - 16px)" } }}>
                      <Typography>
                        <strong>ID Documento:</strong>{" "}
                        {currentItem.id_documentoOperador}
                      </Typography>
                    </Box>
                    <Box sx={{ width: { xs: "100%", md: "calc(50% - 16px)" } }}>
                      <Typography>
                        <strong>Operador:</strong>{" "}
                        {getNombreOperador(currentItem.id_operador)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ width: { xs: "100%", md: "calc(50% - 16px)" } }}>
                    <Typography>
                      <strong>Fecha Registro:</strong>{" "}
                      {currentItem.fecha_registro}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {loadingUrls ? (
              <Box sx={{ textAlign: "center", py: 4, color: "#1976d2" }}>
                <CircularProgress color="inherit" />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Cargando documentos...
                </Typography>
              </Box>
            ) : (
              <Box>
                {currentFileView.type ? (
                  renderFilePreview()
                ) : (
                  <Grid container spacing={3}>
                    {/* Licencia */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          height: "100%",
                          p: 2,
                          border: "1px solid rgba(25, 118, 210, 0.3)",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <InsertDriveFileIcon
                            sx={{ color: "#1976d2", mr: 1 }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{ color: "#1976d2", fontWeight: "medium" }}
                          >
                            Licencia
                          </Typography>
                        </Box>
                        {fileUrls.licencia && currentItem?.licencia ? (
                          <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            <Button
                              variant="contained"
                              onClick={() =>
                                handleViewFile(
                                  "licencia",
                                  fileUrls.licencia,
                                  currentItem.licencia
                                )
                              }
                              sx={{
                                background:
                                  "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                                color: "white",
                                fontWeight: "600",
                                "&:hover": {
                                  background:
                                    "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                                },
                              }}
                            >
                              Ver Archivo
                            </Button>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.disabled" }}
                          >
                            No disponible
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Identificación */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          height: "100%",
                          p: 2,
                          border: "1px solid rgba(25, 118, 210, 0.3)",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <InsertDriveFileIcon
                            sx={{ color: "#1976d2", mr: 1 }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{ color: "#1976d2", fontWeight: "medium" }}
                          >
                            Identificación
                          </Typography>
                        </Box>
                        {fileUrls.identificacionO &&
                        currentItem?.identificacionO ? (
                          <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            <Button
                              variant="contained"
                              onClick={() =>
                                handleViewFile(
                                  "identificacionO",
                                  fileUrls.identificacionO,
                                  currentItem.identificacionO
                                )
                              }
                              sx={{
                                background:
                                  "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                                color: "white",
                                fontWeight: "600",
                                "&:hover": {
                                  background:
                                    "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                                },
                              }}
                            >
                              Ver Archivo
                            </Button>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.disabled" }}
                          >
                            No disponible
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Tarjeta de circulación */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          height: "100%",
                          p: 2,
                          border: "1px solid rgba(25, 118, 210, 0.3)",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <InsertDriveFileIcon
                            sx={{ color: "#1976d2", mr: 1 }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{ color: "#1976d2", fontWeight: "medium" }}
                          >
                            Tarjeta Circulación
                          </Typography>
                        </Box>
                        {fileUrls.tarjeta_circulacion &&
                        currentItem?.tarjeta_circulacion ? (
                          <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            <Button
                              variant="contained"
                              onClick={() =>
                                handleViewFile(
                                  "tarjeta_circulacion",
                                  fileUrls.tarjeta_circulacion,
                                  currentItem.tarjeta_circulacion
                                )
                              }
                              sx={{
                                background:
                                  "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                                color: "white",
                                fontWeight: "600",
                                "&:hover": {
                                  background:
                                    "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                                },
                              }}
                            >
                              Ver Archivo
                            </Button>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.disabled" }}
                          >
                            No disponible
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Póliza */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          height: "100%",
                          p: 2,
                          border: "1px solid rgba(25, 118, 210, 0.3)",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <InsertDriveFileIcon
                            sx={{ color: "#1976d2", mr: 1 }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{ color: "#1976d2", fontWeight: "medium" }}
                          >
                            Póliza
                          </Typography>
                        </Box>
                        {fileUrls.poliza && currentItem?.poliza ? (
                          <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            <Button
                              variant="contained"
                              onClick={() =>
                                handleViewFile(
                                  "poliza",
                                  fileUrls.poliza,
                                  currentItem.poliza
                                )
                              }
                              sx={{
                                background:
                                  "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                                color: "white",
                                fontWeight: "600",
                                "&:hover": {
                                  background:
                                    "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                                },
                              }}
                            >
                              Ver Archivo
                            </Button>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.disabled" }}
                          >
                            No disponible
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Foto Frontal */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          height: "100%",
                          p: 2,
                          border: "1px solid rgba(25, 118, 210, 0.3)",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <InsertDriveFileIcon
                            sx={{ color: "#1976d2", mr: 1 }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{ color: "#1976d2", fontWeight: "medium" }}
                          >
                            Foto Frontal
                          </Typography>
                        </Box>
                        {fileUrls.foto_unidadFrontal &&
                        currentItem?.foto_unidadFrontal ? (
                          <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            <Button
                              variant="contained"
                              onClick={() =>
                                handleViewFile(
                                  "foto_unidadFrontal",
                                  fileUrls.foto_unidadFrontal,
                                  currentItem.foto_unidadFrontal
                                )
                              }
                              sx={{
                                background:
                                  "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                                color: "white",
                                fontWeight: "600",
                                "&:hover": {
                                  background:
                                    "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                                },
                              }}
                            >
                              Ver Archivo
                            </Button>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.disabled" }}
                          >
                            No disponible
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Foto Trasera */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          height: "100%",
                          p: 2,
                          border: "1px solid rgba(25, 118, 210, 0.3)",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <InsertDriveFileIcon
                            sx={{ color: "#1976d2", mr: 1 }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{ color: "#1976d2", fontWeight: "medium" }}
                          >
                            Foto Trasera
                          </Typography>
                        </Box>
                        {fileUrls.foto_unidadTrasera &&
                        currentItem?.foto_unidadTrasera ? (
                          <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            <Button
                              variant="contained"
                              onClick={() =>
                                handleViewFile(
                                  "foto_unidadTrasera",
                                  fileUrls.foto_unidadTrasera,
                                  currentItem.foto_unidadTrasera
                                )
                              }
                              sx={{
                                background:
                                  "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                                color: "white",
                                fontWeight: "600",
                                "&:hover": {
                                  background:
                                    "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                                },
                              }}
                            >
                              Ver Archivo
                            </Button>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.disabled" }}
                          >
                            No disponible
                          </Typography>
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
      <form onSubmit={handleSubmit} className="form-uniform">
        {/* Primera fila */}
        <div className="form-row-uniform">
          {isEditing && (
            <div className="form-group-uniform">
              <label className="uniform-label">ID Documento:</label>
              <input
                type="text"
                value={formData.id_documentoOperador || ""}
                disabled
                className="uniform-input bg-gray-100"
              />
            </div>
          )}

          <div className="form-group-uniform">
            <label className="uniform-label">Operador:</label>
            <Select
              options={operadores.map((operador) => ({
                value: operador.id_operador,
                label:
                  operador.nombre_operador ||
                  `Operador ${operador.id_operador}`,
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
              className="uniform-select"
              isDisabled={loading}
            />
          </div>

          <div className="form-group-uniform">
            <label className="uniform-label">Fecha de Registro:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              className="uniform-input"
              placeholderText="Seleccione la fecha"
              disabled={loading}
            />
          </div>
        </div>

        {/* Segunda fila */}
        <div className="form-row-uniform">
          <div className="form-group-uniform">
            <label className="uniform-label">Licencia:</label>
            <div className="uniform-file-upload">
              <input
                type="file"
                id="file-licencia"
                onChange={handleFileGetAWSChange}
                className="uniform-file-input"
                disabled={loading}
                required={!isEditing || (isEditing && !formData.licencia)}
              />
              <label htmlFor="file-licencia" className="uniform-file-button">
                📄 Licencia
              </label>
              {fileGetAWS && (
                <p className="uniform-file-info">{fileGetAWS.name}</p>
              )}
              {isEditing && !fileGetAWS && formData.licencia && (
                <p className="uniform-file-info">
                  Archivo actual: {formData.licencia}
                </p>
              )}
            </div>
          </div>

          <div className="form-group-uniform">
            <label className="uniform-label">Credencial de elector:</label>
            <div className="uniform-file-upload">
              <input
                type="file"
                id="file-credencial"
                onChange={handleFilePostAWSChange}
                className="uniform-file-input"
                disabled={loading}
                required={
                  !isEditing || (isEditing && !formData.identificacionO)
                }
              />
              <label htmlFor="file-credencial" className="uniform-file-button">
                🪪 Credencial
              </label>
              {filePostAWS && (
                <p className="uniform-file-info">{filePostAWS.name}</p>
              )}
              {isEditing && !filePostAWS && formData.identificacionO && (
                <p className="uniform-file-info">
                  Archivo actual: {formData.identificacionO}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tercera fila */}
        <div className="form-row-uniform">
          <div className="form-group-uniform">
            <label className="uniform-label">Tarjeta de circulación:</label>
            <div className="uniform-file-upload">
              <input
                type="file"
                id="file-tarjeta"
                onChange={handleFileTarjetaCirculacionChange}
                className="uniform-file-input"
                disabled={loading}
                required={
                  !isEditing || (isEditing && !formData.tarjeta_circulacion)
                }
              />
              <label htmlFor="file-tarjeta" className="uniform-file-button">
                🚗 Tarjeta circulación
              </label>
              {fileTarjetaCirculacion && (
                <p className="uniform-file-info">
                  {fileTarjetaCirculacion.name}
                </p>
              )}
              {isEditing &&
                !fileTarjetaCirculacion &&
                formData.tarjeta_circulacion && (
                  <p className="uniform-file-info">
                    Archivo actual: {formData.tarjeta_circulacion}
                  </p>
                )}
            </div>
          </div>

          <div className="form-group-uniform">
            <label className="uniform-label">Póliza:</label>
            <div className="uniform-file-upload">
              <input
                type="file"
                id="file-poliza"
                onChange={handleFilePolizaChange}
                className="uniform-file-input"
                disabled={loading}
                required={!isEditing || (isEditing && !formData.poliza)}
              />
              <label htmlFor="file-poliza" className="uniform-file-button">
                📑 Póliza
              </label>
              {filePoliza && (
                <p className="uniform-file-info">{filePoliza.name}</p>
              )}
              {isEditing && !filePoliza && formData.poliza && (
                <p className="uniform-file-info">
                  Archivo actual: {formData.poliza}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cuarta fila */}
        <div className="form-row-uniform">
          <div className="form-group-uniform">
            <label className="uniform-label">Foto frontal de la unidad:</label>
            <div className="uniform-file-upload">
              <input
                type="file"
                id="file-frontal"
                accept="image/*"
                onChange={handleFileFotoFrontalChange}
                className="uniform-file-input"
                disabled={loading}
                required={
                  !isEditing || (isEditing && !formData.foto_unidadFrontal)
                }
              />
              <label htmlFor="file-frontal" className="uniform-file-button">
                📷 Foto frontal
              </label>
              {fileFotoFrontal && (
                <p className="uniform-file-info">{fileFotoFrontal.name}</p>
              )}
              {isEditing && !fileFotoFrontal && formData.foto_unidadFrontal && (
                <p className="uniform-file-info">
                  Archivo actual: {formData.foto_unidadFrontal}
                </p>
              )}
            </div>
          </div>

          <div className="form-group-uniform">
            <label className="uniform-label">Foto trasera de la unidad:</label>
            <div className="uniform-file-upload">
              <input
                type="file"
                id="file-trasera"
                accept="image/*"
                onChange={handleFileFotoTraseraChange}
                className="uniform-file-input"
                disabled={loading}
                required={
                  !isEditing || (isEditing && !formData.foto_unidadTrasera)
                }
              />
              <label htmlFor="file-trasera" className="uniform-file-button">
                📷 Foto trasera
              </label>
              {fileFotoTrasera && (
                <p className="uniform-file-info">{fileFotoTrasera.name}</p>
              )}
              {isEditing && !fileFotoTrasera && formData.foto_unidadTrasera && (
                <p className="uniform-file-info">
                  Archivo actual: {formData.foto_unidadTrasera}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="form-buttons-uniform">
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
              className="uniform-cancel-button"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Seccion de buscador de los registros de los documentos */}
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
          }}
        >
          {loading ? "Recargando..." : "Recargar Tabla"}
        </button>
      </div>

      {/* Tabla de documentos de operadores */}
      <div className="rodval-table-wrapper">
        <table className="rodval-table">
          <thead>
            <tr>
              <th>ID Documento</th>
              <th>Operador</th>
              <th>Fecha Registro</th>
              <th>Licencia</th>
              <th>Identificación</th>
              <th>Tarjeta Circulación</th>
              <th>Póliza</th>
              <th>Foto Frontal</th>
              <th>Foto Trasera</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && !currentItems.length ? (
              <tr>
                <td colSpan={10} className="rodval-no-data">
                  Cargando...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="rodval-no-data">
                  No hay documentos disponibles
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.id_documentoOperador}>
                  <td>{item.id_documentoOperador}</td>
                  <td>{getNombreOperador(item.id_operador)}</td>
                  <td>{item.fecha_registro}</td>
                  <td
                    className="rodval-truncate"
                    title={item.licencia || undefined}
                  >
                    {item.licencia || "No disponible"}
                  </td>
                  <td
                    className="rodval-truncate"
                    title={item.identificacionO || undefined}
                  >
                    {item.identificacionO || "No disponible"}
                  </td>
                  <td
                    className="rodval-truncate"
                    title={item.tarjeta_circulacion || undefined}
                  >
                    {item.tarjeta_circulacion || "No disponible"}
                  </td>
                  <td
                    className="rodval-truncate"
                    title={item.poliza || undefined}
                  >
                    {item.poliza || "No disponible"}
                  </td>
                  <td
                    className="rodval-truncate"
                    title={item.foto_unidadFrontal || undefined}
                  >
                    {item.foto_unidadFrontal || "No disponible"}
                  </td>
                  <td
                    className="rodval-truncate"
                    title={item.foto_unidadTrasera || undefined}
                  >
                    {item.foto_unidadTrasera || "No disponible"}
                  </td>
                  <td>
                    <div className="rodval-actions">
                      <button
                        onClick={() => handleEdit(item)}
                        className="rodval-icon-button rodval-edit"
                        title="Editar"
                        disabled={loading}
                      >
                        <EditSquareIcon fontSize="small" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="rodval-icon-button rodval-view"
                        title="Ver imágenes"
                        disabled={loading}
                      >
                        <ImageIcon fontSize="small" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id_documentoOperador)}
                        className="rodval-icon-button rodval-delete"
                        title="Eliminar"
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
      </div>

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
  );
}
