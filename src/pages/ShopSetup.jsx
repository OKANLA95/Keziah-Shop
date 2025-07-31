import React, { useState } from 'react';
import './ShopSetup.css';

const ShopSetup = () => {
  const [formData, setFormData] = useState({
    shopName: '',
    location: '',
    contact: '',
    description: '',
    category: '',
    logo: null,
  });

  const categories = [
    'Grocery',
    'Electronics',
    'Fashion',
    'Pharmacy',
    'Stationery',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo') {
      setFormData({ ...formData, logo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Example: Display form data in console (replace this with API call)
    const setupData = {
      ...formData,
      logo: formData.logo ? formData.logo.name : 'No logo uploaded',
    };
    console.log('Submitted Shop Setup Data:', setupData);

    // Redirect or move to role creation step after shop setup
    alert('Shop setup successful! Proceed to create roles.');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">Set Up Your Shop</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Shop Name</label>
          <input
            type="text"
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Contact Information</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Category of Goods</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Short Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            required
            className="w-full border px-3 py-2 rounded"
          ></textarea>
        </div>

        <div>
          <label className="block mb-1 font-medium">Upload Logo (Optional)</label>
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save and Continue
        </button>
      </form>
    </div>
  );
};

export default ShopSetup;
