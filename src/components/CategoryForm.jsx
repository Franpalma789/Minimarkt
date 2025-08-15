import React from 'react';

function CategoryForm({ show, onClose, onChange, form }) {
  if (!show) return null;
  return (
    <div className="card card-body bg-light mb-3">
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Código de Categoría</label>
          <input
            type="text"
            className="form-control"
            name="codigo_categoria"
            value={form.codigo_categoria}
            onChange={onChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Nombre de Categoría</label>
          <input
            type="text"
            className="form-control"
            name="nombre_categoria"
            value={form.nombre_categoria}
            onChange={onChange}
          />
        </div>
        <div className="col-12 text-end">
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryForm;