import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Package } from 'lucide-react';
import { API_URL } from '../api';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SearchProduct {
    _id: string;
    name: string;
    category: string;
    price: number;
    image: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<SearchProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setProducts([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) {
            setProducts([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/products`);
                if (response.ok) {
                    const data = await response.json();
                    const searchTerm = query.toLowerCase().trim();

                    const filtered = data.filter((item: any) => {
                        const nameMatch = item.name?.toLowerCase().includes(searchTerm);
                        const categoryMatch = item.category?.toLowerCase().includes(searchTerm);
                        const descMatch = item.description?.toLowerCase().includes(searchTerm);
                        return nameMatch || categoryMatch || descMatch;
                    });

                    setProducts(filtered);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    const handleQuickCategory = (catPath: string) => {
        onClose();
        navigate(catPath);
    };

    const handleSelectProduct = (productId: string) => {
        onClose();
        navigate(`/product/${productId}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-20 px-4 transition-opacity">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-brand-100 animate-in fade-in zoom-in duration-200">
                
                {/* Search Bar Header */}
                <div className="relative flex items-center px-6 py-4 border-b border-brand-100 bg-brand-50/50">
                    <Search className="text-brand-400 mr-3 shrink-0" size={22} />
                    <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for Sarees, Jewellery, Dresses, or keywords..."
                        className="w-full bg-transparent text-base md:text-lg text-brand-900 placeholder-brand-400 outline-none font-sans"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-1 text-brand-400 hover:text-brand-800 rounded-full mr-2"
                        >
                            <X size={18} />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 text-brand-500 hover:text-brand-900 rounded-lg hover:bg-brand-100 transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Popular Keywords / Categories */}
                {!query && (
                    <div className="p-6">
                        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">
                            Popular Categories & Keywords
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleQuickCategory('/sarees')}
                                className="px-4 py-2 bg-brand-50 hover:bg-brand-900 hover:text-white text-brand-800 rounded-full text-sm font-medium transition-all"
                            >
                                Sarees
                            </button>
                            <button
                                onClick={() => handleQuickCategory('/jewellery')}
                                className="px-4 py-2 bg-brand-50 hover:bg-brand-900 hover:text-white text-brand-800 rounded-full text-sm font-medium transition-all"
                            >
                                Jewellery
                            </button>
                            <button
                                onClick={() => handleQuickCategory('/dresses')}
                                className="px-4 py-2 bg-brand-50 hover:bg-brand-900 hover:text-white text-brand-800 rounded-full text-sm font-medium transition-all"
                            >
                                Dresses
                            </button>
                            <button
                                onClick={() => {
                                    setQuery('silk');
                                }}
                                className="px-4 py-2 bg-brand-50 hover:bg-brand-900 hover:text-white text-brand-800 rounded-full text-sm font-medium transition-all"
                            >
                                Silk
                            </button>
                            <button
                                onClick={() => {
                                    setQuery('gold');
                                }}
                                className="px-4 py-2 bg-brand-50 hover:bg-brand-900 hover:text-white text-brand-800 rounded-full text-sm font-medium transition-all"
                            >
                                Gold / Kundan
                            </button>
                        </div>
                    </div>
                )}

                {/* Live Search Results */}
                {query && (
                    <div className="max-h-[60vh] overflow-y-auto p-4 md:p-6">
                        {loading ? (
                            <div className="py-12 text-center text-brand-400 font-sans text-sm">
                                Searching products...
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-12 text-center">
                                <Package className="mx-auto mb-3 text-brand-300" size={40} />
                                <p className="text-brand-800 font-medium text-base">No products match "{query}"</p>
                                <p className="text-brand-400 text-xs mt-1">Try searching for keywords like Sarees, Jewellery, or Dresses.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-2">
                                    Found {products.length} product{products.length > 1 ? 's' : ''}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {products.map((item) => (
                                        <div
                                            key={item._id}
                                            onClick={() => handleSelectProduct(item._id)}
                                            className="flex items-center gap-4 p-3 rounded-xl border border-brand-100 hover:border-brand-900 hover:shadow-md cursor-pointer transition-all bg-white group"
                                        >
                                            <img
                                                src={item.image || 'https://placehold.co/100x100?text=Miraaya'}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-lg shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-500 block">
                                                    {item.category}
                                                </span>
                                                <h4 className="text-sm font-medium text-brand-900 truncate group-hover:text-brand-600">
                                                    {item.name}
                                                </h4>
                                                <p className="text-sm font-semibold text-brand-900 mt-0.5">
                                                    ₹{item.price?.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <ArrowRight size={16} className="text-brand-300 group-hover:text-brand-900 group-hover:translate-x-1 transition-all shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
