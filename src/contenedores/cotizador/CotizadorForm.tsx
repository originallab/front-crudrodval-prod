import React, { useState, useEffect, useRef } from "react";
import "./Cotizador.css";

// Definición de interfaces
interface ProductItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  tax: number;
}

interface InvoiceData {
  customer: {
    name: string;
    email: string;
  };
  subject: string;
  dueDate: string;
  currency: string;
  products: ProductItem[];
  discount: number;
}

interface InvoiceTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

const CotizadorForm: React.FC = () => {
  // Estados
  const [customer] = useState({ name: "John Smith", email: "john_s@mail.com" });
  const [subject, setSubject] = useState("Service per June 2025");
  const [dueDate, setDueDate] = useState("2025-11-10");
  const [currency] = useState("IDR");
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: "1",
      name: "Summer 2K23 T-shirt",
      price: 125000,
      qty: 1,
      tax: 10,
    },
  ]);
  const [discountRate] = useState(0.1);
  const [lastSaved, setLastSaved] = useState("Today at 4:30 PM");
  const [activePreviewTab, setActivePreviewTab] = useState("pdf");

  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Calculo de totales
  const calculateTotals = (): InvoiceTotals => {
    let subtotal = 0;

    products.forEach((product) => {
      subtotal += product.price * product.qty;
    });

    const discount = subtotal * discountRate;
    const tax = (subtotal - discount) * 0.1; // 10% tax rate
    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total };
  };

  // Formatear moneda
  const formatCurrency = (num: number): string => {
    return (
      new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num) + " IDR"
    );
  };

  // Agregar nuevo producto
  const addNewProduct = () => {
    const newProduct: ProductItem = {
      id: Date.now().toString(),
      name: "New Product",
      price: 0,
      qty: 1,
      tax: 10,
    };
    setProducts([...products, newProduct]);
  };

  // Eliminar producto
  const deleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  // Actualizar producto
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

  // Autoguardado
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
      console.log("Factura guardada automáticamente");
    }, 1000);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [products, subject, dueDate]);

  // Procesar factura
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

    setTimeout(() => {
      console.log("Procesando factura:", {
        customer,
        subject,
        dueDate,
        currency,
        products,
        discount: discountRate,
      });
      alert("Factura procesada exitosamente!");
    }, 1000);
  };

  // Cancelar factura
  const cancelInvoice = () => {
    if (window.confirm("¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.")) {
      window.history.back();
    }
  };

  const totals = calculateTotals();

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="logo-section">
          <div className="logo">Arto+</div>
          <h2>Create Invoice</h2>
        </div>
        <div className="help-section">
          <div className="help-button">
            <i className="fas fa-question-circle"></i>
            <span>Do you need help?</span>
          </div>
          <button className="close-button">×</button>
        </div>
      </header>

      <div className="main-content">
        {/* Left Panel - Invoice Details */}
        <div className="left-panel">
          <div className="section invoice-details">
            <h3>Invoice Details</h3>

            {/* People Section */}
            <div className="form-group">
              <label>
                People <span className="required">*</span>
              </label>
              <div className="client-select">
                <div className="client-avatar">JS</div>
                <div className="client-info">
                  <div className="client-name">{customer.name}</div>
                  <div className="client-email">{customer.email}</div>
                </div>
                <span className="dropdown-arrow">
                  <button className="client-type-btn">On Arto+</button>
                  <i className="fas fa-pen"></i>
                </span>
              </div>
            </div>

            {/* Subject */}
            <div className="form-group">
              <label>
                Subject <span className="required">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Currency */}
            <div className="form-group">
              <label>Currency</label>
              <select className="form-input">
                <option>🇮🇩 IDR - Indonesian Rupiah</option>
              </select>
            </div>
          </div>

          {/* Product Section */}
          <div className="section product-section">
            <h3>Product</h3>

            <table className="product-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Tax</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-item">
                        <div className="product-image"></div>
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
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="add-item-btn" onClick={addNewProduct}>
              <i className="fas fa-plus"></i>
              Add New Line
            </button>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="coupon-btn">Add Coupon</button>
              <button className="discount-btn">Add Discount</button>
              <select className="discount-select">
                <option>Summer Sale 10th</option>
              </select>
            </div>
          </div>

          {/* Footer Information */}
          <div className="footer-info">
            <span>Last saved: {lastSaved}</span>
            <div className="footer-buttons">
              <button className="cancel-btn" onClick={cancelInvoice}>
                Cancel
              </button>
              <button className="process-btn" onClick={processInvoice}>
                Processing Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="right-panel">
          <div className="preview-header">
            <h3>Preview</h3>
            <button className="info-tooltip">i</button>
          </div>

          <div className="preview-buttons">
            <button
              className={`preview-btn ${
                activePreviewTab === "pdf" ? "active" : ""
              }`}
              onClick={() => setActivePreviewTab("pdf")}
            >
              <i className="fas fa-file-pdf"></i>
              PDF
            </button>
            <button
              className={`preview-btn ${
                activePreviewTab === "email" ? "active" : ""
              }`}
              onClick={() => setActivePreviewTab("email")}
            >
              <i className="fas fa-envelope"></i>
              Email
            </button>
            <button
              className={`preview-btn ${
                activePreviewTab === "payment" ? "active" : ""
              }`}
              onClick={() => setActivePreviewTab("payment")}
            >
              <i className="fas fa-credit-card"></i>
              Payment page
            </button>
          </div>

          {/* Invoice Preview */}
          <div className="invoice-preview">
            <div className="invoice-header">
              <div className="invoice-number">INV2398-09-097</div>
            </div>

            <div className="invoice-info-grid">
              <div className="invoice-field">
                <label>Due date</label>
                <div>
                  {new Date(dueDate).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="invoice-field">
                <label>Subject</label>
                <div>{subject}</div>
              </div>
              <div className="invoice-field">
                <label>From</label>
                <div>{customer.name}</div>
                <div>{customer.email}</div>
              </div>
              <div className="invoice-field">
                <label>Currency</label>
                <div>IDR - Indonesian Rupiah</div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th>QTY</th>
                  <th>UNIT PRICE</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="item-description">
                        <div className="item-image"></div>
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>{product.qty}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{formatCurrency(product.price * product.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Invoice Totals */}
            <div className="invoice-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="total-row">
                <span>Discount 10%</span>
                <span>-{formatCurrency(totals.discount)}</span>
              </div>
              <div className="total-row">
                <span>Tax</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              <div className="total-row final-amount">
                <span>Amount due</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>

            {/* Attachment Section */}
            <div className="attachment-section">
              <div className="attachment-label">Attachment</div>
              <div className="attachment-item">
                <i className="fas fa-file-pdf"></i>
                <span>Product list PDF</span>
                <button className="download-btn">Download ⬇</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CotizadorForm;