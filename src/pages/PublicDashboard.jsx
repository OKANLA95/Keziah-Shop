import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";

export default function PublicDashboard() {
  return (
    <div>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoTitle}>
          <img src={logo} alt="Keziah Logo" style={styles.logo} />
          <h1 style={styles.title}>Keziah Shop Master</h1>
        </div>
        <nav>
          <Link to="/About" style={styles.link}>About</Link>
          <Link to="/ContactSupport" style={styles.link}>Contact Support</Link>
          <Link to="/signup" style={styles.link}>Sign Up</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <h2>Master Your Inventory. Maximize Your Sales.</h2>
        <p>
          Keziah Shop Master helps you track stock, manage sales, and make data-driven decisions — all in one intuitive dashboard.
        </p>
        <Link to="/signup" style={styles.cta}>Get Started Free</Link>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <h3>Why Keziah Shop Master?</h3>
        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <h4>Inventory Control</h4>
            <p>Monitor stock levels in real time. Receive alerts on low stock and expiry dates.</p>
          </div>
          <div style={styles.featureCard}>
            <h4>Sales Tracking</h4>
            <p>Track your daily, weekly, and monthly sales with clear, actionable reports.</p>
          </div>
          <div style={styles.featureCard}>
            <h4>Multi-user Access</h4>
            <p>Empower your team with role-based access to update stock and manage transactions securely.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={styles.ctaBanner}>
        <h3>Take Control of Your Shop Today</h3>
        <Link to="/signup" style={styles.cta}>Try Keziah Shop Master Free</Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Keziah Shop Master. All rights reserved.</p>
        <div>
          <a href="mailto:support@keziahshopmaster.com" style={styles.link}>Contact Support</a> | 
          <Link to="/about" style={styles.link}>About</Link>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  header: {
    background: '#2c3e50',
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  logoTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    height: '60px',
    width: 'auto',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
  },
  link: {
    marginLeft: 15,
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  hero: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#f6f9fc',
  },
  cta: {
    display: 'inline-block',
    marginTop: 20,
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '5px',
    textDecoration: 'none',
  },
  features: {
    padding: '3rem 2rem',
    backgroundColor: '#ffffff',
  },
  featureGrid: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: 30,
    flexWrap: 'wrap',
  },
  featureCard: {
    width: '30%',
    minWidth: 250,
    margin: '1rem',
    padding: '1.5rem',
    border: '1px solid #e1e1e1',
    borderRadius: '8px',
    backgroundColor: '#fefefe',
    textAlign: 'center',
  },
  ctaBanner: {
    backgroundColor: '#ecf9f1',
    textAlign: 'center',
    padding: '2rem',
    marginTop: '3rem',
  },
  footer: {
    padding: '1rem',
    textAlign: 'center',
    backgroundColor: '#f0f4f8',
    borderTop: '1px solid #e2e8f0',
    marginTop: '2rem',
  },
};
