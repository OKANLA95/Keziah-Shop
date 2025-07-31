import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  Timestamp,
  onSnapshot,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { commonStyles } from '../../styles/commonStyles';
import Select from 'react-select';
import { jsPDF } from 'jspdf';
import emailjs from 'emailjs-com';

const SalesDashboard = () => {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shopName, setShopName] = useState('My Shop');
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const printRef = useRef();

  useEffect(() => {
    const unsubscribeSales = onSnapshot(collection(db, 'sales'), snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSales(data);
    });

    const unsubscribeProducts = onSnapshot(collection(db, 'inventory'), snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    });

    const fetchProfile = async () => {
      const profileDoc = await getDoc(doc(db, 'settings', 'profile'));
      if (profileDoc.exists()) {
        setShopName(profileDoc.data().shopName || 'My Shop');
      }
    };

    fetchProfile();

    return () => {
      unsubscribeSales();
      unsubscribeProducts();
    };
  }, []);

  const handleSell = () => {
    if (!customerName || !customerEmail || selectedProducts.length === 0) {
      alert('Please enter customer info and select products.');
      return;
    }

    const saleItems = selectedProducts.map(p => ({
      name: p.data.name,
      price: p.data.price,
      quantity: p.quantity,
      total: p.data.price * p.quantity
    }));

    const totalAmount = saleItems.reduce((sum, item) => sum + item.total, 0);

    setInvoiceData({ saleItems, totalAmount });
    setShowPreview(true);
  };

  const confirmAndGenerateInvoice = async () => {
    const { saleItems, totalAmount } = invoiceData;

    await addDoc(collection(db, 'sales'), {
      customerName,
      customerEmail,
      products: saleItems,
      totalAmount,
      date: Timestamp.now(),
      status: 'pending'
    });

    for (const p of selectedProducts) {
      await updateDoc(doc(db, 'inventory', p.data.id), {
        stock: p.data.stock - p.quantity
      });
    }

    generatePDF(saleItems, totalAmount);
    sendEmailInvoice(saleItems, totalAmount);

    alert('✅ Sale recorded!');
    setSelectedProducts([]);
    setCustomerName('');
    setCustomerEmail('');
    setShowPreview(false);
  };

  const generatePDF = (items, total) => {
    const doc = new jsPDF();
    doc.text(`${shopName} - Invoice`, 20, 20);
    doc.text(`Customer: ${customerName}`, 20, 30);
    doc.text(`Email: ${customerEmail}`, 20, 40);

    let y = 60;
    items.forEach(item => {
      doc.text(`${item.name} - Qty: ${item.quantity} - ₵${item.total}`, 20, y);
      y += 10;
    });

    doc.text(`Total: ₵${total}`, 20, y + 10);
    doc.save('invoice.pdf');
  };

  const sendEmailInvoice = (items, total) => {
    const message = items.map(item => `${item.name} (x${item.quantity}) - ₵${item.total}`).join('\n');
    const body = `Hi ${customerName},\n\nThank you for your purchase from ${shopName}.\n\nInvoice:\n${message}\n\nTotal: ₵${total}\n\nRegards,\n${shopName}`;

    emailjs.send('service_id', 'template_id', {
      to_email: customerEmail,
      from_name: shopName,
      message: body
    }, 'user_id');
  };

  const handlePrintInvoice = () => {
    const printContents = printRef.current.innerHTML;
    const newWindow = window.open('', '', 'width=600,height=800');
    newWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2, h3 { margin: 0 0 10px; }
            .item-row { margin: 5px 0; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  };

  const handleProductSelect = (selected) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.data.id === selected.data.id);
      if (exists) return prev;
      return [...prev, { data: selected.data, quantity: 1 }];
    });
  };

  const updateQuantity = (id, qty) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.data.id === id ? { ...p, quantity: qty } : p
      )
    );
  };

  const productOptions = products.map(product => ({
    value: product.id,
    label: `${product.name} — ₵${product.price} (Stock: ${product.stock})`,
    data: product
  }));

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>{shopName} Sales Dashboard</h2>
        <button onClick={() => navigate('/login')} style={styles.logoutButton}>Logout</button>
      </header>

      <section>
        <input placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
        <input placeholder="Customer Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />

        <Select
          options={productOptions}
          onChange={handleProductSelect}
          placeholder="🔍 Search and select a product..."
        />

        {selectedProducts.map(p => (
          <div key={p.data.id} style={styles.productCard}>
            <h4>{p.data.name}</h4>
            <p>₵{p.data.price}</p>
            <p>Stock: {p.data.stock}</p>
            <input
              type="number"
              min="1"
              max={p.data.stock}
              value={p.quantity}
              onChange={e => updateQuantity(p.data.id, parseInt(e.target.value))}
            />
          </div>
        ))}

        <button onClick={handleSell} style={styles.sellBtn}>Preview Invoice</button>
      </section>

      {showPreview && invoiceData && (
        <div style={styles.previewModal}>
          <h3>Invoice Preview</h3>
          <div>
            <p><strong>Customer:</strong> {customerName}</p>
            <p><strong>Email:</strong> {customerEmail}</p>
            <ul>
              {invoiceData.saleItems.map((item, index) => (
                <li key={index}>{item.name} (x{item.quantity}) - ₵{item.total}</li>
              ))}
            </ul>
            <p><strong>Total:</strong> ₵{invoiceData.totalAmount}</p>
          </div>
          <div>
            <button onClick={confirmAndGenerateInvoice} style={styles.confirmBtn}>✅ Confirm & Download</button>
            <button onClick={handlePrintInvoice} style={{ ...styles.confirmBtn, backgroundColor: '#28a745' }}>🖨️ Print</button>
            <button onClick={() => setShowPreview(false)} style={styles.cancelBtn}>❌ Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'none' }}>
        <div ref={printRef} style={styles.printContainer}>
          <h2>{shopName} Invoice</h2>
          <p><strong>Customer:</strong> {customerName}</p>
          <p><strong>Email:</strong> {customerEmail}</p>
          <hr />
          {invoiceData?.saleItems.map((item, index) => (
            <div key={index} style={styles.invoiceRow}>
              {item.name} (x{item.quantity}) — ₵{item.total}
            </div>
          ))}
          <hr />
          <h3>Total: ₵{invoiceData?.totalAmount}</h3>
          <p style={{ fontSize: 12, marginTop: 10 }}>Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <section>
        <h3>Recent Sales</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Products</th>
              <th>Status</th>
              <th>Date</th>
              <th>Total (₵)</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id}>
                <td>{sale.customerName}</td>
                <td>
                  {sale.products?.map(p => (
                    <div key={p.name}>{p.name} (x{p.quantity})</div>
                  ))}
                </td>
                <td>{sale.status}</td>
                <td>{new Date(sale.date?.seconds * 1000).toLocaleDateString()}</td>
                <td>{sale.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

const styles = {
  ...commonStyles(),
  productCard: {
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '10px'
  },
  sellBtn: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    marginTop: '15px',
    cursor: 'pointer'
  },
  previewModal: {
    border: '1px solid #ccc',
    padding: '20px',
    marginTop: '20px',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  },
  confirmBtn: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    marginRight: '10px'
  },
  cancelBtn: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px'
  },
  printContainer: {
    padding: '20px',
    fontSize: '14px',
    color: '#000'
  },
  invoiceRow: {
    marginBottom: '5px'
  }
};

export default SalesDashboard;
