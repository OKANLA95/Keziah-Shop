import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    shopName: '',
    shopLocation: '',
    shopContact: '',
    salesCategory: '',
    shopLogoUrl: '',
    shopLogoFile: null,
  });

  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.role !== 'Manager' && data.role !== 'Finance') {
          alert('Access denied. Only Managers and Finance users can update profile.');
          navigate('/');
          return;
        }

        setUserData(data);
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          shopName: data.shopName || '',
          shopLocation: data.shopLocation || '',
          shopContact: data.shopContact || '',
          salesCategory: data.salesCategory || '',
          shopLogoUrl: data.shopLogoUrl || '',
          shopLogoFile: null,
        });
      } else {
        alert('User data not found.');
        navigate('/');
      }
      setLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'shopLogoFile') {
      setFormData((prev) => ({
        ...prev,
        shopLogoFile: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      let logoUrl = formData.shopLogoUrl;

      if (formData.shopLogoFile) {
        const logoRef = ref(storage, `logos/${user.uid}`);
        await uploadBytes(logoRef, formData.shopLogoFile);
        logoUrl = await getDownloadURL(logoRef);
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fullName: formData.fullName,
        email: formData.email.toLowerCase(),
        shopName: formData.shopName,
        shopLocation: formData.shopLocation,
        shopContact: formData.shopContact,
        salesCategory: formData.salesCategory,
        shopLogoUrl: logoUrl,
      });

      alert('✅ Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update profile: ' + err.message);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2>Update Profile</h2>
      <form onSubmit={handleUpdate} className="profile-form">
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          required
        />

        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />

        <input
          name="shopName"
          value={formData.shopName}
          onChange={handleChange}
          placeholder="Shop Name"
          required
        />

        <input
          name="shopLocation"
          value={formData.shopLocation}
          onChange={handleChange}
          placeholder="Shop Location"
          required
        />

        <input
          name="shopContact"
          value={formData.shopContact}
          onChange={handleChange}
          placeholder="Shop Contact"
          required
        />

        <input
          name="salesCategory"
          value={formData.salesCategory}
          onChange={handleChange}
          placeholder="Sales Category"
          required
        />

        <label className="file-label">Upload Shop Logo (optional)</label>
        <input
          type="file"
          accept="image/*"
          name="shopLogoFile"
          onChange={handleChange}
        />

        {formData.shopLogoUrl && (
          <div className="logo-preview">
            <p>Current Logo:</p>
            <img src={formData.shopLogoUrl} alt="Shop Logo" />
          </div>
        )}

        <button type="submit" className="btn-primary">Save Changes</button>
      </form>

      {/* Custom CSS */}
      <style>{`
        .profile-container {
          max-width: 550px;
          margin: 40px auto;
          padding: 30px;
          border-radius: 16px;
          background-color: #ffffff;
          box-shadow: 0 0 25px rgba(0,0,0,0.06);
        }

        .profile-container h2 {
          text-align: center;
          margin-bottom: 25px;
          color: #333;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .profile-form input[type="text"],
        .profile-form input[type="email"],
        .profile-form input[type="file"],
        .profile-form input {
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #ccc;
          font-size: 16px;
        }

        .file-label {
          font-size: 14px;
          color: #555;
          margin-top: 10px;
        }

        .logo-preview img {
          max-width: 120px;
          max-height: 120px;
          margin-top: 10px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .btn-primary {
          padding: 12px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .btn-primary:hover {
          background-color: #0056b3;
        }

        @media (max-width: 600px) {
          .profile-container {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
