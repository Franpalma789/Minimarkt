import React, { useState } from 'react';

function ProductsTable({ products, loading, categoryFilter, setCategoryFilter, categorias, reload, onUpdateProduct, onDeleteProduct }) {
  const [editingId, setEditingId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});

  // Función para formatear el precio a formato de moneda CLP
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Función para parsear un string de CLP a un número flotante
  const parseCLPString = (value) => {
    const stringValue = typeof value === 'number' ? value.toString() : value;
    return parseFloat(stringValue.replace(/\./g, '').replace(/[^0-9,-]+/g, '').replace(',', '.') || 0);
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditedProduct({
      ...product,
      // Asegurarse de que los precios y stocks sean números
      precio_compra: parseCLPString(product.precio_compra),
      precio_venta: parseCLPString(product.precio_venta),
      stock_actual: parseInt(product.stock_actual) || 0,
      stock_minimo: parseInt(product.stock_minimo) || 0,
      id_categoria: product.id_categoria,
      id_proveedor: product.id_proveedor
    });
  };

  const handleSaveClick = async () => {
    if (!editedProduct.nombre || isNaN(editedProduct.precio_compra) || isNaN(editedProduct.precio_venta) ||
      isNaN(editedProduct.stock_actual) || isNaN(editedProduct.stock_minimo) ||
      (editedProduct.id_categoria === null || editedProduct.id_categoria === undefined || editedProduct.id_categoria === '')) {
      // Usar un modal personalizado en lugar de alert()
      alert('Por favor, completa los campos obligatorios: Nombre, Precio Compra, Precio Venta, Stock Actual, Stock Mínimo y Categoría.');
      return;
    }

    try {
      const productToSave = {
        ...editedProduct,
        id_categoria: editedProduct.id_categoria ? parseInt(editedProduct.id_categoria) : null,
        id_proveedor: editedProduct.id_proveedor ? parseInt(editedProduct.id_proveedor) : null,
        stock_actual: parseInt(editedProduct.stock_actual),
        stock_minimo: parseInt(editedProduct.stock_minimo),
        fecha_vencimiento: editedProduct.fecha_vencimiento ? new Date(editedProduct.fecha_vencimiento).toISOString().split('T')[0] : null,
        unidad_medida: editedProduct.unidad_medida || ''
      };
      await onUpdateProduct(productToSave);
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar producto editado:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedProduct({});
  };

  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    if (['precio_compra', 'precio_venta', 'stock_actual', 'stock_minimo', 'id_proveedor'].includes(name)) {
      setEditedProduct(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'id_categoria') {
        setEditedProduct(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setEditedProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const filteredProducts = categoryFilter === 'all'
    ? products
    : products.filter(p => p.id_categoria && p.id_categoria.toString() === categoryFilter);

  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Lista de Productos</h5>
        <div>
          <label htmlFor="categoryFilter" className="me-2">Filtrar por Categoría:</label>
          <select
            id="categoryFilter"
            className="form-select form-select-sm d-inline-block w-auto me-2"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            {/* Se agrega un chequeo para asegurar que la prop 'categorias' no sea null o undefined */}
            {categorias && categorias.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.codigo_categoria} - {cat.nombre_categoria}
              </option>
            ))}
          </select>
          <button className="btn btn-sm btn-primary" onClick={reload} disabled={loading}>
            {loading ? 'Cargando...' : 'Recargar Productos'}
          </button>
        </div>
      </div>
      <div className="card-body">
        {loading && <div className="text-center">Cargando productos...</div>}
        {!loading && filteredProducts.length === 0 && (
          <div className="alert alert-info text-center" role="alert">
            No hay productos para mostrar.
          </div>
        )}
        {!loading && filteredProducts.length > 0 && (
          <div className="table-responsive">
            <table className="table table-striped table-hover table-sm">
              <thead className="table-dark">
                <tr>
                  <th>Código Producto</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Precio Compra</th>
                  <th>Precio Venta</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Unidad Medida</th>
                  <th>Código Categoría</th>
                  <th>Nombre Categoría</th>
                  <th>Nombre Proveedor</th>
                  <th>Fecha Vencimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    {editingId === product.id ? (
                      // Modo Edición
                      <>
                        <td><input type="text" name="codigo_producto" value={editedProduct.codigo_producto || ''} onChange={handleChangeEdit} className="form-control form-control-sm" /></td>
                        <td><input type="text" name="nombre" value={editedProduct.nombre || ''} onChange={handleChangeEdit} className="form-control form-control-sm" required /></td>
                        <td><textarea name="descripcion" value={editedProduct.descripcion || ''} onChange={handleChangeEdit} className="form-control form-control-sm" rows="1"></textarea></td>
                        <td><input type="number" name="precio_compra" value={editedProduct.precio_compra || ''} onChange={handleChangeEdit} className="form-control form-control-sm" required /></td>
                        <td><input type="number" name="precio_venta" value={editedProduct.precio_venta || ''} onChange={handleChangeEdit} className="form-control form-control-sm" required /></td>
                        <td><input type="number" name="stock_actual" value={editedProduct.stock_actual || ''} onChange={handleChangeEdit} className="form-control form-control-sm" required /></td>
                        <td><input type="number" name="stock_minimo" value={editedProduct.stock_minimo || ''} onChange={handleChangeEdit} className="form-control form-control-sm" required /></td>
                        <td>
                          <select name="unidad_medida" value={editedProduct.unidad_medida || ''} onChange={handleChangeEdit} className="form-select form-select-sm">
                            <option value="">Selecciona una opción</option>
                            <option value="unidad">Unidad</option>
                            <option value="kg">Kilogramo (kg)</option>
                            <option value="g">Gramo (g)</option>
                            <option value="l">Litro (l)</option>
                            <option value="ml">Mililitro (ml)</option>
                            <option value="paquete">Paquete</option>
                            <option value="caja">Caja</option>
                          </select>
                        </td>
                        <td>
                          {/* Se agrega un chequeo para asegurar que la prop 'categorias' no sea null o undefined */}
                          <select name="id_categoria" value={editedProduct.id_categoria || ''} onChange={handleChangeEdit} className="form-select form-select-sm" required>
                            <option value="">Selecciona</option>
                            {categorias && categorias.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.codigo_categoria}</option>
                            ))}
                          </select>
                        </td>
                        <td>{categorias && categorias.find(cat => cat.id === parseInt(editedProduct.id_categoria))?.nombre_categoria || 'N/A'}</td>
                        <td><input type="number" name="id_proveedor" value={editedProduct.id_proveedor || ''} onChange={handleChangeEdit} className="form-control form-control-sm" /></td>
                        <td><input type="date" name="fecha_vencimiento" value={editedProduct.fecha_vencimiento ? new Date(editedProduct.fecha_vencimiento).toISOString().split('T')[0] : ''} onChange={handleChangeEdit} className="form-control form-control-sm" /></td>
                        <td>
                          <button className="btn btn-sm btn-success me-1" onClick={handleSaveClick}><i className="bi bi-save"></i></button>
                          <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}><i className="bi bi-reply-all"></i></button>
                        </td>
                      </>
                    ) : (
                      // Modo Visualización
                      <>
                        <td>{product.codigo_producto || 'N/A'}</td>
                        <td>{product.nombre}</td>
                        <td>{product.descripcion || 'N/A'}</td>
                        <td>{formatPrice(product.precio_compra)}</td>
                        <td>{formatPrice(product.precio_venta)}</td>
                        <td>{product.stock_actual}</td>
                        <td>{product.stock_minimo}</td>
                        <td>{product.unidad_medida || 'N/A'}</td>
                        <td>{product.codigo_categoria || 'N/A'}</td>
                        <td>{product.nombre_categoria || 'N/A'}</td>
                        <td>{product.nombre_proveedor || 'N/A'}</td>
                        <td>{product.fecha_vencimiento ? new Date(product.fecha_vencimiento).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEditClick(product)} title="Editar">
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => onDeleteProduct(product.id)} title="Eliminar">
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsTable;
