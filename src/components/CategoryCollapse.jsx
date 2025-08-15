import React, { useState } from 'react';

function CategoryCollapse({ show, categories, onAddCategory, onDeleteCategory, onClose }) {
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddCategory({ code: categoryCode, name: categoryName });
    setCategoryCode('');
    setCategoryName('');
  };

  const handleDeleteClick = (categoryId) => {
    setCategoryToDelete(categoryId);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    onDeleteCategory(categoryToDelete);
    setShowConfirmModal(false);
    setCategoryToDelete(null);
  };

  if (!show) return null;

  return (
    <div id="categorySectionCollapse" className="mb-3 p-3 border rounded bg-light">
      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5 className="modal-title">Confirmar Eliminación</h5>
            <p>¿Estás seguro de que quieres eliminar esta categoría? Si la categoría está asociada a productos, la eliminación fallará.</p>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <h6>Gestionar Categorías</h6>
      
      {/* Formulario para agregar */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-5">
          <label htmlFor="newCategoryName" className="form-label">Nombre de Categoría</label>
          <input
            type="text"
            className="form-control"
            id="newCategoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>
        <div className="col-md-5">
          {/* Aquí he simplificado el código de categoría ya que tu base de datos solo usa el nombre.
              Puedes adaptar esto si es necesario. */}
          <label htmlFor="newCategoryCode" className="form-label">Código (opcional)</label>
          <input
            type="text"
            className="form-control"
            id="newCategoryCode"
            value={categoryCode}
            onChange={(e) => setCategoryCode(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button type="submit" className="btn btn-success btn-sm me-2 w-100">Guardar</button>
        </div>
      </form>

      {/* Lista de categorías con botón de eliminar */}
      <h6 className="mt-4">Categorías Existentes</h6>
      <ul className="list-group">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
              {cat.nombre}
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteClick(cat.id)}
                title="Eliminar categoría"
              >
                <i className="fas fa-trash"></i>
              </button>
            </li>
          ))
        ) : (
          <li className="list-group-item">No hay categorías para mostrar.</li>
        )}
      </ul>
      <div className="mt-3 text-end">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default CategoryCollapse;
