import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Calculator, Users, Home, Menu, X } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CalculatorView from './views/Calculator';
import UsersView from './views/Users';
import QuotesView from './views/QuotesView';
import LoginView from './views/Login';
import ForgotPasswordView from './views/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';
import Quotes from './views/Quotes';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const [currentPath, setCurrentPath] = useState('/');

  // Update current path on component mount and when location changes
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, [currentPath]);

  // Close the menu when clicking outside of it
  useEffect(() => {
    if (isMenuOpen) {
      const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
        // Use type assertion to access target property
        const target = event.target as Element;
        if (!target.closest('.sidebar') && !target.closest('button')) {
          setIsMenuOpen(false);
        }
      };

      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);

      // Prevent scrolling when sidebar is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick);
        document.body.style.overflow = 'auto';
      };
    }
  }, [isMenuOpen]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        {isAuthenticated && (
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-10 px-4">
              <div className="flex justify-between md:py-0 py-4">
                <div className="flex items-center">
                  <a href="/" className="md:text-xl font-bold text-purple-600">
                    <h1 className="md:text-xl font-bold text-purple-600">Simcoe Service</h1>
                  </a>
                </div>

                {/* Mobile menu button */}
                <div className="flex items-center sm:hidden">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md p-1"
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle menu"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                </div>

                {/* Desktop menu */}
                <div className="hidden sm:flex sm:items-center sm:space-x-8 py-4">
                  <Link
                    to="/"
                    onClick={() => setCurrentPath('/')}
                    className={`py-2 inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-gray-300 ${
                      currentPath === '/' ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    Calculator
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/users"
                        onClick={() => setCurrentPath('/users')}
                        className={`py-2 inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-gray-300 ${
                          currentPath === '/users' ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        <Users className="h-5 w-5 mr-2" />
                        Users
                      </Link>
                      <Link
                        to="/quotes"
                        onClick={() => setCurrentPath('/quotes')}
                        className={`py-2 inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-gray-300 ${
                          currentPath === '/quotes' ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        <Home className="h-5 w-5 mr-2" />
                        Quotes
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile sidebar overlay */}
            <div
              className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
                isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              aria-hidden="true"
            />

            {/* Mobile sidebar menu */}
            <div
              className={`sidebar fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
                isMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="font-semibold text-lg text-gray-800">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md p-1"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="py-2">
                <Link
                  to="/"
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calculator className="h-5 w-5 mr-3 text-purple-600" />
                  Calculator
                </Link>
                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/users"
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Users className="h-5 w-5 mr-3 text-purple-600" />
                      Users
                    </Link>
                    <Link
                      to="/quotes"
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Home className="h-5 w-5 mr-3 text-purple-600" />
                      Quotes
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
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
                <ProtectedRoute allowedRoles={['admin']}>
                  <Quotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes-view/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <QuotesView />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
