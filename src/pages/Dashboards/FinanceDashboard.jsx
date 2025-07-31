// src/pages/dashboards/FinanceDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from '../../styles/commonStyles';


const FinanceDashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Finance Dashboard</h2>
        <button onClick={() => navigate('/login')} style={styles.logoutButton}>Logout</button>
      </header>

      <section style={styles.stats}>
        <div style={styles.card}>
          <h4>Total Revenue</h4>
          <p>₵34,000</p>
        </div>
        <div style={styles.card}>
          <h4>Total Expenses</h4>
          <p>₵12,600</p>
        </div>
        <div style={styles.card}>
          <h4>Net Profit</h4>
          <p>₵21,400</p>
        </div>
      </section>

      <button style={styles.primaryBtn} onClick={() => alert('Exporting report...')}>
        📄 Export Monthly Report
      </button>

      <section>
        <h3>Financial Summary</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount (₵)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Product Sales</td>
              <td>₵3,000</td>
              <td>2025-07-24</td>
            </tr>
            <tr>
              <td>Supplier Payments</td>
              <td>₵1,200</td>
              <td>2025-07-22</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

const styles = {
  ...commonStyles()
};

export default FinanceDashboard;
