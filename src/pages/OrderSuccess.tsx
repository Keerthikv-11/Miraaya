
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { CheckCircle2 } from 'lucide-react';

type OrderData = {
  _id: string;
  totalAmount: number;
  status: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
  shippingAddress?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
};

export const OrderSuccess = () => {
  const location = useLocation();

  const order = location.state?.order as OrderData | undefined;

  const orderId = order?._id
    ? `ORD-${order._id.slice(-8).toUpperCase()}`
    : 'Order details unavailable';

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center min-h-[70vh]">

      <CheckCircle2
        size={64}
        className="text-green-600 mb-6"
      />

      <h1 className="font-serif text-4xl md:text-5xl mb-4">
        Order Placed Successfully!
      </h1>

      <p className="text-lg text-brand-600 mb-2">
        Thank you for your purchase.
      </p>

      <p className="text-brand-500 mb-10">
        Your order ID is{' '}
        <span className="font-medium text-brand-900">
          {orderId}
        </span>
      </p>

      {/* Order Information */}
      {order && (
        <div className="bg-brand-50 p-8 rounded-sm w-full max-w-lg mb-10 text-left border border-brand-100">

          <h3 className="font-medium uppercase tracking-widest text-sm mb-4 pb-2 border-b border-brand-200">
            Order Details
          </h3>

          <div className="space-y-3 text-sm text-brand-700">

            <div className="flex justify-between">
              <span>Order Status</span>
              <span className="font-medium text-brand-900">
                {order.status}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Items</span>
              <span className="font-medium text-brand-900">
                {order.items.reduce(
                  (total, item) => total + item.quantity,
                  0
                )}
              </span>
            </div>

            <div className="flex justify-between pt-3 border-t border-brand-200">
              <span className="font-medium">
                Order Total
              </span>

              <span className="font-medium text-brand-900">
                ₹{order.totalAmount.toLocaleString()}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* What's Next */}
      <div className="bg-brand-50 p-8 rounded-sm w-full max-w-lg mb-10 text-left border border-brand-100">

        <h3 className="font-medium uppercase tracking-widest text-sm mb-4 pb-2 border-b border-brand-200">
          What's Next?
        </h3>

        <ul className="space-y-4 text-brand-700 text-sm">

          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-200 flex items-center justify-center text-xs font-medium shrink-0">
              1
            </span>

            Your order has been received and is currently being processed.
          </li>

          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-200 flex items-center justify-center text-xs font-medium shrink-0">
              2
            </span>

            Our team will carefully package your items.
          </li>

          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-200 flex items-center justify-center text-xs font-medium shrink-0">
              3
            </span>

            You will be notified once your order ships.
          </li>

        </ul>
      </div>

      <div className="flex gap-4">

        <Link to="/account?tab=orders">
          <Button variant="outline">
            View Orders
          </Button>
        </Link>

        <Link to="/">
          <Button>
            Continue Shopping
          </Button>
        </Link>

      </div>

    </div>
  );
};