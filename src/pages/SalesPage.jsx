import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/sales.css';

// Componente Modal simple para confirmaciones
const Modal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <h5 className="modal-title">{title}</h5>
        <p>{message}</p>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

// 💰 NUEVO Componente para el modal de pago
const PaymentModal = ({ show, cartTotal, onConfirm, onCancel }) => {
  const [cashReceived, setCashReceived] = useState('');
  const [changeDue, setChangeDue] = useState(0);

  // Formato de precio para mostrar en el modal
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Efecto para recalcular el vuelto
  useEffect(() => {
    const received = parseFloat(cashReceived) || 0;
    const change = received - cartTotal;
    setChangeDue(change > 0 ? change : 0);
  }, [cashReceived, cartTotal]);

  // Manejador para el botón de confirmar pago
  const handleConfirm = () => {
    const received = parseFloat(cashReceived) || 0;
    if (received < cartTotal) {
      alert('El monto recibido es menor que el total.');
      return;
    }
    onConfirm(received, changeDue);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <h5 className="modal-title">Confirmar Venta</h5>
        <p>Total a pagar: <strong>{formatPrice(cartTotal)}</strong></p>
        <div className="mb-3">
          <label htmlFor="cashReceivedInput" className="form-label">Monto recibido:</label>
          <input
            id="cashReceivedInput"
            type="number"
            className="form-control"
            value={cashReceived}
            onChange={(e) => setCashReceived(e.target.value)}
            placeholder="Ingrese el monto..."
            min="0"
          />
        </div>
        <div className="d-flex justify-content-between mb-3 fw-bold">
          <span>Vuelto:</span>
          <span>{formatPrice(changeDue)}</span>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleConfirm}
            disabled={parseFloat(cashReceived) < cartTotal}
          >
            Pagar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SalesPage() {
  // Estado para gestionar los datos de la aplicación
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showCartTick, setShowCartTick] = useState(false);
  const [scannedCode, setScannedCode] = useState('');

  // 💰 Estado para controlar la visibilidad del modal de pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const registryLogRef = useRef(null);
  const paymentMethodRef = useRef(null);

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  const showToast = useCallback((title, message, type = 'success') => {
    const id = Date.now();
    const newToast = { id, title, message, type };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const showTick = useCallback(() => {
    setShowCartTick(true);
    setTimeout(() => setShowCartTick(false), 1000);
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      if (window.electronAPI && window.electronAPI.getProducts) {
        const data = await window.electronAPI.getProducts();
        setProducts(data);
      } else {
        const mockProducts = [
          { id: 1, codigo_producto: 'REF001', nombre: 'Refresco Cola 2L', precio_venta: 1500, stock_actual: 50 },
          { id: 2, codigo_producto: 'AGUA002', nombre: 'Agua Mineral 1.5L', precio_venta: 800, stock_actual: 100 },
          { id: 3, codigo_producto: 'SNK003', nombre: 'Papas Fritas Grandes', precio_venta: 1200, stock_actual: 30 },
          { id: 4, codigo_producto: 'LCH004', nombre: 'Leche Entera 1L', precio_venta: 1000, stock_actual: 40 },
          { id: 5, codigo_producto: 'PAN005', nombre: 'Pan de Molde Blanco', precio_venta: 2500, stock_actual: 20 },
        ];
        setProducts(mockProducts);
        showToast('Advertencia', 'Usando datos de productos de prueba (no Electron API)', 'warning');
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      showToast('Error', 'No se pudieron cargar los productos desde la base de datos', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const addToCart = useCallback((productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItemIndex = cartItems.findIndex((item) => item.id === productId);

    if (existingItemIndex !== -1) {
      const existingItem = cartItems[existingItemIndex];
      if (existingItem.quantity < product.stock_actual) {
        setCartItems(
          cartItems.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
        showTick();
      } else {
        showToast('Stock insuficiente', `No hay suficiente stock para ${product.nombre}`, 'error');
      }
    } else {
      if (product.stock_actual > 0) {
        const newItem = {
          id: product.id,
          nombre: product.nombre,
          precio_venta: product.precio_venta,
          quantity: 1,
        };
        setCartItems((prevItems) => [...prevItems, newItem]);
        showTick();
      } else {
        showToast('Sin stock', `${product.nombre} está agotado`, 'error');
      }
    }
  }, [products, cartItems, showTick, showToast]);

  const updateQuantity = useCallback((productId, change) => {
    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex((item) => item.id === productId);
      if (itemIndex === -1) return prevItems;
      const newItems = [...prevItems];
      const item = newItems[itemIndex];
      const productInStock = products.find(p => p.id === productId);
      if (!productInStock) return prevItems;

      const newQuantity = item.quantity + change;

      if (newQuantity <= 0) {
        showTick();
        return newItems.filter((i) => i.id !== productId);
      }
      if (newQuantity > productInStock.stock_actual) {
        showToast('Stock insuficiente', `No hay suficiente stock para ${item.nombre}`, 'error');
        return prevItems;
      }

      newItems[itemIndex].quantity = newQuantity;
      showTick();
      return newItems;
    });
  }, [products, showTick, showToast]);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) => {
      showTick();
      return prevItems.filter((item) => item.id !== productId);
    });
  }, [showTick]);

  // 💰 Nueva función para abrir el modal de pago
  const handleOpenPaymentModal = useCallback(() => {
    if (cartItems.length === 0) {
      showToast('Error', 'No hay productos en el carrito', 'error');
      return;
    }
    setShowPaymentModal(true);
  }, [cartItems, showToast]);

  // 💰 Nueva función para completar la venta después de la confirmación en el modal
  const handleConfirmPayment = useCallback(async (cashReceived, changeDue) => {
    setIsProcessingSale(true);
    setShowPaymentModal(false); // Cierra el modal de pago
    try {
      const metodoPago = 'Efectivo'; // 💰 Se asume que siempre será efectivo si se usa este modal
      const res = await window.electronAPI.processSale({
        cartItems: cartItems,
        metodoPago: metodoPago,
        cashReceived: cashReceived, // 💰 Se pasa el monto recibido
        changeDue: changeDue,       // 💰 Se pasa el vuelto calculado
      });

      if (res.success) {
        const total = cartItems.reduce((sum, item) => sum + item.precio_venta * item.quantity, 0);
        showToast('Venta Completada', `Total: ${formatPrice(total)}`, 'success');
        setCartItems([]);
        loadProducts();
      } else {
        showToast('Error en la venta', res.message || 'Error al procesar la venta. Inténtelo de nuevo.', 'error');
      }
    } catch (error) {
      console.error("Error al completar la venta:", error);
      showToast('Error fatal', 'No se pudo comunicar con el servidor para completar la venta.', 'error');
    } finally {
      setIsProcessingSale(false);
    }
  }, [cartItems, showToast, formatPrice, loadProducts]);

  const handleCancelSale = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  useEffect(() => {
    const savedCart = localStorage.getItem('minimarket-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        setCartItems([]);
      }
    }
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    localStorage.setItem('minimarket-cart', JSON.stringify(cartItems));
    if (registryLogRef.current) {
      registryLogRef.current.scrollTop = registryLogRef.current.scrollHeight;
    }
  }, [cartItems]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      const focusedElement = document.activeElement;
      if (focusedElement.tagName === 'INPUT' && focusedElement.type === 'text') {
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (scannedCode) {
          const product = products.find((p) => p.codigo_producto === scannedCode);
          if (product) {
            addToCart(product.id);
          } else {
            showToast('Producto no encontrado', `No se encontró un producto con el código ${scannedCode}`, 'error');
          }
        }
        setScannedCode('');
      } else {
        setScannedCode((prevCode) => prevCode + e.key);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [products, scannedCode, addToCart, showToast]);

  const filteredProducts = products.filter(
    (product) =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo_producto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cartItems.reduce((sum, item) => sum + item.precio_venta * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="container d-flex justify-content-between align-items-center h-100">
          <div className="d-flex align-items-center">
            <img
              src="https://cdn.pixabay.com/photo/2019/01/07/10/25/shop-3918567_960_720.png"
              alt="MiniMarket Pro Logo"
              className="logo"
            />
            <span className="ms-2 brand-font fs-4">MiniMarket Pro</span>
          </div>
          <h1 className="h5 mb-0">POS Ventas</h1>
        </div>
      </header>

      {/* Main Container */}
      <div className="container main-container">
        <div className="row">
          {/* Columna Izquierda: Búsqueda de Productos y Cuadrícula */}
          <div className="col-md-8">
            <div className="search-bar">
              <input
                type="text"
                id="productSearch"
                className="search-input"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <h2 className="mb-3">Productos</h2>
            <div id="productsContainer" className="products-container">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="mt-3">Cargando productos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="alert alert-info text-center p-4">
                  <i className="bi bi-search me-2"></i>
                  No se encontraron productos que coincidan con la búsqueda.
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    className="product-button"
                    onClick={() => addToCart(product.id)}
                  >
                    <div>
                      <div className="product-name">{product.nombre}</div>
                      <div className="product-code">
                        Código: {product.codigo_producto} | Stock: {product.stock_actual}
                      </div>
                    </div>
                    <div className="product-price">{formatPrice(product.precio_venta)}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Columna Derecha: Registro de Venta y Resumen */}
          <div className="col-md-4">
            <div className="registry-panel">
              <h3 className="mb-3 d-flex align-items-center">
                Registro de Venta
                {showCartTick && (
                  <i className="bi bi-check-circle-fill tick-icon"></i>
                )}
              </h3>
              <div id="registryLog" className="registry-log" ref={registryLogRef}>
                {cartItems.length === 0 ? (
                  <div className="text-center text-muted py-3">No hay productos registrados</div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="registry-entry border-bottom pb-2 mb-2">
                      <div className="registry-details">
                        <div className="registry-product">{item.nombre}</div>
                        <span>{formatPrice(item.precio_venta)} x {item.quantity}</span>
                        <div className="mt-1 fw-bold">{formatPrice(item.precio_venta * item.quantity)}</div>
                      </div>
                      <div className="registry-controls">
                        <button
                          className="control-btn"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <button
                          className="control-btn"
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.quantity >= (products.find(p => p.id === item.id)?.stock_actual || Infinity)}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                        <button
                          className="control-btn delete-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="sale-summary-right mt-4">
                <div className="card">
                  <div className="card-body">
                    <div className="cart-total">
                      <span>Total:</span>
                      <span id="totalAmount">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <span id="cartCount">{cartCount}</span> productos
                      </div>
                      <div>
                        <select 
                          id="paymentMethod" 
                          className="form-select" 
                          ref={paymentMethodRef}
                          onChange={() => {
                            // Esta lógica se moverá al modal
                          }}
                        >
                          <option value="Efectivo">Efectivo</option>
                          <option value="Tarjeta">Tarjeta</option>
                          <option value="Transferencia">Transferencia</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="cart-actions">
                      <button
                        id="completeSale"
                        className="btn btn-complete"
                        onClick={handleOpenPaymentModal} // 💰 Ahora este botón solo abre el modal
                        disabled={cartItems.length === 0 || isProcessingSale}
                      >
                        {isProcessingSale ? 'Procesando...' : (<><i className="bi bi-check-circle me-2"></i>Completar Venta</>)}
                      </button>
                      <button
                        id="cancelSale"
                        className="btn btn-cancel"
                        onClick={handleCancelSale}
                        disabled={cartItems.length === 0 || isProcessingSale}
                      >
                        <i className="bi bi-x-circle me-2"></i>Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <div id="toastContainer" className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'} show`}
          >
            <div className="toast-header">
              <div className="toast-icon">
                <i className={`bi ${toast.type === 'success' ? 'bi-check-lg' : 'bi-x-lg'}`}></i>
              </div>
              <h6 className="toast-title">{toast.title}</h6>
              <div
                className="toast-close"
                onClick={() => setToasts(toasts.filter((t) => t.id !== toast.id))}
              >
                <i className="bi bi-x"></i>
              </div>
            </div>
            <div className="toast-body">{toast.message}</div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación para cancelar */}
      <Modal
        show={showCancelModal}
        title="Cancelar Venta"
        message="¿Está seguro que desea cancelar la venta y vaciar el carrito?"
        onConfirm={() => {
          setCartItems([]);
          showToast('Venta Cancelada', 'Se ha vaciado el carrito', 'success');
          setShowCancelModal(false);
        }}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* 💰 Implementación del nuevo modal de pago */}
      <PaymentModal
        show={showPaymentModal}
        cartTotal={cartTotal}
        onConfirm={handleConfirmPayment}
        onCancel={() => setShowPaymentModal(false)}
      />
    </>
  );
}
