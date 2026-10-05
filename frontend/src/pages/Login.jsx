import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Music2, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@mounaragam.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#181818] border border-[#282828] p-8 rounded-2xl shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#1db954] mx-auto flex items-center justify-center text-black shadow-lg">
            <Music2 className="w-6 h-6 fill-black" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Log in to Mouna Ragam
          </h1>
          <p className="text-xs text-[#a0a0a0]">
            Continue your endless music streaming journey
          </p>
        </div>

        {/* Quick Demo Fill Pill */}
        <button
          type="button"
          onClick={handleDemoFill}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#242424] hover:bg-[#2e2e2e] border border-[#3e3e3e] rounded-lg text-xs font-semibold text-[#1db954] transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Quick Demo Login (1-Click Fill)
        </button>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-lg flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#b3b3b3] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
                className="w-full bg-[#242424] text-white text-sm pl-10 pr-4 py-2.5 rounded-lg border border-transparent focus:border-[#1db954] focus:outline-none focus:bg-[#2a2a2a] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b3b3b3] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#242424] text-white text-sm pl-10 pr-4 py-2.5 rounded-lg border border-transparent focus:border-[#1db954] focus:outline-none focus:bg-[#2a2a2a] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold py-3 rounded-full text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-[#282828]">
          <p className="text-xs text-[#a0a0a0]">
            Don't have an account?{' '}
            <Link to="/register" className="text-white hover:text-[#1db954] font-bold underline transition-colors">
              Sign up for Mouna Ragam
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
