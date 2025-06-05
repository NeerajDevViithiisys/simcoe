import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { CalculatorView } from './views/Calculator';
import { UsersView } from './views/Users';
import { QuotesView } from './views/QuotesView';
import { LoginView } from './views/Login';
import { ForgotPasswordView } from './views/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';
import { Quotes } from './views/Quotes';
import 'react-toastify/dist/ReactToastify.css';
import { QuotesSettings } from './views/QueteSettings';
import { MobileMenuLinks } from './views/menu-links';
import Header from './components/Header';

const App = () => {
  const { isAuthenticated } = useAuthStore();
  

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-white">
        {isAuthenticated && (
          <Header />
        )}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pb-24">
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/forgot-password" element={<ForgotPasswordView />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <CalculatorView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes"
              element={
                <ProtectedRoute>
                  <Quotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes-view/:id"
              element={
                <ProtectedRoute>
                  <QuotesView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/menu-links"
              element={
                <ProtectedRoute>
                  <MobileMenuLinks />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quotes-setting"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <QuotesSettings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
