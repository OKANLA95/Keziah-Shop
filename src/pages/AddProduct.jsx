import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProductList from '../components/ProductList';
import { useAuth } from '../context/AuthContext';

export default function Inventory() {
  const { role } = useAuth();
  const canSeeCostPrice = role === 'manager' || role === 'finance';

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    costPrice: '',
    stock: '',
    category: '',
    unit: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(items);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      const file = files[0];
      setForm((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      price: '',
      costPrice: '',
      stock: '',
      category: '',
      unit: '',
      image: null,
    });
    setImagePreview(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, price, costPrice, stock, category, unit, image } = form;

    if (!name || !price || !stock || !category || !unit) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';

      if (image) {
        const imageRef = ref(storage, `product-images/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const productData = {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        unit,
        imageUrl,
        updatedAt: serverTimestamp(),
      };

      if (canSeeCostPrice && costPrice) {
        productData.costPrice = parseFloat(costPrice);
      }

      if (editingId) {
        await updateDoc(doc(db, 'inventory', editingId), productData);
      } else {
        productData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'inventory'), productData);
      }

      resetForm();
    } catch (err) {
      console.error('🔥 Error saving product:', err);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      costPrice: product.costPrice || '',
      stock: product.stock,
      category: product.category || '',
      unit: product.unit || '',
      image: null,
    });
    setImagePreview(product.imageUrl || null);
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (err) {
      console.error('🗑️ Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2>🛒 Inventory Management</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          type="text"
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
          required
        /><br />

        <input
          type="number"
          name="price"
          placeholder="Selling Price"
          value={form.price}
          onChange={handleChange}
          required
        /><br />

        {canSeeCostPrice && (
          <input
            type="number"
            name="costPrice"
            placeholder="Cost Price"
            value={form.costPrice}
            onChange={handleChange}
            required={!editingId} // required when adding, not when editing
          />
        )}<br />

        <input
          type="number"
          name="stock"
          placeholder="Stock Quantity"
          value={form.stock}
          onChange={handleChange}
          required
        /><br />

        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="electronics">Electronics</option>
          <option value="medical">Medical</option>
          <option value="food">Food</option>
          <option value="general">General Goods</option>
        </select><br />

        <select name="unit" value={form.unit} onChange={handleChange} required>
          <option value="">Select Unit</option>
          <option value="kg">Kg</option>
          <option value="piece">Piece</option>
          <option value="box">Box</option>
          <option value="inch">Inch</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select><br />

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        /><br />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: 10 }}
          />
        )}
        <br />

        <button type="submit" disabled={loading}>
          {editingId ? (loading ? 'Updating...' : 'Update Product') : (loading ? 'Saving...' : 'Add Product')}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm} disabled={loading}>
            Cancel
          </button>
        )}
      </form>

      <ProductList
        products={products}
        showActions={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canSeeCostPrice={canSeeCostPrice}
      />
    </div>
  );
}
