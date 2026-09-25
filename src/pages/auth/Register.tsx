import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/Button';
import { API_URL } from '../../api';

export const Register = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `${firstName} ${lastName}`.trim(),
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Account created successfully!');

      navigate('/login');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to create account. Please try again.';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 flex justify-center items-center min-h-[60vh]">
      <div className="w-full max-w-[360px] bg-white p-4 sm:p-6 border border-brand-100 shadow-2xs rounded-xs">
        <h1 className="font-serif text-lg sm:text-xl font-semibold mb-1 text-center text-brand-900">
          Create Account
        </h1>

        <p className="text-center text-brand-500 mb-4 text-xs">
          Join Miraaya for a premium experience.
        </p>

        <form onSubmit={handleRegister} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-brand-600 mb-1">
                First Name
              </label>

              <input
                required
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-brand-50/60 border border-brand-200 focus:outline-none focus:border-brand-900 text-xs rounded-xs"
                placeholder="First name"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-brand-600 mb-1">
                Last Name
              </label>

              <input
                required
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-brand-50/60 border border-brand-200 focus:outline-none focus:border-brand-900 text-xs rounded-xs"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-brand-600 mb-1">
              Email Address
            </label>

            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-brand-50/60 border border-brand-200 focus:outline-none focus:border-brand-900 text-xs rounded-xs"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-brand-600 mb-1">
              Phone Number
            </label>

            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-brand-50/60 border border-brand-200 focus:outline-none focus:border-brand-900 text-xs rounded-xs"
              placeholder="Enter your phone number"
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
              className="w-full px-2.5 py-1.5 bg-brand-50/60 border border-brand-200 focus:outline-none focus:border-brand-900 text-xs rounded-xs"
              placeholder="Create a password"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            className="mt-2 text-xs py-2"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs text-brand-600 border-t border-brand-100 pt-3">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-900 underline hover:text-brand-600 font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};