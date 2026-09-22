import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/Button';
import { API_URL } from '../../api';

export const AdminLogin = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/admin/auth/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Invalid admin email or password'
                );
            }

            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('admin', JSON.stringify(data.admin));

            toast.success('Admin login successful!');

            navigate('/admin');
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
        <div className="min-h-screen bg-brand-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white p-8 md:p-12 border border-brand-100 shadow-sm rounded-sm">

                <div className="text-center mb-8">
                    <h1 className="font-serif text-4xl text-brand-900 mb-2">
                        MIRAAYA
                    </h1>

                    <p className="text-brand-600 text-sm">
                        Admin Portal
                    </p>
                </div>

                <div className="border-t border-brand-100 pt-8">

                    <h2 className="font-serif text-2xl text-center mb-2">
                        Admin Sign In
                    </h2>

                    <p className="text-center text-brand-500 text-sm mb-8">
                        Sign in to manage your products and orders.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-5">

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-brand-600 mb-2">
                                Admin Email
                            </label>

                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter admin email"
                                className="w-full px-4 py-3 bg-brand-50 border border-brand-100 focus:outline-none focus:border-brand-900 text-sm rounded-sm"
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
                                placeholder="Enter admin password"
                                className="w-full px-4 py-3 bg-brand-50 border border-brand-100 focus:outline-none focus:border-brand-900 text-sm rounded-sm"
                            />
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            className="mt-4"
                        >
                            {loading ? 'Signing In...' : 'Admin Sign In'}
                        </Button>

                    </form>
                </div>

                <div className="text-center mt-8 pt-6 border-t border-brand-100">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-sm text-brand-600 hover:text-brand-900 underline"
                    >
                        Back to Miraaya
                    </button>
                </div>

            </div>
        </div>
    );
};