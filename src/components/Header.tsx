import React, { useEffect, useState } from "react";
import {
  Calculator,
  Users,
  Home,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Header = () => {
  const { user } = useAuthStore();
  const [currentPath, setCurrentPath] = useState("/");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Update current path on component mount and when location changes
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  // Close the menu when clicking outside of it
  useEffect(() => {
    if (isMenuOpen) {
      const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
        // Use type assertion to access target property
        const target = event.target as Element;
        if (!target.closest(".sidebar") && !target.closest("button")) {
          setIsMenuOpen(false);
        }
      };

      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);

      // Prevent scrolling when sidebar is open
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
        document.removeEventListener("touchstart", handleOutsideClick);
        document.body.style.overflow = "auto";
      };
    }
  }, [isMenuOpen]);
  return (
    <div>
      <nav className="bg-white border-b">
        <div className="max-w-8xl mx-auto px-2 lg:px-8">
          <div className="flex justify-between md:py-0 py-4">
            <div className="flex items-center md:w-[20%]">
              <Link
                to="/menu-links"
                className="md:text-xl font-bold text-[#C49C3C]"
              >
                <img
                  src="https://simcoehomesolutions.ca/wp-content/uploads/2025/02/Untitled-design-2024-09-24T011029.623-1-1-1.png"
                  alt="logo"
                  width="200px"
                  height="60px"
                />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden md:w-[60%]">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2  focus:ring-offset-2 rounded-md p-1"
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
                onClick={() => setCurrentPath("/")}
                className={`py-2 inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-[#C49C3C] ${
                  currentPath === "/"
                    ? "text-[#C49C3C] border-b-[#C49C3C]"
                    : "text-[#000]"
                }`}
              >
                <Calculator className="h-5 w-5 mr-2 text-[#C49C3C]" />
                Calculator
              </Link>
              <Link
                to="/quotes"
                onClick={() => setCurrentPath("/quotes")}
                className={`py-2 inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-[#C49C3C] ${
                  currentPath === "/quotes"
                    ? "text-[#C49C3C] border-b-[#C49C3C]"
                    : "text-[#000]"
                }`}
              >
                <Home className="h-5 w-5 mr-2 text-[#C49C3C]" />
                Quotes
              </Link>
              {user?.role === "admin" && (
                <>
                  <Link
                    to="/users"
                    onClick={() => setCurrentPath("/users")}
                    className={`py-2 inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-[#C49C3C] ${
                      currentPath === "/users"
                        ? "text-[#C49C3C] border-b-[#C49C3C]"
                        : "text-[#000]"
                    }`}
                  >
                    <Users className="h-5 w-5 mr-2 text-[#C49C3C]" />
                    Users
                  </Link>
                  <Link
                    to="/quotes-setting"
                    onClick={() => setCurrentPath("/quotes-settings")}
                    className={`py-2 inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-[#C49C3C] ${
                      currentPath === "/quotes-setting"
                        ? "text-[#C49C3C] border-b-[#C49C3C]"
                        : "text-[#000]"
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-2 text-[#C49C3C]" />
                    Settings
                  </Link>
                </>
              )}
            </div>
            <div className="md:w-[20%] md:flex hidden justify-end">
              <button
                className="py-2 hidden sm:inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-[#C49C3C] text-[#C49C3C]"
                onClick={() => useAuthStore.getState().logout()}
              >
                <LogOut className="h-5 w-5 mr-2 text-[#C49C3C]" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden="true"
        />

        {/* Mobile sidebar menu */}
        <div
          className={`sidebar fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ display: isMenuOpen ? "block" : "none" }}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="font-semibold text-lg text-gray-800">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2  rounded-md p-1"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="py-2" onClick={() => setIsMenuOpen(false)}>
            <Link
              to="/"
              className={`block px-4 py-3 text-base font-medium transition-colors flex items-center ${
                currentPath === "/"
                  ? "text-[#C49C3C] bg-gray-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Calculator className="h-5 w-5 mr-3 text-[#C49C3C]" />
              Calculator
            </Link>
            <Link
              to="/quotes"
              className={`block px-4 py-3 text-base font-medium transition-colors flex items-center ${
                currentPath === "/quotes"
                  ? "text-[#C49C3C] bg-gray-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Home className="h-5 w-5 mr-3 text-[#C49C3C]" />
              Quotes
            </Link>
            {user?.role === "admin" && (
              <>
                <Link
                  to="/users"
                  className={`block px-4 py-3 text-base font-medium transition-colors flex items-center ${
                    currentPath === "/users"
                      ? "text-[#C49C3C] bg-gray-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Users className="h-5 w-5 mr-3 text-[#C49C3C]" />
                  Users
                </Link>
                <Link
                  to="/quotes-setting"
                  onClick={() => setCurrentPath("/quotes-settings")}
                  className={`block px-4 py-3 text-base font-medium transition-colors flex items-center ${
                    currentPath === "/quotes-settings"
                      ? "text-[#C49C3C] border-b-[#C49C3C]"
                      : "text-gray-700 "
                  }`}
                >
                  <Settings className="h-5 w-5 mr-2 text-[#C49C3C]" />
                  Settings
                </Link>
              </>
            )}

            <button
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              onClick={() => useAuthStore.getState().logout()}
            >
              <LogOut className="h-5 w-5 mr-3 text-[#C49C3C]" />
              Logout
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
