import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from "../firebase.js";
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import './invoice.css';

function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const docRef = doc(db, 'sales', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSale({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert('Sale not found.');
          navigate('/dashboard/sales');
        }
      } catch (error) {
        console.error('Error fetching sale:', error);
        alert('Failed to load invoice.');
        navigate('/dashboard/sales');
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this sale?')) return;

    try {
      const saleRef = doc(db, 'sales', id);
      const inventoryRef = doc(db, 'inventory', sale.productId);

      const inventorySnap = await getDoc(inventoryRef);
      if (inventorySnap.exists()) {
        const product = inventorySnap.data();
        await updateDoc(inventoryRef, {
          quantity: product.quantity + sale.quantity
        });
      }

      await deleteDoc(saleRef);
      alert('Sale canceled and stock restored.');
      navigate('/dashboard/sales');
    } catch (error) {
      console.error('Error cancelling sale:', error);
      alert('Failed to cancel sale.');
    }
  };

  const handleConfirm = async () => {
    if (sale.status === 'confirmed') {
      alert('Sale already confirmed.');
      return;
    }

    try {
      await updateDoc(doc(db, 'sales', id), {
        status: 'confirmed',
      });
      alert('Sale confirmed!');
      navigate('/dashboard/sales');
    } catch (error) {
      console.error('Error confirming sale:', error);
      alert('Failed to confirm sale.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text('Keziah E-Farms', 10, 10);
    pdf.setFontSize(12);
    pdf.text(`Invoice - ${sale.id}`, 10, 20);
    pdf.text(`Customer: ${sale.customerName || 'N/A'}`, 10, 30);
    pdf.text(`Product: ${sale.productName}`, 10, 40);
    pdf.text(`Quantity: ${sale.quantity}`, 10, 50);
    pdf.text(`Amount: ₵${sale.amount}`, 10, 60);
    pdf.text(`Date: ${sale.createdAt?.toDate().toLocaleString()}`, 10, 70);
    pdf.text(`Status: ${sale.status}`, 10, 80);
    pdf.text(`Sold By: ${sale.soldBy}`, 10, 90);

    pdf.save(`invoice_${sale.id}.pdf`);
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  return (
    <div className="invoice-container">
      <header className="invoice-header">
        <img src="/logo.png" alt="Keziah E-Farms Logo" className="invoice-logo" />
        <h1>Keziah E-Farms</h1>
        <h2>Invoice</h2>
      </header>

      <section className="invoice-details">
        <p><span>Invoice ID:</span> {sale.id}</p>
        <p><span>Customer:</span> {sale.customerName || 'N/A'}</p>
        <p><span>Product:</span> {sale.productName}</p>
        <p><span>Quantity:</span> {sale.quantity}</p>
        <p><span>Amount:</span> ₵{sale.amount}</p>
        <p><span>Status:</span> {sale.status || 'pending'}</p>
        <p><span>Date:</span> {sale.createdAt?.toDate().toLocaleString()}</p>
        <p><span>Sold By:</span> {sale.soldBy}</p>
      </section>

      <div className="invoice-actions">
        <button onClick={handleConfirm} className="confirm">✅ Confirm Sale</button>
        <button onClick={() => navigate(`/edit-sale/${sale.id}`)} className="edit">✏️ Edit Sale</button>
        <button onClick={handleCancel} className="cancel">❌ Cancel Sale</button>
        <button onClick={handlePrint} className="print">🖨 Print Invoice</button>
        <button onClick={handlePDF} className="pdf">📄 Download PDF</button>
      </div>

      <footer className="invoice-footer">
        <p>Thank you for doing business with us!</p>
        <p>© {new Date().getFullYear()} Keziah E-Farms</p>
      </footer>
    </div>
  );
}

export default Invoice;
