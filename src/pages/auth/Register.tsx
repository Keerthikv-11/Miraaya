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
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 md:p-12 border border-brand-100 shadow-sm rounded-sm">
        <h1 className="font-serif text-3xl mb-2 text-center">
          Create Account
        </h1>

        <p className="text-center text-brand-500 mb-8 text-sm">
          Join Miraaya for a premium experience.
        </p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-brand-600 mb-2">
                First Name
              </label>

              <input
                required
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-brand-50 border border-brand-100 focus:outline-none focus:border-brand-900 text-sm rounded-sm"
                placeholder="First name"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-brand-600 mb-2">
                Last Name
              </label>

              <input
                required
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-brand-50 border border-brand-100 focus:outline-none focus:border-brand-900 text-sm rounded-sm"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-brand-600 mb-2">
              Email Address
            </label>

            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-brand-50 border border-brand-100 focus:outline-none focus:border-brand-900 text-sm rounded-sm"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-brand-600 mb-2">
              Phone Number
            </label>

            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-brand-50 border border-brand-100 focus:outline-none focus:border-brand-900 text-sm rounded-sm"
              placeholder="Enter your phone number"
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
              className="w-full px-4 py-3 bg-brand-50 border border-brand-100 focus:outline-none focus:border-brand-900 text-sm rounded-sm"
              placeholder="Create a password"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            className="mt-4"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-brand-600 border-t border-brand-100 pt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-900 underline hover:text-brand-600"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};