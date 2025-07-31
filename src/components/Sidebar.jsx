// src/components/Sidebar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Sidebar() {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // Only render if user is a Manager
  if (userData?.role !== 'Manager') return null;

  return (
    <div style={styles.sidebar}>
      <h3 style={styles.title}>Manager Panel</h3>

      <ul style={styles.nav}>
        <li><Link to="/dashboard/manager" style={styles.link}>🏠 Dashboard</Link></li>
        <li><Link to="/inventory" style={styles.link}>📦 Inventory</Link></li>
        <li><Link to="/profile" style={styles.link}>👤 Profile</Link></li>
        <li><button onClick={handleLogout} style={styles.button}>🚪 Logout</button></li>
      </ul>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '220px',
    height: '100vh',
    background: '#1e293b',
    color: 'white',
    padding: '20px',
    position: 'fixed',
  },
  title: {
    marginBottom: '30px',
  },
  nav: {
    listStyle: 'none',
    padding: 0,
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    display: 'block',
    margin: '15px 0',
  },
  button: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: 0,
    fontSize: '16px',
  },
};
