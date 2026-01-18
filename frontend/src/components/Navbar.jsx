import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, clearAuth, isAuthenticated } from '../services/auth';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const [user, setUser] = useState(getAuth().user);

  // Update user data when it changes (e.g., after profile update)
  useEffect(() => {
    const updateUser = () => {
      const { user: currentUser } = getAuth();
      setUser(currentUser);
    };

    // Check for user updates periodically when authenticated
    if (authenticated) {
      updateUser();
      const interval = setInterval(updateUser, 2000); // Check every 2 seconds
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">IIUCShare</span>
            <span className="text-sm text-gray-600">Share Knowledge, Share Barakah</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/browse" className="text-gray-700 hover:text-primary transition-colors">
              Browse
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">
              About
            </Link>

            {authenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-primary transition-colors">
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary transition-colors font-semibold">
                    Admin
                  </Link>
                )}
                <Link to="/donate" className="btn-primary text-sm">
                  Donate Item
                </Link>
                <div className="flex items-center space-x-3">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                      key={user.picture} // Force re-render when picture changes
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-gray-600" />
                  )}
                  <span className="text-sm text-gray-700">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-primary transition-colors"
                    aria-label="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
