// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Customer Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import PaymentStatus from './pages/PaymentStatus';
import AccountPage from './pages/AccountPage';

// Legal & Support Pages
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import FAQPage from './pages/FAQPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminFlashSale from './pages/admin/AdminFlashSale';
import AdminFlashSaleForm from './pages/admin/AdminFlashSaleForm';
import AdminCategories from './pages/admin/AdminCategories';

// New Admin Pages (to be created)
import AdminInventory from './pages/admin/AdminInventory';
import AdminLowStock from './pages/admin/AdminLowStock';
import AdminDiscounts from './pages/admin/AdminDiscounts';
import AdminDiscountForm from './pages/admin/AdminDiscountForm';
import AdminReviews from './pages/admin/AdminReviews';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSalesReport from './pages/admin/AdminSalesReport';
import AdminProductAnalytics from './pages/admin/AdminProductAnalytics';
import AdminCustomerAnalytics from './pages/admin/AdminCustomerAnalytics';
import AdminRevenueReport from './pages/admin/AdminRevenueReport';
import AdminContentPages from './pages/admin/AdminContentPages';
import AdminContentPageForm from './pages/admin/AdminContentPageForm';
import AdminBlog from './pages/admin/AdminBlog';
import AdminBlogForm from './pages/admin/AdminBlogForm';
import AdminBanners from './pages/admin/AdminBanners';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminShipping from './pages/admin/AdminShipping';
import AdminShippingZones from './pages/admin/AdminShippingZones';
import AdminShippingMethods from './pages/admin/AdminShippingMethods';
import AdminPayments from './pages/admin/AdminPayments';
import AdminPaymentMethods from './pages/admin/AdminPaymentMethods';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminTaxes from './pages/admin/AdminTaxes';
import AdminTaxRates from './pages/admin/AdminTaxRates';
import AdminEmails from './pages/admin/AdminEmails';
import AdminEmailTemplates from './pages/admin/AdminEmailTemplates';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminSettings from './pages/admin/AdminSettings';
import AdminStoreSettings from './pages/admin/AdminStoreSettings';
import AdminPaymentSettings from './pages/admin/AdminPaymentSettings';
import AdminShippingSettings from './pages/admin/AdminShippingSettings';
import AdminSecuritySettings from './pages/admin/AdminSecuritySettings';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/account" element={<AccountPage />} />
            
            {/* Legal & Support Pages */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfUsePage />} />
            <Route path="/faq" element={<FAQPage />} />
            
            {/* Orders Routes */}
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Product Management */}
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<AdminProductForm />} />
            <Route path="/admin/products/:id" element={<AdminProductForm />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            
            {/* Inventory Management */}
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/inventory/low-stock" element={<AdminLowStock />} />
            
            {/* Order Management */}
            <Route path="/admin/orders" element={<AdminOrders />} />
            
            {/* Customer & User Management */}
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            
            {/* Discounts & Promotions */}
            <Route path="/admin/discounts" element={<AdminDiscounts />} />
            <Route path="/admin/discounts/new" element={<AdminDiscountForm />} />
            <Route path="/admin/discounts/:id" element={<AdminDiscountForm />} />
            <Route path="/admin/flash-sale" element={<AdminFlashSale />} />
            <Route path="/admin/flash-sale/new" element={<AdminFlashSaleForm />} />
            
            {/* Reviews */}
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/reviews/pending" element={<AdminReviews />} />
            
            {/* Analytics & Reports */}
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/analytics/sales" element={<AdminSalesReport />} />
            <Route path="/admin/analytics/products" element={<AdminProductAnalytics />} />
            <Route path="/admin/analytics/customers" element={<AdminCustomerAnalytics />} />
            <Route path="/admin/analytics/revenue" element={<AdminRevenueReport />} />
            
            {/* Content Management */}
            <Route path="/admin/content/pages" element={<AdminContentPages />} />
            <Route path="/admin/content/pages/new" element={<AdminContentPageForm />} />
            <Route path="/admin/content/pages/:id" element={<AdminContentPageForm />} />
            <Route path="/admin/content/blog" element={<AdminBlog />} />
            <Route path="/admin/content/blog/new" element={<AdminBlogForm />} />
            <Route path="/admin/content/blog/:id" element={<AdminBlogForm />} />
            <Route path="/admin/content/banners" element={<AdminBanners />} />
            <Route path="/admin/content/testimonials" element={<AdminTestimonials />} />
            
            {/* Shipping */}
            <Route path="/admin/shipping" element={<AdminShipping />} />
            <Route path="/admin/shipping/zones" element={<AdminShippingZones />} />
            <Route path="/admin/shipping/methods" element={<AdminShippingMethods />} />
            
            {/* Payments */}
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/payments/methods" element={<AdminPaymentMethods />} />
            <Route path="/admin/payments/transactions" element={<AdminTransactions />} />
            
            {/* Taxes */}
            <Route path="/admin/taxes" element={<AdminTaxes />} />
            <Route path="/admin/taxes/rates" element={<AdminTaxRates />} />
            
            {/* Emails & Notifications */}
            <Route path="/admin/emails" element={<AdminEmails />} />
            <Route path="/admin/emails/templates" element={<AdminEmailTemplates />} />
            <Route path="/admin/newsletter" element={<AdminNewsletter />} />
            
            {/* Settings */}
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/settings/store" element={<AdminStoreSettings />} />
            <Route path="/admin/settings/payment" element={<AdminPaymentSettings />} />
            <Route path="/admin/settings/shipping" element={<AdminShippingSettings />} />
            <Route path="/admin/settings/security" element={<AdminSecuritySettings />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;