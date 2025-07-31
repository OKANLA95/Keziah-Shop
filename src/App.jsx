import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/PublicDashboard';
import About from './pages/About';
import ContactSupport from './pages/ContactSupport';
import ManagerDashboard from './pages/dashboards/ManagerDashboard';
import SalesDashboard from './pages/Dashboards/SalesDashboard';
import FinanceDashboard from './pages/dashboards/FinanceDashboard';
import AssignRole from './pages/AssignRole';
import Profile from './pages/Profile';
import Inventory from './pages/Inventory';
import AddSale from './pages/sales/AddSale';
import EditSale from './pages/sales/EditSale';
import Invoice from './pages/Invoice';
import ProductList from './pages/sales/ProductList';
import ShopSetup from './pages/ShopSetup';
import AddProduct from './pages/AddProduct';
import ViewReports from './pages/ViewReports'; // ✅ Import your reports page

// Components
import ProtectedRoute from './components/ProtectedRoute';
import SalesFormPage from './components/SalesForm';

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔓 Public Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product-list" element={<ProductList />} />
        <Route path="/about" element={<About />} />
        <Route path="/contactsupport" element={<ContactSupport />} />

        {/* 🔐 General Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 🧩 Setup Route for New Managers */}
        <Route
          path="/setup-shop"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <ShopSetup />
            </ProtectedRoute>
          }
        />

        {/* 🎯 Role-Based Dashboards */}
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/sales"
          element={
            <ProtectedRoute allowedRoles={['Sales']}>
              <SalesDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/finance"
          element={
            <ProtectedRoute allowedRoles={['Finance']}>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ 📊 View Reports Route (for Managers) */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <ViewReports />
            </ProtectedRoute>
          }
        />

        {/* 🛒 Sales Routes - Sales Role Only */}
        <Route
          path="/add-sale"
          element={
            <ProtectedRoute allowedRoles={['Sales']}>
              <AddSale />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/new"
          element={
            <ProtectedRoute allowedRoles={['Sales']}>
              <SalesFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-sale/:id"
          element={
            <ProtectedRoute allowedRoles={['Sales']}>
              <EditSale />
            </ProtectedRoute>
          }
        />

        {/* 🧾 Invoice - Public or Linked */}
        <Route path="/invoice/:id" element={<Invoice />} />

        {/* 📦 Inventory - Manager Only */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <Inventory />
            </ProtectedRoute>
          }
        />

        {/* ➕ Add Product - Manager Only */}
        <Route
          path="/add-product"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        {/* 🛡 Admin Route */}
        <Route
          path="/admin/assign-role"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AssignRole />
            </ProtectedRoute>
          }
        />

        {/* 🔁 Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;
