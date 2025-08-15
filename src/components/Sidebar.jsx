import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/sidebar.css'; // Importa los estilos de la barra lateral

function Sidebar({ currentPage, onNavigate }) {
  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark sidebar-custom">
      {/* El enlace de la marca está bien, ya que navega a la página principal */}
      <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <i className="bi bi-shop me-2 fs-4"></i>
        <span className="fs-5 fw-bold">Minimarket App</span>
      </a>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          {/* Usamos un botón para las acciones de navegación para evitar la advertencia de accesibilidad */}
          <button
            type="button"
            className={`nav-link text-white ${currentPage === 'inventory' ? 'active' : ''}`}
            onClick={() => onNavigate('inventory')}
          >
            <i className="bi bi-box-seam me-2"></i>
            Inventario
          </button>
        </li>
        <li>
          {/* Botón para la sección de ventas */}
          <button
            type="button"
            className={`nav-link text-white ${currentPage === 'sales' ? 'active' : ''}`}
            onClick={() => onNavigate('sales')}
          >
            <i className="bi bi-cart me-2"></i>
            Ventas
          </button>
        </li>
        <li>
          {/* Botón para la sección de gastos */}
          <button
            type="button"
            className={`nav-link text-white ${currentPage === 'expenses' ? 'active' : ''}`}
            onClick={() => onNavigate('expenses')}
          >
            <i className="bi bi-cash me-2"></i>
            Gastos
          </button>
        </li>
        <li>
          {/* Botón para la sección de reportes */}
          <button
            type="button"
            className={`nav-link text-white ${currentPage === 'reports' ? 'active' : ''}`}
            onClick={() => onNavigate('reports')}
          >
            <i className="bi bi-graph-up me-2"></i>
            Reportes
          </button>
        </li>
        <li>
          {/* Botón para la sección de configuración */}
          <button
            type="button"
            className={`nav-link text-white ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => onNavigate('settings')}
          >
            <i className="bi bi-gear me-2"></i>
            Configuración
          </button>
        </li>
      </ul>
      <hr />
      {/* Sección de usuario logeado */}
      <div className="dropdown">
        {/* Aquí usamos un botón para el dropdown toggle, con clases de enlace para mantener el estilo */}
        <button
          className="btn btn-link d-flex align-items-center text-white text-decoration-none dropdown-toggle"
          id="dropdownUser1"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img src="https://github.com/twbs.png" alt="" width="32" height="32" className="rounded-circle me-2" />
          <strong>Usuario Actual</strong>
        </button>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
          <li>
            <a className="dropdown-item" href="#">Mi Perfil</a>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <a className="dropdown-item" href="#">Cerrar Sesión</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
