
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';
import { Button } from './Button';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-brand-100 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">

            <Link
              to="/"
              className="flex flex-col items-start mb-6 inline-block"
            >
              <span className="text-3xl font-serif tracking-widest text-brand-900">
                MIRAAYA
              </span>

              <span className="text-[10px] tracking-[0.2em] uppercase text-brand-600 mt-1">
                The Ladies Trunk
              </span>
            </Link>

            <div className="text-brand-600 text-sm leading-relaxed mb-6 space-y-2">

              <p>
                More than a shop, a trunk of beautiful collections.
                Handpicked with love, timeless fashion for every you.
              </p>

              {/* Contact */}
              <div className="pt-4 border-t border-brand-100">

                <p className="font-medium text-brand-900 mb-1">
                  Contact Us:
                </p>

                <p>
                  Pooja:{' '}
                  <a
                    href="tel:8660474355"
                    className="hover:text-brand-900 transition-colors"
                  >
                    8660474355
                  </a>
                </p>

                <p>
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
              <div className="pt-4 border-t border-brand-100">

                <p className="font-medium text-brand-900 mb-1">
                  Visit Us:
                </p>

                <p>
                  #513, Anand Alpine, JP Nagar 9th phase
                  <br />
                  Anjanapura, Bangalore
                </p>

              </div>

            </div>

            {/* Social Media */}
            <div className="flex gap-4 text-brand-900">

              {/* WhatsApp */}
              <a
                href="https://chat.whatsapp.com/D1NT8hTk5zF3h41mTXhRAE"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join Miraaya WhatsApp"
                className="hover:text-brand-600 transition-colors"
              >
                <MessageCircle size={20} />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/miraaya_theladiestrunk?stkn=MWh6OW5rOHM0cXVoNg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Miraaya on Instagram"
                className="hover:text-brand-600 transition-colors"
              >
                <Instagram size={20} />
              </a>

            </div>

          </div>


          {/* Quick Links */}
          <div>

            <h4 className="font-serif text-lg text-brand-900 mb-6">
              Quick Links
            </h4>

            <ul className="space-y-3 text-sm text-brand-600">

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

            <h4 className="font-serif text-lg text-brand-900 mb-6">
              Customer Care
            </h4>

            <ul className="space-y-3 text-sm text-brand-600">

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

            <h4 className="font-serif text-lg text-brand-900 mb-6">
              Newsletter
            </h4>

            <p className="text-sm text-brand-600 mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>

            <form className="flex flex-col gap-3">

              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-brand-50 border border-brand-100 focus:outline-none focus:border-brand-300 text-sm rounded-sm"
              />

              <Button
                variant="primary"
                className="w-full"
              >
                Subscribe
              </Button>

            </form>

          </div>

        </div>


        {/* Bottom Footer */}
        <div className="pt-8 border-t border-brand-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-500">

          <p>
            &copy; {new Date().getFullYear()} MIRAAYA. All rights reserved.
          </p>

          <div className="flex gap-4">

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