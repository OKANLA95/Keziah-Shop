import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ViewReports.css';

const ViewReports = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [salespersonFilter, setSalespersonFilter] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'sales'));
    const unsub = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const sale = { id: docSnap.id, ...docSnap.data() };

          let price = 0;
          if (sale.productId) {
            try {
              const productDoc = await getDoc(doc(db, 'products', sale.productId));
              if (productDoc.exists()) {
                const productData = productDoc.data();
                price = Number(productData.price) || 0;
              }
            } catch (error) {
              console.error('Error fetching product:', error);
            }
          }

          sale.price = price;
          sale.amount = (Number(sale.quantity) || 0) * price;
          return sale;
        })
      );

      setSales(data);
      setFilteredSales(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    let filtered = [...sales];

    if (startDate && endDate) {
      filtered = filtered.filter((sale) => {
        const saleDate = sale.createdAt?.toDate?.();
        return saleDate && saleDate >= startDate && saleDate <= endDate;
      });
    }

    if (salespersonFilter) {
      filtered = filtered.filter((sale) =>
        sale.salesperson?.toLowerCase().includes(salespersonFilter.toLowerCase())
      );
    }

    setFilteredSales(filtered);
  }, [startDate, endDate, salespersonFilter, sales]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Sales Report', 14, 10);
    doc.autoTable({
      head: [['Date', 'Product', 'Qty', 'Price (₵)', 'Amount (₵)', 'Salesperson']],
      body: filteredSales.map((s) => [
        s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : 'N/A',
        s.productName || 'N/A',
        s.quantity,
        `₵${s.price.toFixed(2)}`,
        `₵${s.amount.toFixed(2)}`,
        s.salesperson || 'N/A',
      ]),
    });
    doc.save('sales_report.pdf');
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

  const salesByPerson = {};
  filteredSales.forEach((sale) => {
    const person = sale.salesperson || 'Unknown';
    salesByPerson[person] = (salesByPerson[person] || 0) + (sale.amount || 0);
  });

  const chartData = Object.entries(salesByPerson).map(([name, total]) => ({
    name,
    total,
  }));

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Sales Performance & Reports</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Filter by Date:</label><br />
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Start Date" />
        {' '}to{' '}
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="End Date" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>Filter by Salesperson:</label>
        <input
          type="text"
          placeholder="Enter name"
          value={salespersonFilter}
          onChange={(e) => setSalespersonFilter(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <CSVLink data={filteredSales} filename="sales_report.csv">
          <button>Export to CSV</button>
        </CSVLink>
        <button onClick={generatePDF} style={{ marginLeft: 10 }}>Export to PDF</button>
      </div>

      <h3>Total Sales: ₵{totalSales.toFixed(2)}</h3>

      <h4>Sales by Salesperson</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      <h4>Sales Details</h4>
      <table border="1" cellPadding="5" style={{ width: '100%', marginTop: 10 }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price (₵)</th>
            <th>Amount (₵)</th>
            <th>Salesperson</th>
          </tr>
        </thead>
        <tbody>
          {filteredSales.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.createdAt?.toDate ? sale.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
              <td>{sale.productName}</td>
              <td>{sale.quantity}</td>
              <td>₵{sale.price.toFixed(2)}</td>
              <td>₵{sale.amount.toFixed(2)}</td>
              <td>{sale.salesperson}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewReports;
