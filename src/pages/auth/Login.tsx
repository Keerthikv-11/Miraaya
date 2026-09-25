import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/Button';
import { API_URL } from '../../api';

export const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save customer authentication details
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Login successful!');

      navigate('/account');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to login. Please try again.';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 flex justify-center items-center min-h-[60vh]">
      <div className="w-full max-w-[340px] bg-white p-4 sm:p-6 border border-brand-100 shadow-2xs rounded-xs">
        <h1 className="font-serif text-lg sm:text-xl font-semibold mb-1 text-center text-brand-900">
          Welcome Back
        </h1>

        <p className="text-center text-brand-500 mb-4 text-xs">
          Please enter your details to sign in.
        </p>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-brand-600 mb-1">
              Email Address
            </label>

            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-brand-50/60 border border-brand-200 focus:outline-none focus:border-brand-900 text-xs rounded-xs transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-brand-600 mb-1">
              Password
            </label>

            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-brand-50/60 border border-brand-200 focus:outline-none focus:border-brand-900 text-xs rounded-xs transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex justify-between items-center text-xs pt-0.5">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-3 h-3 text-brand-900 focus:ring-brand-900 rounded-xs"
              />
              <span className="text-brand-600 text-[11px]">Remember me</span>
            </label>

            <a
              href="#"
              className="text-brand-900 underline hover:text-brand-600 text-[11px] font-medium"
            >
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            fullWidth
            className="mt-2 text-xs py-2"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs text-brand-600 border-t border-brand-100 pt-4 space-y-2.5">
          <div>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-brand-900 underline hover:text-brand-600 font-semibold"
            >
              Create Account
            </Link>
          </div>

          <div className="pt-0.5">
            <Link
              to="/admin-login"
              className="inline-flex items-center justify-center gap-1 w-full py-1.5 px-2.5 bg-brand-50 hover:bg-brand-900 text-brand-800 hover:text-white text-[10px] font-semibold uppercase tracking-wider rounded-xs transition-all border border-brand-200"
            >
              Go to Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};