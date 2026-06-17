import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const getAvatar = (name) =>
  name ? name.charAt(0).toUpperCase() : "?";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          BlogSpace
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition ${
              isActive("/")
                ? "text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Home
          </Link>

          {user && (
            <>
              <Link
                to="/myposts"
                className={`text-sm font-medium transition ${
                  isActive("/myposts")
                    ? "text-black"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                My Posts
              </Link>
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={() => navigate("/create")}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition"
              >
                Write
              </button>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-black text-white font-semibold flex items-center justify-center"
                >
                  {getAvatar(user.name)}
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0"
                      onClick={() => setDropdownOpen(false)}
                    />

                    <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          navigate("/myposts");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                      >
                        My Posts
                      </button>

                      <button
                        onClick={() => {
                          navigate("/create");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                      >
                        Write New Post
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-black"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;