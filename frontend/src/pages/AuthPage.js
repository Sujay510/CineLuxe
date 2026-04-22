import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Film, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!isLogin && !formData.name) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name };
      
      const response = await axios.post(`${API}${endpoint}`, payload);
      
      login(response.data.access_token, response.data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Film className="w-12 h-12 text-red-600" />
            <span className="bebas text-5xl text-white">CINELUXE</span>
          </div>
          <p className="text-slate-400 manrope">Your premium cinema experience</p>
        </div>

        <div className="glass-heavy rounded-2xl p-8 space-y-6">
          <div className="flex space-x-2 bg-zinc-900/50 p-1 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg manrope font-semibold transition-all ${
                isLogin
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              data-testid="login-tab"
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg manrope font-semibold transition-all ${
                !isLogin
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              data-testid="register-tab"
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-slate-300 manrope font-medium mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                    data-testid="name-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 manrope font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 manrope font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                  data-testid="password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="auth-submit-btn"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}