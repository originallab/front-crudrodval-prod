import React, { useState, useEffect, useRef } from "react";
import { FaTruck, FaQuestionCircle, FaFilePdf,  FaTrash, FaPlus, FaFilePdf as FaFilePdfIcon } from "react-icons/fa";
import "./Cotizador.css"
import logo from '../../assets/images/iconoRodval.svg';

 {/* Referencias las tablas auxiliares de acceso */}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  tax: number;
}

interface InvoiceTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

const CotizadorForm: React.FC = () => {
  const [customer] = useState({ name: "Sergio Partida", email: "sergipart12@gmail.com" });
  const [subject, setSubject] = useState("Agregar una descripción");
  const [dueDate, setDueDate] = useState("2025-11-10");
  const [currency] = useState("IDR");
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: "1",
      name: "Torton de 50 toneladas",
      price: 125000,
      qty: 1,
      tax: 50,
    },
    {
      id: "2",
      name: "Plataforma de 50 toneladas",
      price: 150000,
      qty: 1,
      tax: 50,
    },
  ]);
  const [discountRate] = useState(0.1);
  const [lastSaved, setLastSaved] = useState("Today at 4:30 PM");
  const [activePreviewTab, setActivePreviewTab] = useState("pdf");
  const [showPreview, setShowPreview] = useState(true);

  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const calculateTotals = (): InvoiceTotals => {
    let subtotal = 0;
    products.forEach((product) => {
      subtotal += product.price * product.qty;
    });
    const discount = subtotal * discountRate;
    const tax = (subtotal - discount) * 0.16;
    const total = subtotal - discount + tax;
    return { subtotal, discount, tax, total };
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) + " Pesos";
  };

  const addNewProduct = () => {
    const newProduct: ProductItem = {
      id: Date.now().toString(),
      name: "New Product",
      price: 0,
      qty: 1,
      tax: 50,
    };
    setProducts([...products, newProduct]);
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const updateProduct = (id: string, field: keyof ProductItem, value: any) => {
    setProducts(
      products.map((product) => {
        if (product.id === id) {
          return { ...product, [field]: value };
        }
        return product;
      })
    );
  };

  useEffect(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setLastSaved(`Today at ${timeString}`);
    }, 1000);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [products, subject, dueDate]);

  const processInvoice = () => {
    if (!customer.name) {
      alert("Por favor, selecciona un cliente.");
      return;
    }

    if (products.length === 0) {
      alert("Por favor, agrega al menos un producto.");
      return;
    }

    alert("Procesando factura...");
  };

  const cancelInvoice = () => {
    if (window.confirm("¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.")) {
      window.history.back();
    }
  };

  const totals = calculateTotals();

  return (
    <div className="dashboard-container">
      {/* Header con icono */}
      <header className="dashboard-header">
        <div className="logo-section">
          <img src={logo} alt="RODVAL Logo" className="logo-image" width="310" height="310"  />
          <h2 style={{ textAlign: 'left', margin: 15, padding: 20 }}>Cotizador de los viajes de los transportes</h2>
        </div>
      </header>

      <div className="main-content">
        {/* Panel de formulario */}
         
        <div className="form-panel">
          
          <div className="invoice-container">
          <div className="section invoice-details">
            <div className="invoice-info">
             <h3>Información General</h3>
            <div className="form-group">
              <label>Operador :<span className="required">*</span></label>
              <div className="client-select">
                <div className="client-avatar">SP</div>
                <div className="client-info">
                  <div className="client-name">{customer.name}</div>
                  <div className="client-email">{customer.email}</div>
                </div>
                <span className="dropdown-arrow">
                  <i className="fas fa-pen"></i>
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción del servicio:<span className="required">*</span></label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Fecha del servicio:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Origen</label>
              <select className="form-input">
                <option>🇮🇩 IDR - Cancún Mexico</option>
                <option>🇺🇸 USD - New York, USA</option>
              </select>
            </div>

            <div className="form-group">
              <label>Destino</label>
              <select className="form-input">
                <option>🇮🇩 IDR - Cancún Mexico</option>
                <option>🇺🇸 USD - New York, USA</option>
              </select>
            </div>
          </div>
         </div>
       
        {/*Seccion de los serviccios alineados a la izquierda*/}
         <div className="invoice-services">
          <div className="section product-section">
            <h3>Servicios</h3>
            <table className="product-table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Kilometraje</th>
                  <th>Precio</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-item">
                        <div className="product-info">
                          <div className="product-name">{product.name}</div>
                          <div className="product-price">
                            {formatCurrency(product.price)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={product.qty}
                        onChange={(e) =>
                          updateProduct(
                            product.id,
                            "qty",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="qty-input"
                      />
                    </td>
                    <td>
                      <select
                        value={product.tax}
                        onChange={(e) =>
                          updateProduct(
                            product.id,
                            "tax",
                            parseFloat(e.target.value)
                          )
                        }
                        className="tax-select"
                      >
                        <option value="10">10%</option>
                        <option value="5">5%</option>
                        <option value="0">0%</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-item-btn" onClick={addNewProduct}>
              <FaPlus />
              Agregar servicio
            </button>
          </div>
          <div className="footer-info">
            <span>Último guardado: {lastSaved}</span>
            <div className="footer-buttons">
              <button className="process-btn" onClick={processInvoice}>
                Guardar Cotizacion
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>
      
      {showPreview && (
        <div className="preview-container">
          <div className="preview-buttons">
            <button
              className={`preview-btn ${activePreviewTab === "pdf" ? "active" : ""}`}
              onClick={() => setActivePreviewTab("pdf")}
            >
              <FaFilePdf />
              PREVISUALIZACIÓN
            </button>
           
          </div>

          <div className="invoice-preview">
            <div className="invoice-header">
              <div className="invoice-number">Cotización RODVAL</div>
            </div>

            <div className="invoice-info-grid">
              <div className="invoice-field">
                <label>Fecha</label>
                <div>
                  {new Date(dueDate).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="invoice-field">
                <label>Descripción</label>
                <div>{subject}</div>
              </div>
              <div className="invoice-field">
                <label>Operador</label>
                <div>{customer.name}</div>
                <div>{customer.email}</div>
              </div>
              <div className="invoice-field">
                <label>Moneda</label>
                <div>IDR - Rupia Indonesia</div>
              </div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>DESCRIPCIÓN</th>
                  <th>CANTIDAD</th>
                  <th>PRECIO UNITARIO</th>
                  <th>IMPORTE</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.qty}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{formatCurrency(product.price * product.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="total-row">
                <span>Descuento 10%</span>
                <span>-{formatCurrency(totals.discount)}</span>
              </div>
              <div className="total-row">
                <span>Impuestos</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              <div className="total-row final-amount">
                <span>Total a pagar</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CotizadorForm;