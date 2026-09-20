
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AdminLogin } from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

// Layouts
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Account } from './pages/Account';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <WishlistProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                fontSize: '14px',
                borderRadius: '4px',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route
                path="sarees"
                element={<CategoryPage category="sarees" title="Timeless Sarees" description="Explore our handpicked collection of exquisite sarees, crafted with premium fabrics and intricate detailing for every special occasion." />}
              />
              <Route
                path="jewellery"
                element={<CategoryPage category="jewellery" title="Statement Jewellery" description="Add a touch of elegance with our premium handcrafted jewellery collection, designed to complement your unique style." />}
              />
              <Route
                path="dresses"
                element={<CategoryPage category="dresses" title="Effortless Dresses" description="Discover our curated selection of dresses that blend traditional aesthetics with modern silhouettes for perfect comfort and style." />}
              />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-success" element={<OrderSuccess />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="account" element={<Account />} />
              <Route path="admin-login" element={<AdminLogin />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
