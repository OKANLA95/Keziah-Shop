import React from 'react';

const InvoiceTemplate = ({ saleData, shopName }) => {
  if (!saleData) return null;

  const { customerName, customerPhone, items, total, date } = saleData;

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', color: '#333' }}>
      <h2 style={{ textAlign: 'center' }}>{shopName || 'Shop Name'} Invoice</h2>

      <p><strong>Customer:</strong> {customerName}</p>
      <p><strong>Phone:</strong> {customerPhone}</p>
      <p><strong>Date:</strong> {new Date(date).toLocaleDateString()}</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr>
            <th style={styles.th}>Product</th>
            <th style={styles.th}>Quantity</th>
            <th style={styles.th}>Price (₵)</th>
            <th style={styles.th}>Total (₵)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td style={styles.td}>{item.name}</td>
              <td style={styles.td}>{item.quantity}</td>
              <td style={styles.td}>{item.price}</td>
              <td style={styles.td}>{item.quantity * item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 20 }}>Total: ₵{total}</h3>

      <p style={{ marginTop: 40, fontStyle: 'italic' }}>Thank you for shopping with {shopName}!</p>
    </div>
  );
};

const styles = {
  th: {
    border: '1px solid #ccc',
    padding: '8px',
    backgroundColor: '#f8f8f8',
    textAlign: 'left'
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px'
  }
};

export default InvoiceTemplate;
