import React, { useState } from 'react';
// Eliminamos la importación de react-router-dom ya que no se utiliza
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'; // Importación de estilos globales, corregido a 'App.css'
import './styles/sidebar.css'; // Importa los estilos de la barra lateral

// Importar los componentes de página
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage'; // Importa la página de ventas
import Sidebar from './components/Sidebar';

function App() {
  // Estado para controlar qué página se está mostrando actualmente
  const [currentPage, setCurrentPage] = useState('sales'); // Inicia en la página de ventas

  // Función para cambiar la página
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // Renderizar la página actual usando un switch
  const renderPage = () => {
    switch (currentPage) {
      case 'inventory':
        return <InventoryPage />;
      case 'sales':
        return <SalesPage />;
      case 'expenses':
        return <div><h1>Página de Gastos (Próximamente)</h1></div>; // Placeholder
      case 'reports':
        return <div><h1>Página de Reportes (Próximamente)</h1></div>; // Placeholder
      case 'settings':
        return <div><h1>Página de Configuración (Próximamente)</h1></div>; // Placeholder
      default:
        return <SalesPage />; // Página por defecto
    }
  };

  return (
    <div className="d-flex" id="wrapper"> {/* Usamos d-flex de Bootstrap para el layout lateral */}
      {/* Pasamos el estado de la página actual y la función para cambiarla al Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="content-area flex-grow-1" id="page-content-wrapper"> {/* El área de contenido */}
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
