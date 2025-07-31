import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function AddSale() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'inventory'));
        const productList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    fetchProducts();

    const user = auth.currentUser;
    if (user) {
      setSalesperson(user.displayName || user.email || 'Unknown Salesperson');
    }
  }, []);

  useEffect(() => {
    if (selectedProductId && quantity) {
      const selectedProduct = products.find(p => p.id === selectedProductId);
      if (selectedProduct) {
        const calculated = selectedProduct.price * Number(quantity);
        setAmount(calculated.toFixed(2));
      }
    }
  }, [selectedProductId, quantity, products]);

  const generateInvoiceNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${dateStr}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (!selectedProduct || !quantity || !customerName || !customerPhone) {
      alert('Please fill all fields');
      return;
    }

    if (Number(quantity) > selectedProduct.quantity) {
      alert('Not enough stock available');
      return;
    }

    setLoading(true);

    try {
      const invoiceNumber = generateInvoiceNumber();

      const saleRef = await addDoc(collection(db, 'sales'), {
        invoiceNumber,
        customerName,
        customerPhone,
        productName: selectedProduct.name,
        productId: selectedProduct.id,
        quantity: Number(quantity),
        amount: Number(amount),
        salesperson,
        createdBy: auth.currentUser?.uid || 'unknown',
        createdAt: Timestamp.now(),
        status: 'pending'
      });

      const inventoryRef = doc(db, 'inventory', selectedProduct.id);
      await updateDoc(inventoryRef, {
        quantity: selectedProduct.quantity - Number(quantity)
      });

      navigate(`/invoice/${saleRef.id}`);
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Failed to save sale.');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-3xl shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
        🧾 Record a New Sale
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
            <input
              type="tel"
              placeholder="055XXXXXXX"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              setQuantity('');
              setAmount('');
            }}
            required
          >
            <option value="">-- Choose a product --</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - ₵{product.price} (Stock: {product.quantity})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity and Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="text"
              value={amount}
              disabled
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-xl cursor-not-allowed"
            />
          </div>
        </div>

        {/* Salesperson */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salesperson</label>
          <input
            type="text"
            value={salesperson}
            readOnly
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-xl cursor-not-allowed"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-lg transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Saving...
            </div>
          ) : (
            'Add Sale'
          )}
        </button>
      </form>
    </div>
  );
}

export default AddSale;
