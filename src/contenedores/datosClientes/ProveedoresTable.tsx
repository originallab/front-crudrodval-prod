import React from 'react';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface ProveedoresTableProps {
  currentItems: any[];
  loading: boolean;
  busqueda: string;
  setBusqueda: (value: string) => void;
  fetchProveedores: () => void;
  handleEdit: (proveedor: any) => void;
  handleDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  filteredItems: any[];
  itemsPerPage: number;
}

const ProveedoresTable: React.FC<ProveedoresTableProps> = ({
  currentItems,
  loading,
  busqueda,
  setBusqueda,
  fetchProveedores,
  handleEdit,
  handleDelete,
  currentPage,
  totalPages,
  setCurrentPage,
  filteredItems,
  itemsPerPage
}) => {
  return (
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
          style={{
            backgroundColor: "#0A2D5A",
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
                  <td>{item.fecha_creacion}</td>
                  <td>{item.fecha_actualizacion}</td>
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
                        onClick={() => item.id_proveedor && handleDelete(item.id_proveedor)}
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
                <td colSpan={13} className="rodval-no-data">
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
};

export default ProveedoresTable;