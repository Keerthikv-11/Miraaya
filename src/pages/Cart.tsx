
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/Button';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

export const Cart = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartItemCount,
    cartLoading,
  } = useCart();

  const navigate = useNavigate();

  // Loading state while cart is being fetched
  if (cartLoading && cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="w-10 h-10 border-2 border-brand-300 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="font-serif text-2xl">Loading your cart...</h2>
      </div>
    );
  }

  // Empty cart
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center text-brand-300 mb-6">
          <ShoppingBag size={40} />
        </div>

        <h2 className="font-serif text-3xl md:text-4xl mb-4">
          Your Cart is Empty
        </h2>

        <p className="text-brand-600 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Discover
          our latest collections.
        </p>

        <Link to="/sarees">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const shipping = cartTotal > 2000 ? 0 : 150;
  const finalTotal = cartTotal + shipping;

  return (
    <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-14">
      <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl mb-6 sm:mb-10 text-brand-900 font-semibold">
        Shopping Cart ({cartItemCount})
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">

        {/* CART ITEMS */}
        <div className="lg:w-2/3">

          <div className="hidden md:grid grid-cols-12 text-sm font-medium uppercase tracking-widest text-brand-500 pb-4 border-b border-brand-200">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y divide-brand-100">

            {cart.map((item) => {

              const isAtMaxStock =
                item.quantity >= item.product.stock;

              return (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="py-8 flex flex-col md:grid md:grid-cols-12 items-center gap-6"
                >

                  {/* PRODUCT */}
                  <div className="col-span-6 flex items-center gap-6 w-full">

                    <Link
                      to={`/product/${item.product.id}`}
                      className="w-24 md:w-32 aspect-[3/4] shrink-0 bg-brand-50 rounded-sm overflow-hidden"
                    >
                      <img
                        src={
                          item.product.images?.[0] ||
                          'https://placehold.co/600x800/efe6d8/624431?text=Miraaya'
                        }
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div>

                      <div className="text-xs text-brand-500 uppercase tracking-widest mb-1">
                        {item.product.category}
                      </div>

                      <Link
                        to={`/product/${item.product.id}`}
                        className="hover:text-brand-600 transition-colors"
                      >
                        <h3 className="font-serif text-lg md:text-xl mb-2">
                          {item.product.name}
                        </h3>
                      </Link>

                      <div className="text-brand-700 font-medium mb-1">
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </div>

                      {item.size && (
                        <div className="text-sm text-brand-600">
                          Size: {item.size}
                        </div>
                      )}

                      {item.product.stock <= 5 &&
                        item.product.stock > 0 && (
                          <div className="text-xs text-orange-600 mt-1">
                            Only {item.product.stock} left
                          </div>
                        )}

                    </div>
                  </div>

                  {/* QUANTITY */}
                  <div className="col-span-3 flex justify-center w-full md:w-auto">

                    <div className="flex items-center border border-brand-200 rounded-sm">

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1
                          )
                        }
                        disabled={
                          cartLoading || item.quantity <= 1
                        }
                        className="w-10 h-10 flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                        disabled={
                          cartLoading || isAtMaxStock
                        }
                        className="w-10 h-10 flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} />
                      </button>

                    </div>

                  </div>

                  {/* ITEM TOTAL */}
                  <div className="col-span-2 text-right font-medium text-lg w-full md:w-auto">
                    ₹
                    {(
                      item.product.price * item.quantity
                    ).toLocaleString('en-IN')}
                  </div>

                  {/* REMOVE */}
                  <div className="col-span-1 flex justify-end w-full md:w-auto">

                    <button
                      onClick={() =>
                        removeFromCart(item.product.id)
                      }
                      disabled={cartLoading}
                      className="text-brand-400 hover:text-red-500 transition-colors p-2 disabled:opacity-40"
                    >
                      <Trash2 size={20} />
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="lg:w-1/3">

          <div className="bg-brand-50 p-8 rounded-sm sticky top-32">

            <h3 className="font-serif text-2xl mb-6">
              Order Summary
            </h3>

            <div className="space-y-4 text-brand-700 mb-6">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>

                <span>
                  {shipping === 0
                    ? 'Free'
                    : `₹${shipping.toLocaleString('en-IN')}`}
                </span>
              </div>

            </div>

            <div className="border-t border-brand-200 pt-6 mb-8">

              <div className="flex justify-between items-end">

                <span className="font-serif text-xl text-brand-900">
                  Total
                </span>

                <span className="font-medium text-2xl text-brand-900">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>

              </div>

              <p className="text-xs text-brand-500 mt-2">
                Tax included. Shipping calculated at checkout.
              </p>

            </div>

            <div className="flex flex-col gap-4">

              <Button
                size="lg"
                fullWidth
                onClick={() => navigate('/checkout')}
                disabled={cartLoading}
              >
                Proceed to Checkout
              </Button>

              <Link to="/">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                >
                  Continue Shopping
                </Button>
              </Link>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};