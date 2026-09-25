import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SearchModal } from './SearchModal';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartItemCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Sarees', path: '/sarees' },
    { name: 'Jewellery', path: '/jewellery' },
    { name: 'Dresses', path: '/dresses' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-brand-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-serif tracking-widest text-brand-900">MIRAAYA</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-brand-600 mt-1">The Ladies Trunk</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm tracking-widest uppercase transition-colors ${isActive ? 'text-brand-900 font-medium' : 'text-brand-600 hover:text-brand-900'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4 md:gap-6 text-brand-900">
            <button
              onClick={() => setIsSearchOpen(true)}
              title="Search Sarees, Jewellery, Dresses..."
              className="hover:text-brand-600 transition-colors flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100 hover:bg-brand-100"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Search</span>
            </button>
            <Link to="/account" className="hover:text-brand-600 transition-colors hidden sm:block" title="Account">
              <User size={20} />
            </Link>
            <Link to="/account?tab=wishlist" className="hover:text-brand-600 transition-colors hidden sm:block" title="Wishlist">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="hover:text-brand-600 transition-colors relative" title="Cart">
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden absolute top-full left-0 w-full bg-white border-t border-brand-100 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-screen border-b shadow-lg' : 'max-h-0 border-transparent'}`}>
          <nav className="flex flex-col px-6 py-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `py-3 text-sm tracking-widest uppercase border-b border-brand-50 transition-colors ${isActive ? 'text-brand-900 font-medium' : 'text-brand-600'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <div className="flex gap-6 py-6 border-b border-brand-50 text-brand-600 justify-around">
              <Link to="/account" className="flex flex-col items-center gap-2 text-xs"><User size={20} /> Account</Link>
              <Link to="/account?tab=wishlist" className="flex flex-col items-center gap-2 text-xs"><Heart size={20} /> Wishlist</Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="flex flex-col items-center gap-2 text-xs"
              >
                <Search size={20} /> Search
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Search Modal Overlay */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};