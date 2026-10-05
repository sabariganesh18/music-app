import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Music2, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = await register(name, email, password, confirmPassword);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
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
            Sign up for free
          </h1>
          <p className="text-xs text-[#a0a0a0]">
            Listen to millions of songs on Mouna Ragam
          </p>
        </div>

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
              What's your name?
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your profile name"
                required
                className="w-full bg-[#242424] text-white text-sm pl-10 pr-4 py-2.5 rounded-lg border border-transparent focus:border-[#1db954] focus:outline-none focus:bg-[#2a2a2a] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b3b3b3] mb-1.5">
              What's your email?
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
              Create a password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full bg-[#242424] text-white text-sm pl-10 pr-4 py-2.5 rounded-lg border border-transparent focus:border-[#1db954] focus:outline-none focus:bg-[#2a2a2a] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b3b3b3] mb-1.5">
              Confirm your password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
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
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-[#282828]">
          <p className="text-xs text-[#a0a0a0]">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:text-[#1db954] font-bold underline transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
