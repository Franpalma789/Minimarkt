import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/inventory.css';
import AddProductForm from '../components/AddProductForm';
import ProductsTable from '../components/ProductsTable';
import Notification from '../components/Notification';
import CategoryCollapse from '../components/CategoryCollapse';

function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [showCategory, setShowCategory] = useState(false);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        setMessage('');
        try {
            const data = await window.electronAPI.getProducts();
            setProducts(data);
        } catch (err) {
            console.error("Error al cargar productos en frontend:", err);
            setMessage('Error al cargar productos');
            setMessageType('danger');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await window.electronAPI.getCategories();
            // CORRECCIÓN: Mapear a los nombres de propiedades correctos que espera ProductsTable
            const mappedCategories = data.map(cat => ({
                id: cat.id,
                codigo_categoria: cat.codigo_categoria,
                nombre_categoria: cat.nombre_categoria
            }));
            setCategories(mappedCategories);
            console.log("Categorías cargadas:", mappedCategories); // Añadido para depuración
        } catch (err) {
            console.error("Error al cargar categorías en frontend:", err);
        }
    };

    const handleUpdateProduct = async (updatedProduct) => {
        setLoading(true);
        setMessage('');
        try {
            const res = await window.electronAPI.updateProduct(updatedProduct);
            if (res.success) {
                setMessage('Producto actualizado con éxito');
                setMessageType('success');
                loadProducts();
            } else {
                setMessage(res.message || 'Error al actualizar producto');
                setMessageType('danger');
            }
        } catch (err) {
            console.error("Error al actualizar producto en frontend:", err);
            setMessage('Error de comunicación al actualizar producto');
            setMessageType('danger');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (cat) => {
        if (!cat.name) {
            setMessage('El nombre de la categoría es obligatorio.');
            setMessageType('danger');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const res = await window.electronAPI.addCategory({
                nombre: cat.name,
            });
            if (res.success) {
                setMessage('Categoría agregada con éxito');
                setMessageType('success');
                loadCategories();
            } else {
                setMessage(res.message || 'Error desconocido al agregar categoría');
                setMessageType('danger');
            }
        } catch (error) {
            console.error("Error agregando categoría en frontend:", error);
            setMessage('Error de comunicación al agregar categoría');
            setMessageType('danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        setLoading(true);
        setMessage('');
        try {
            const res = await window.electronAPI.deleteCategory(categoryId);
            if (res.success) {
                setMessage('Categoría eliminada con éxito');
                setMessageType('success');
                loadCategories();
                loadProducts();
            } else {
                setMessage(res.message || 'Error al eliminar categoría');
                setMessageType('danger');
            }
        } catch (error) {
            console.error("Error al eliminar categoría en frontend:", error);
            setMessage('Error de comunicación al eliminar categoría');
            setMessageType('danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${productId}?`)) {
            setLoading(true);
            setMessage('');
            try {
                const res = await window.electronAPI.deleteProduct(productId);
                if (res.success) {
                    setMessage('Producto eliminado con éxito');
                    setMessageType('success');
                    loadProducts();
                } else {
                    setMessage(res.message || 'Error al eliminar producto');
                    setMessageType('danger');
                }
            } catch (err) {
                console.error("Error al eliminar producto en frontend:", err);
                setMessage('Error de comunicación al eliminar producto');
                setMessageType('danger');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="container py-4">
            <h1 className="text-center mb-4">Módulo de Gestión de Inventario</h1>
            <Notification
                message={message}
                type={messageType}
                onClose={() => setMessage('')}
            />

            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Agregar Nuevo Producto</h5>
                    <button
                        type="button"
                        id="toggleCategoryButton"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setShowCategory(!showCategory)}
                    >
                        <i className="fas fa-plus me-1"></i> Gestionar Categorías
                        <i className={`fas ms-1 ${showCategory ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                    </button>
                </div>
                <div className="card-body position-relative">
                    <CategoryCollapse
                        show={showCategory}
                        categories={categories}
                        onAddCategory={handleAddCategory}
                        onDeleteCategory={handleDeleteCategory}
                        onClose={() => setShowCategory(false)}
                    />
                    <AddProductForm
                        categories={categories}
                        onProductAdded={() => {
                            setMessage('Producto agregado con éxito');
                            setMessageType('success');
                            loadProducts();
                        }}
                    />
                </div>
            </div>

            <ProductsTable
                products={products}
                loading={loading}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                categorias={categories}
                reload={loadProducts}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
            />
        </div>
    );
}

export default InventoryPage;
