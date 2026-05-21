import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import DropManager from './pages/admin/DropManager.jsx';
import MenuBuilder from './pages/admin/MenuBuilder.jsx';
import OrderManager from './pages/admin/OrderManager.jsx';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/menu" element={<PublicLayout><Menu /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
            <Route path="/order-confirmation/:orderId" element={<PublicLayout><OrderConfirmation /></PublicLayout>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="drops" element={<DropManager />} />
              <Route path="menu-builder" element={<MenuBuilder />} />
              <Route path="orders" element={<OrderManager />} />
            </Route>
          </Routes>
        </ToastProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
