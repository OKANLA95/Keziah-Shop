import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Show loading state

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched products:", data); // ✅ Debug output
        setProducts(data);
        setLoading(false);
      },
      error => {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📦 Product List</h2>

      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-red-500">No products found. Please add some in the dashboard.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map(product => (
            <div
              key={product.id}
              className="border p-4 rounded shadow-sm bg-white"
            >
              <h4 className="font-bold">{product.name || 'Unnamed Product'}</h4>
              <p>Price: ₵{product.price ?? '0.00'}</p>
              <p className={product.stock <= 3 ? 'text-red-500' : 'text-gray-700'}>
                Stock: {product.stock ?? 'N/A'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
