import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import Sidebar from '../../components/Sidebar';
import { commonStyles } from '../../styles/commonStyles';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const styles = commonStyles();

  const [salesData, setSalesData] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [mostSold, setMostSold] = useState('');
  const [mostProfitable, setMostProfitable] = useState('');

  useEffect(() => {
    fetchSalesData();
    fetchProducts();
  }, []);

  const fetchSalesData = async () => {
    const salesSnapshot = await getDocs(collection(db, 'sales'));
    const productSnapshot = await getDocs(collection(db, 'products'));

    const productMap = {};
    productSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name) {
        productMap[data.name] = {
          price: Number(data.price) || 0,
          costPrice: Number(data.costPrice) || 0,
        };
      }
    });

    const sales = [];
    const salesCountMap = {};
    const profitMap = {};
    let total = 0;

    salesSnapshot.forEach((doc) => {
      const data = doc.data();
      const productName = data.productName || 'N/A';
      const quantity = Number(data.quantity) || 0;
      const price = Number(data.price) || productMap[productName]?.price || 0;
      const costPrice = Number(data.costPrice) || productMap[productName]?.costPrice || 0;
      const amount = price * quantity;
      const date = new Date(data.date);
      const dateLabel = isNaN(date) ? 'N/A' : date.toLocaleDateString();

      sales.push({
        name: productName,
        quantity,
        price,
        amount,
        date: dateLabel,
        salesperson: data.salesperson || 'N/A',
      });

      total += amount;
      salesCountMap[productName] = (salesCountMap[productName] || 0) + quantity;
      const profit = (price - costPrice) * quantity;
      profitMap[productName] = (profitMap[productName] || 0) + profit;
    });

    setSalesData(sales);
    setTotalSales(total.toFixed(2));

    const topSold = Object.entries(salesCountMap).sort((a, b) => b[1] - a[1])[0];
    setMostSold(topSold ? topSold[0] : 'N/A');

    const topProfit = Object.entries(profitMap).sort((a, b) => b[1] - a[1])[0];
    setMostProfitable(topProfit ? topProfit[0] : 'N/A');
  };

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const prodList = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      prodList.push({ ...data, id: doc.id });
    });

    setProducts(prodList);
    const low = prodList.filter((p) => p.stock <= 5);
    setLowStock(low);
  };

  const groupedSales = salesData.reduce((acc, sale) => {
    const existing = acc.find((s) => s.date === sale.date);
    if (existing) {
      existing.amount += sale.amount;
    } else {
      acc.push({ date: sale.date, amount: sale.amount });
    }
    return acc;
  }, []);

  const salesByProduct = salesData.reduce((acc, sale) => {
    const existing = acc.find((item) => item.name === sale.name);
    if (existing) {
      existing.value += sale.amount;
    } else {
      acc.push({ name: sale.name, value: sale.amount });
    }
    return acc;
  }, []);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ffbb28', '#00C49F'];

  const handlePrint = () => {
    const printContent = document.getElementById('printable');
    const newWin = window.open('');
    newWin.document.write(`<html><head><title>Printable Sales Report</title></head><body>${printContent.innerHTML}</body></html>`);
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', padding: '20px', width: '100%' }}>
        <header style={styles.header}>
          <h2>Keziah Shop Master – Manager Dashboard</h2>
        </header>

        <section style={styles.stats}>
          <div style={styles.card}><h4>Total Sales</h4><p>₵{totalSales}</p></div>
          <div style={styles.card}><h4>Most Sold Product</h4><p>{mostSold}</p></div>
          <div style={styles.card}><h4>Most Profitable Product</h4><p>{mostProfitable}</p></div>
        </section>

        {/* Charts Section */}
        <section style={{ margin: '30px 0' }}>
          <h3>📈 Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={groupedSales}>
              <Line type="monotone" dataKey="amount" stroke="#4f46e5" />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h3>📊 Sales by Product (Bar)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesByProduct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ flex: 1 }}>
            <h3>🎯 Sales by Product (Pie)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={salesByProduct} dataKey="value" nameKey="name" outerRadius={80} label>
                  {salesByProduct.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Printable Table */}
        <div id="printable" style={{ marginTop: '40px' }}>
          <h3>🧾 Sales Records</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Price (₵)</th>
                <th style={styles.th}>Amount (₵)</th>
                <th style={styles.th}>Salesperson</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((sale, index) => (
                <tr key={index}>
                  <td style={styles.td}>{sale.date}</td>
                  <td style={styles.td}>{sale.name}</td>
                  <td style={styles.td}>{sale.quantity}</td>
                  <td style={styles.td}>₵{sale.price.toFixed(2)}</td>
                  <td style={styles.td}>₵{sale.amount.toFixed(2)}</td>
                  <td style={styles.td}>{sale.salesperson}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={handlePrint} style={{ ...styles.primaryBtn, marginTop: '20px' }}>
          🖨️ Print Sales Report
        </button>

        {/* Low Stock Alert */}
        {lowStock.length > 0 && (
          <section style={{ marginTop: '40px' }}>
            <h3>⚠️ Low Stock Alert</h3>
            <ul>
              {lowStock.map((product) => (
                <li key={product.id} style={{ color: 'red', fontWeight: 'bold' }}>
                  {product.name} - Only {product.stock} left!
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Navigation Buttons */}
        <section style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/inventory')} style={styles.primaryBtn}>📦 View Inventory</button>
          <button onClick={() => navigate('/add-product')} style={styles.primaryBtn}>➕ Add Product</button>
          <button onClick={() => navigate('/reports')} style={styles.primaryBtn}>📊 View Reports</button>
          <button onClick={() => navigate('/admin/assign-role')} style={styles.primaryBtn}>👤 Assign User Role</button>
        </section>
      </main>
    </div>
  );
};

export default ManagerDashboard;
