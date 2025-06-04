import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

export const LoginView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);

      if (!response?.data || !response?.data?.token) {
        throw new Error('Invalid response from server');
      }

      setAuth(response.data, response.data.token);
      if (window.innerWidth < 640) {
        // sm breakpoint in Tailwind
        navigate('/menu-links');
      } else {
        navigate('/');
      }
    } catch (error) {
      // Error is already handled by the API interceptor
      console.error('Login error details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="md:min-h-screen flex  flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 gap-10">
      <div>
        <img
          src="https://simcoehomesolutions.ca/wp-content/uploads/2025/02/Untitled-design-2024-09-24T011029.623-1-1-1.png"
          alt="logo"
          width={'360px'}
        />
      </div>
      <div className="max-w-md w-full space-y-8 bg-white md:p-8 p-4 rounded-2xl shadow-none border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign In</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none  focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none  focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="font-medium text-[#C49C3C] hover:text-[#C49C3C] "
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#C49C3C]  focus:outline-none focus:ring-2 focus:ring-offset-2  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
