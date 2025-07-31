import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function EditSale() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    amount: '',
    customerName: ''
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // 🔐 Fetch authenticated user and their role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setUserRole(data.role);

          if (data.role !== 'Sales' && data.role !== 'Manager') {
            alert('You are not authorized to edit sales.');
            navigate('/dashboard');
          }
        } else {
          alert('User profile not found');
          navigate('/login');
        }
      } else {
        alert('You must be logged in');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // 🔄 Load the existing sale
  useEffect(() => {
    const fetchSale = async () => {
      try {
        const docRef = doc(db, 'sales', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSale({ id: docSnap.id, ...data });
          setFormData({
            productName: data.productName || '',
            quantity: data.quantity || 0,
            amount: data.amount || 0,
            customerName: data.customerName || '',
          });
        } else {
          alert('Sale not found');
          navigate('/dashboard/sales');
        }
      } catch (error) {
        console.error('Error loading sale:', error);
        alert('Failed to load sale data.');
        navigate('/dashboard/sales');
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [id, navigate]);

  // 🧠 Form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'amount' ? Number(value) : value
    }));
  };

  // ✅ Input validation
  const isValid = () => {
    if (!formData.productName.trim()) return false;
    if (!formData.customerName.trim()) return false;
    if (formData.quantity < 1) return false;
    if (formData.amount < 0) return false;
    return true;
  };

  // 💾 Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) {
      alert('Please fill all fields correctly.');
      return;
    }

    try {
      const saleRef = doc(db, 'sales', id);
      await updateDoc(saleRef, {
        productName: formData.productName,
        quantity: formData.quantity,
        amount: formData.amount,
        customerName: formData.customerName,
        updatedAt: new Date(),
        updatedBy: currentUser?.email || currentUser?.uid || 'Unknown'
      });

      alert('Sale updated successfully!');
      navigate(`/invoice/${id}`);
    } catch (error) {
      console.error('Error updating sale:', error);
      alert('Failed to update sale.');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Sale</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Product Name:</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Customer Name:</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Amount (₵):</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            min="0"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditSale;
