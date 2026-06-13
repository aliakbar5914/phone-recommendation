import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { PrivateRoute, AdminRoute } from './components/PrivateRoute';

import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Survey from './pages/Survey';
import Explore from './pages/Explore';
import PhoneDetail from './pages/PhoneDetail';
import Shortlist from './pages/Shortlist';
import Compare from './pages/Compare';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import AdminNotice from './pages/AdminNotice';

import AdminLayout   from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ManagePhones  from './pages/admin/ManagePhones';
import ManageUsers   from './pages/admin/ManageUsers';
import Insights      from './pages/admin/Insights';

export default function App() {
  return (
    <AuthProvider>
      <CompareProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public + User routes (with main Navbar) ── */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/403" element={<Forbidden />} />
              <Route path="/admin-notice" element={<AdminNotice />} />

              <Route path="/survey"    element={<PrivateRoute><Survey /></PrivateRoute>} />
              <Route path="/explore"   element={<PrivateRoute><Explore /></PrivateRoute>} />
              <Route path="/phones/:id" element={<PrivateRoute><PhoneDetail /></PrivateRoute>} />
              <Route path="/shortlist" element={<PrivateRoute><Shortlist /></PrivateRoute>} />
              <Route path="/compare"   element={<PrivateRoute><Compare /></PrivateRoute>} />
              <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />

              <Route path="*" element={<NotFound />} />
            </Route>

            {/* ── Admin routes (own layout, no main Navbar) ── */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="phones"   element={<ManagePhones />} />
              <Route path="users"    element={<ManageUsers />} />
              <Route path="insights" element={<Insights />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CompareProvider>
    </AuthProvider>
  );
}
