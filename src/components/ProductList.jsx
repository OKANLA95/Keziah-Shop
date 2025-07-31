import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProductList.css'; // Custom styles

export default function ProductList({ products = [], showActions = false, onEdit = () => {}, onDelete = () => {} }) {
  const { userData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter ? product.category === categoryFilter : true)
    );
  }, [products, searchTerm, categoryFilter]);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category || ''))], [products]);

  const canViewCost = userData?.role?.toLowerCase() === 'manager' || userData?.role?.toLowerCase() === 'finance';
  const isManager = userData?.role?.toLowerCase() === 'manager';

  const handleSell = (productId) => {
    navigate(`/sell/${productId}`);
  };

  return (
    <div className="product-container">
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <table className="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price (GHS)</th>
            {canViewCost && <th>Cost Price (GHS)</th>}
            <th>Stock</th>
            <th>Category</th>
            <th>Unit</th>
            {showActions && <th>Actions</th>}
            {isManager && <th>Sale</th>}
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan={showActions || isManager ? 8 : 7} className="no-products">No matching products</td>
            </tr>
          ) : (
            filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.price?.toFixed(2) || '0.00'}</td>
                {canViewCost && <td className="cost-cell">{product.cost?.toFixed(2) || 'N/A'}</td>}
                <td>{product.stock}</td>
                <td>{product.category || 'N/A'}</td>
                <td>{product.unit || 'N/A'}</td>
                {showActions && (
                  <td className="actions">
                    <button className="edit-btn" onClick={() => onEdit(product)}>Edit</button>
                    <button className="delete-btn" onClick={() => onDelete(product.id)}>Delete</button>
                  </td>
                )}
                {isManager && (
                  <td>
                    <button className="sell-btn" onClick={() => handleSell(product.id)}>Sell</button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
