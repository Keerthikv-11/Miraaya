
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';
import { Button } from './Button';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-brand-100 pt-8 sm:pt-14 pb-5 sm:pb-8 text-xs sm:text-sm">
      <div className="container mx-auto px-3 sm:px-6 md:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mb-8 sm:mb-12">

          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">

            <Link
              to="/"
              className="flex flex-col items-start mb-3 sm:mb-5 inline-block"
            >
              <span className="text-xl sm:text-2xl font-serif tracking-widest text-brand-900 font-semibold">
                MIRAAYA
              </span>

              <span className="text-[8px] sm:text-[9px] tracking-[0.2em] uppercase text-brand-600 mt-0.5">
                The Ladies Trunk
              </span>
            </Link>

            <div className="text-brand-600 text-xs leading-relaxed mb-4 space-y-1.5">

              <p>
                More than a shop, a trunk of beautiful collections.
                Handpicked with love, timeless fashion for every you.
              </p>

              {/* Contact */}
              <div className="pt-2 border-t border-brand-100">

                <p className="font-semibold text-brand-900 mb-0.5 text-xs">
                  Contact Us:
                </p>

                <p className="text-xs">
                  Pooja:{' '}
                  <a
                    href="tel:8660474355"
                    className="hover:text-brand-900 transition-colors"
                  >
                    8660474355
                  </a>
                </p>

                <p className="text-xs">
                  Meghana:{' '}
                  <a
                    href="tel:6366304554"
                    className="hover:text-brand-900 transition-colors"
                  >
                    6366304554
                  </a>
                </p>

              </div>

              {/* Address */}
              <div className="pt-2 border-t border-brand-100">

                <p className="font-semibold text-brand-900 mb-0.5 text-xs">
                  Visit Us:
                </p>

                <p className="text-xs">
                  #513, Anand Alpine, JP Nagar 9th phase
                  <br />
                  Anjanapura, Bangalore
                </p>

              </div>

            </div>

            {/* Social Media */}
            <div className="flex gap-3 text-brand-900">

              {/* WhatsApp */}
              <a
                href="https://chat.whatsapp.com/D1NT8hTk5zF3h41mTXhRAE"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join Miraaya WhatsApp"
                className="hover:text-brand-600 transition-colors p-0.5"
              >
                <MessageCircle size={18} />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/miraaya_theladiestrunk?stkn=MWh6OW5rOHM0cXVoNg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Miraaya on Instagram"
                className="hover:text-brand-600 transition-colors p-0.5"
              >
                <Instagram size={18} />
              </a>

            </div>

          </div>


          {/* Quick Links */}
          <div>

            <h4 className="font-serif text-sm sm:text-base text-brand-900 mb-2.5 sm:mb-4 font-semibold">
              Quick Links
            </h4>

            <ul className="space-y-1.5 sm:space-y-2 text-xs text-brand-600">

              <li>
                <Link
                  to="/sarees"
                  className="hover:text-brand-900 transition-colors"
                >
                  Sarees
                </Link>
              </li>

              <li>
                <Link
                  to="/jewellery"
                  className="hover:text-brand-900 transition-colors"
                >
                  Jewellery
                </Link>
              </li>

              <li>
                <Link
                  to="/dresses"
                  className="hover:text-brand-900 transition-colors"
                >
                  Dresses
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="hover:text-brand-900 transition-colors"
                >
                  Our Story
                </Link>
              </li>

            </ul>

          </div>


          {/* Customer Care */}
          <div>

            <h4 className="font-serif text-sm sm:text-base text-brand-900 mb-2.5 sm:mb-4 font-semibold">
              Customer Care
            </h4>

            <ul className="space-y-1.5 sm:space-y-2 text-xs text-brand-600">

              <li>
                <Link
                  to="/contact"
                  className="hover:text-brand-900 transition-colors"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  to="/shipping"
                  className="hover:text-brand-900 transition-colors"
                >
                  Shipping & Delivery
                </Link>
              </li>

              <li>
                <Link
                  to="/returns"
                  className="hover:text-brand-900 transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>

              <li>
                <Link
                  to="/faq"
                  className="hover:text-brand-900 transition-colors"
                >
                  FAQ
                </Link>
              </li>

            </ul>

          </div>


          {/* Newsletter */}
          <div>

            <h4 className="font-serif text-sm sm:text-base text-brand-900 mb-2.5 sm:mb-4 font-semibold">
              Newsletter
            </h4>

            <p className="text-xs text-brand-600 mb-2.5">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>

            <form className="flex flex-col gap-2">

              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-3 py-2 bg-brand-50 border border-brand-100 focus:outline-none focus:border-brand-300 text-xs rounded-xs"
              />

              <Button
                variant="primary"
                className="w-full text-xs py-2"
              >
                Subscribe
              </Button>

            </form>

          </div>

        </div>


        {/* Bottom Footer */}
        <div className="pt-4 border-t border-brand-100 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-brand-500">

          <p>
            &copy; {new Date().getFullYear()} MIRAAYA. All rights reserved.
          </p>

          <div className="flex gap-3">

            <Link
              to="/privacy"
              className="hover:text-brand-900 transition-colors"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="hover:text-brand-900 transition-colors"
            >
              Terms of Service
            </Link>

          </div>

        </div>

      </div>
    </footer>
  );
};