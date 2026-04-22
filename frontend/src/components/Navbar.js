import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Film, User, LogOut, Ticket } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-heavy sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2" data-testid="navbar-logo">
            <Film className="w-8 h-8 text-red-600" />
            <span className="bebas text-3xl text-white">CINELUXE</span>
          </Link>

          <div className="flex items-center space-x-8">
            <Link 
              to="/movies" 
              className="text-slate-300 hover:text-white transition-colors manrope font-medium"
              data-testid="navbar-movies-link"
            >
              Movies
            </Link>

            {user ? (
              <>
                <Link 
                  to="/my-bookings" 
                  className="text-slate-300 hover:text-white transition-colors manrope font-medium flex items-center space-x-2"
                  data-testid="navbar-bookings-link"
                >
                  <Ticket className="w-4 h-4" />
                  <span>My Bookings</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-white">
                    <User className="w-5 h-5" />
                    <span className="manrope" data-testid="navbar-user-name">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                    data-testid="navbar-logout-btn"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="btn-primary"
                data-testid="navbar-login-btn"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}