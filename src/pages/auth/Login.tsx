import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/Button';

export const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 md:p-12 border border-brand-100 shadow-sm rounded-sm">
        <h1 className="font-serif text-3xl mb-2 text-center">
          Welcome Back
        </h1>

        <p className="text-center text-brand-500 mb-8 text-sm">
          Please enter your details to sign in.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-brand-600 mb-2">
              Email Address
            </label>

            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-brand-50 border border-brand-100 focus:outline-none focus:border-brand-900 text-sm rounded-sm transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-brand-600 mb-2">
              Password
            </label>

            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-brand-50 border border-brand-100 focus:outline-none focus:border-brand-900 text-sm rounded-sm transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="text-brand-900 focus:ring-brand-900 rounded-sm"
              />
              <span className="text-brand-600">Remember me</span>
            </label>

            <a
              href="#"
              className="text-brand-900 underline hover:text-brand-600"
            >
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            fullWidth
            className="mt-4"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-brand-600 border-t border-brand-100 pt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-brand-900 underline hover:text-brand-600"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};