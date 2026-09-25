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
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 md:py-4' : 'bg-transparent py-4 md:py-6'}`}>
        <div className="container mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-between">

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-brand-900 p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 flex flex-col items-center">
            <span className="text-xl sm:text-2xl md:text-3xl font-serif tracking-widest text-brand-900 font-semibold">MIRAAYA</span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-brand-600 mt-0.5">The Ladies Trunk</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-xs md:text-sm tracking-widest uppercase transition-colors ${isActive ? 'text-brand-900 font-medium border-b border-brand-900 pb-0.5' : 'text-brand-600 hover:text-brand-900'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-2.5 sm:gap-4 md:gap-6 text-brand-900">
            <button
              onClick={() => setIsSearchOpen(true)}
              title="Search Sarees, Jewellery, Dresses..."
              className="hover:text-brand-600 transition-colors flex items-center gap-1.5 text-[11px] sm:text-xs font-medium uppercase tracking-wider bg-white/80 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-brand-200/80 hover:bg-brand-100 shadow-2xs"
            >
              <Search size={15} />
              <span className="hidden sm:inline">Search</span>
            </button>
            <Link to="/account" className="hover:text-brand-600 transition-colors hidden sm:block p-1" title="Account">
              <User size={19} />
            </Link>
            <Link to="/account?tab=wishlist" className="hover:text-brand-600 transition-colors hidden sm:block p-1" title="Wishlist">
              <Heart size={19} />
            </Link>
            <Link to="/cart" className="hover:text-brand-600 transition-colors relative p-1" title="Cart">
              <ShoppingBag size={19} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden absolute top-full left-0 w-full bg-white border-t border-brand-100 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-screen border-b shadow-lg' : 'max-h-0 border-transparent'}`}>
          <nav className="flex flex-col px-5 py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `py-2.5 text-xs sm:text-sm tracking-widest uppercase border-b border-brand-50 transition-colors ${isActive ? 'text-brand-900 font-semibold' : 'text-brand-700'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <div className="flex gap-4 py-4 border-b border-brand-50 text-brand-700 justify-around">
              <Link to="/account" className="flex flex-col items-center gap-1 text-[11px] font-medium"><User size={18} /> Account</Link>
              <Link to="/account?tab=wishlist" className="flex flex-col items-center gap-1 text-[11px] font-medium"><Heart size={18} /> Wishlist</Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="flex flex-col items-center gap-1 text-[11px] font-medium"
              >
                <Search size={18} /> Search
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