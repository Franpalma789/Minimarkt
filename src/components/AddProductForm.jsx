import React, { useState } from 'react';

function formatCLP(value) {
  if (!value) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseCLP(value) {
  return parseInt(value.replace(/\./g, '').replace(/[^\d]/g, '')) || 0;
}

function AddProductForm({ onProductAdded, categories }) {
  const [form, setForm] = useState({
    codigo_producto: '',
    nombre: '',
    descripcion: '',
    precio_compra: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '',
    unidad_medida: '',
    fecha_vencimiento: '',
    id_categoria: '',
    id_proveedor: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    let { name, value } = e.target;
    if (name === 'precio_compra' || name === 'precio_venta') {
      value = formatCLP(value.replace(/\./g, ''));
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nombre || !form.precio_compra || !form.precio_venta || !form.stock_actual || !form.stock_minimo || !form.unidad_medida || !form.id_categoria) {
      setMessage('Por favor, completa todos los campos obligatorios.');
      return;
    }
    setLoading(true);
    setMessage('Guardando producto...');
    try {
      const newProduct = {
        ...form,
        precio_compra: parseCLP(form.precio_compra),
        precio_venta: parseCLP(form.precio_venta),
        stock_actual: parseInt(form.stock_actual),
        stock_minimo: parseInt(form.stock_minimo),
        id_categoria: parseInt(form.id_categoria),
        id_proveedor: form.id_proveedor ? parseInt(form.id_proveedor) : null,
        fecha_vencimiento: form.fecha_vencimiento || null
      };
      const result = await window.electronAPI.addProduct(newProduct);
      if (result.success) {
        setMessage('Producto agregado exitosamente!');
        setForm({
          codigo_producto: '',
          nombre: '',
          descripcion: '',
          precio_compra: '',
          precio_venta: '',
          stock_actual: '',
          stock_minimo: '',
          unidad_medida: '',
          fecha_vencimiento: '',
          id_categoria: '',
          id_proveedor: ''
        });
        if (onProductAdded) onProductAdded();
      } else {
        setMessage('Error al agregar producto');
      }
    } catch {
      setMessage('Error de comunicación con Electron al agregar producto.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Código Producto</label>
          <input type="text" className="form-control" name="codigo_producto" value={form.codigo_producto} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Nombre <span style={{color: 'red'}}>*</span></label>
          <input type="text" className="form-control" name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div className="col-12">
          <label className="form-label">Descripción</label>
          <textarea className="form-control" name="descripcion" value={form.descripcion} onChange={handleChange} rows={2}></textarea>
        </div>
        <div className="col-md-3">
          <label className="form-label">Precio Compra <span style={{color: 'red'}}>*</span></label>
          <div className="input-group">
            <span className="input-group-text">CLP$</span>
            <input type="text" className="form-control" name="precio_compra" value={form.precio_compra} onChange={handleChange} required />
          </div>
        </div>
        <div className="col-md-3">
          <label className="form-label">Precio Venta <span style={{color: 'red'}}>*</span></label>
          <div className="input-group">
            <span className="input-group-text">CLP$</span>
            <input type="text" className="form-control" name="precio_venta" value={form.precio_venta} onChange={handleChange} required />
          </div>
        </div>
        <div className="col-md-3">
          <label className="form-label">Stock Actual <span style={{color: 'red'}}>*</span></label>
          <input type="number" className="form-control" name="stock_actual" value={form.stock_actual} onChange={handleChange} required />
        </div>
        <div className="col-md-3">
          <label className="form-label">Stock Mínimo <span style={{color: 'red'}}>*</span></label>
          <input type="number" className="form-control" name="stock_minimo" value={form.stock_minimo} onChange={handleChange} required />
        </div>
        <div className="col-md-4">
          <label className="form-label">Unidad de Medida <span style={{color: 'red'}}>*</span></label>
          <select className="form-select" name="unidad_medida" value={form.unidad_medida} onChange={handleChange} required>
            <option value="">Seleccionar...</option>
            <option value="unidad">Unidad</option>
            <option value="kg">Kilogramo</option>
            <option value="g">Gramo</option>
            <option value="l">Litro</option>
            <option value="ml">Mililitro</option>
            <option value="paquete">Paquete</option>
            <option value="caja">Caja</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Fecha Vencimiento</label>
          <input type="date" className="form-control" name="fecha_vencimiento" value={form.fecha_vencimiento} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Categoría <span style={{color: 'red'}}>*</span></label>
          <select className="form-select" name="id_categoria" value={form.id_categoria} onChange={handleChange} required>
            <option value="">Seleccionar...</option>
            {categories && categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.code} - {cat.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label">ID Proveedor</label>
          <input type="number" className="form-control" name="id_proveedor" value={form.id_proveedor} onChange={handleChange} />
        </div>
        <div className="col-12 text-center">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Agregar Producto'}
          </button>
        </div>
      </div>
      {message && (
        <div className="alert alert-info mt-3">{message}</div>
      )}
    </form>
  );
}

export default AddProductForm;