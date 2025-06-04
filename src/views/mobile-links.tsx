import React, { useState, useEffect } from 'react';
import { Calculator, Users, Home, LogOut, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Mock auth store for demo

export const MobileMenuLinks = () => {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  };

  const menuItems = [
    { icon: Calculator, label: 'Calculator', path: '/' },
    { icon: Home, label: 'Quotes', path: '/quotes' },
    ...(user?.role === 'admin' ? [{ icon: Users, label: 'Users', path: '/users' }] : []),
  ];

  return (
    <div className="md:min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="relative z-10 px-6 py-8">
          {/* Header Section */}
          <div
            className={`mb-12 text-center transition-all duration-500 ease-in-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-[#C49C3C] mr-2 animate-pulse" />
              <p className="text-gray-600 text-lg">{getGreeting()},</p>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{user?.name}</h1>
          </div>

          {/* Menu Items */}
          <div className="space-y-4 mb-8">
            {menuItems.map((item, index) => (
              <Link
                to={item.path}
                key={item.label}
                className={`block transform transition-all duration-500 ease-in-out ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-full group relative overflow-hidden mb-3 cursor-pointer">
                  <div className="relative flex items-center p-3 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-gray-100 hover:shadow-lg transition-all duration-300">
                    <div className="p-3 rounded-xl bg-[#C49C3C] group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="ml-4 font-semibold text-gray-900 text-lg group-hover:text-[#C49C3C] transition-colors duration-300">
                      {item.label}
                    </span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-[#C49C3C] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <button
              className="w-full group relative overflow-hidden"
              onClick={() => {
                useAuthStore.getState().logout();
                navigate('/login');
              }}
            >
              <div className="relative flex items-center p-3 bg-red-50 rounded-2xl border border-red-200 hover:bg-red-100 hover:shadow-lg transition-all duration-300">
                <div className="p-3 rounded-xl bg-red-500 group-hover:scale-110 transition-transform duration-300">
                  <LogOut className="h-6 w-6 text-white" />
                </div>
                <span className="ml-4 font-semibold text-gray-900 text-lg group-hover:text-red-600 transition-colors duration-300">
                  Logout
                </span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </button>
          </div>

          {/* Bottom decoration */}
          <div className="mt-12 flex justify-center">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-[#C49C3C] rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translateY(5px) rotate(240deg);
          }
        }
      `}</style>
    </div>
  );
};
