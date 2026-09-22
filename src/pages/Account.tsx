import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
} from 'lucide-react';
import { cn } from '../utils/utils';
import toast from 'react-hot-toast';
import { API_URL } from '../api';

interface UserData {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status:
  | 'Pending'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';
  shippingAddress?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt: string;
}

export const Account = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<UserData | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Load logged-in user
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Read active tab from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');

    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  // Fetch customer orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const userId = user.id || user._id;

      if (!userId) return;

      setOrdersLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/orders/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to fetch orders'
          );
        }

        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);

        toast.error('Unable to load your orders');
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const tabs = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: Package,
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
    },
    {
      id: 'addresses',
      label: 'Saved Addresses',
      icon: MapPin,
    },
  ];

  // Get user's name
  const fullName = user?.name || 'Miraaya Customer';

  // Get first letter for avatar
  const firstLetter = fullName.charAt(0).toUpperCase();

  // Split name for first/last name fields
  const nameParts = fullName.trim().split(' ');

  const firstName = nameParts[0] || '';
  const lastName =
    nameParts.slice(1).join(' ') || '';

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);

    navigate('/login');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700';

      case 'Cancelled':
        return 'bg-red-100 text-red-700';

      case 'Shipped':
        return 'bg-blue-100 text-blue-700';

      case 'Packed':
        return 'bg-purple-100 text-purple-700';

      case 'Confirmed':
        return 'bg-yellow-100 text-yellow-700';

      default:
        return 'bg-brand-200 text-brand-700';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="font-serif text-2xl mb-4">
          Loading your account...
        </h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">

      <h1 className="font-serif text-3xl md:text-5xl mb-12 text-center">
        My Account
      </h1>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-16">

        {/* SIDEBAR */}
        <div className="md:w-1/4">

          <div className="bg-brand-50 p-6 rounded-sm sticky top-32">

            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-brand-200">

              <div className="w-12 h-12 bg-brand-900 rounded-full flex items-center justify-center text-white font-serif text-xl">
                {firstLetter}
              </div>

              <div className="min-w-0">

                <h3 className="font-medium truncate">
                  {fullName}
                </h3>

                <p className="text-sm text-brand-600 truncate">
                  {user.email || ''}
                </p>

              </div>

            </div>

            <nav className="space-y-2">

              {tabs.map((tab) => {

                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);

                      navigate(
                        tab.id === 'profile'
                          ? '/account'
                          : `/account?tab=${tab.id}`
                      );
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left transition-colors text-sm font-medium',
                      activeTab === tab.id
                        ? 'bg-brand-900 text-white'
                        : 'text-brand-700 hover:bg-brand-200'
                    )}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );

              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left text-brand-700 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium mt-4 border-t border-brand-200"
              >
                <LogOut size={18} />
                Logout
              </button>

            </nav>

          </div>

        </div>

        {/* CONTENT */}
        <div className="md:w-3/4">

          {/* PROFILE */}
          {activeTab === 'profile' && (

            <div>

              <h2 className="font-serif text-2xl mb-6 pb-2 border-b border-brand-100">
                Personal Information
              </h2>

              <form className="space-y-6 max-w-lg">

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="block text-xs uppercase tracking-widest text-brand-600 mb-2">
                      First Name
                    </label>

                    <input
                      type="text"
                      defaultValue={firstName}
                      className="w-full px-4 py-3 bg-white border border-brand-200 rounded-sm"
                    />

                  </div>

                  <div>

                    <label className="block text-xs uppercase tracking-widest text-brand-600 mb-2">
                      Last Name
                    </label>

                    <input
                      type="text"
                      defaultValue={lastName}
                      className="w-full px-4 py-3 bg-white border border-brand-200 rounded-sm"
                    />

                  </div>

                </div>

                <div>

                  <label className="block text-xs uppercase tracking-widest text-brand-600 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    defaultValue={user.email || ''}
                    className="w-full px-4 py-3 bg-white border border-brand-200 rounded-sm"
                  />

                </div>

                <div>

                  <label className="block text-xs uppercase tracking-widest text-brand-600 mb-2">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    defaultValue={user.phone || ''}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 bg-white border border-brand-200 rounded-sm"
                  />

                </div>

                <Button type="button">
                  Save Changes
                </Button>

              </form>

            </div>

          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (

            <div>

              <h2 className="font-serif text-2xl mb-6 pb-2 border-b border-brand-100">
                Order History
              </h2>

              {ordersLoading ? (

                <div className="bg-brand-50 p-12 rounded-sm text-center border border-brand-100">
                  <p className="text-brand-600">
                    Loading your orders...
                  </p>
                </div>

              ) : orders.length === 0 ? (

                <div className="bg-brand-50 p-12 rounded-sm text-center border border-brand-100 border-dashed">

                  <Package
                    size={48}
                    className="mx-auto text-brand-300 mb-4"
                  />

                  <h3 className="font-serif text-xl mb-2">
                    No orders yet
                  </h3>

                  <p className="text-brand-600 mb-6">
                    Looks like you haven't made your first purchase.
                  </p>

                  <Button
                    onClick={() => navigate('/')}
                  >
                    Start Shopping
                  </Button>

                </div>

              ) : (

                <div className="space-y-6">

                  {orders.map((order) => (

                    <div
                      key={order._id}
                      className="border border-brand-100 rounded-sm overflow-hidden"
                    >

                      {/* ORDER HEADER */}
                      <div className="bg-brand-50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>

                          <p className="text-xs uppercase tracking-widest text-brand-500 mb-1">
                            Order ID
                          </p>

                          <p className="font-medium text-brand-900">
                            ORD-{order._id
                              .slice(-8)
                              .toUpperCase()}
                          </p>

                          <p className="text-sm text-brand-600 mt-1">
                            Placed on {formatDate(order.createdAt)}
                          </p>

                        </div>

                        <span
                          className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>

                      </div>

                      {/* ORDER ITEMS */}
                      <div className="p-5 space-y-4">

                        {order.items.map(
                          (item, index) => (

                            <div
                              key={`${order._id}-${index}`}
                              className="flex items-center gap-4"
                            >

                              {item.image ? (

                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-20 object-cover rounded-sm"
                                />

                              ) : (

                                <div className="w-16 h-20 bg-brand-100 rounded-sm flex items-center justify-center">
                                  <Package
                                    size={20}
                                    className="text-brand-400"
                                  />
                                </div>

                              )}

                              <div className="flex-grow">

                                <h4 className="font-medium text-sm text-brand-900">
                                  {item.name}
                                </h4>

                                <p className="text-sm text-brand-600 mt-1">
                                  ₹{item.price.toLocaleString()} ×{' '}
                                  {item.quantity}
                                </p>

                              </div>

                              <p className="font-medium text-sm">
                                ₹
                                {(
                                  item.price *
                                  item.quantity
                                ).toLocaleString()}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                      {/* ORDER FOOTER */}
                      <div className="border-t border-brand-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>

                          <p className="text-sm text-brand-600">
                            Delivery to
                          </p>

                          {order.shippingAddress && (
                            <p className="text-sm text-brand-800 mt-1">
                              {order.shippingAddress.city},{' '}
                              {order.shippingAddress.state}
                            </p>
                          )}

                        </div>

                        <div className="text-right">

                          <p className="text-sm text-brand-600">
                            Order Total
                          </p>

                          <p className="font-medium text-xl text-brand-900">
                            ₹{order.totalAmount.toLocaleString()}
                          </p>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          )}

          {/* WISHLIST */}
          {activeTab === 'wishlist' && (

            <div>

              <h2 className="font-serif text-2xl mb-6 pb-2 border-b border-brand-100">
                My Wishlist
              </h2>

              {wishlist.length === 0 ? (

                <div className="bg-brand-50 p-12 rounded-sm text-center border border-brand-100 border-dashed">

                  <Heart
                    size={48}
                    className="mx-auto text-brand-300 mb-4"
                  />

                  <h3 className="font-serif text-xl mb-2">
                    Your wishlist is empty
                  </h3>

                  <p className="text-brand-600 mb-6">
                    Save items you love to view them later.
                  </p>

                  <Button
                    onClick={() => navigate('/sarees')}
                  >
                    Discover New Arrivals
                  </Button>

                </div>

              ) : (

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                  {wishlist.map((product) => (

                    <ProductCard
                      key={product.id}
                      product={product}
                    />

                  ))}

                </div>

              )}

            </div>

          )}

          {/* ADDRESSES */}
          {activeTab === 'addresses' && (

            <div>

              <h2 className="font-serif text-2xl mb-6 pb-2 border-b border-brand-100">
                Saved Addresses
              </h2>

              <div className="bg-brand-50 p-12 rounded-sm text-center border border-brand-100 border-dashed">

                <MapPin
                  size={48}
                  className="mx-auto text-brand-300 mb-4"
                />

                <h3 className="font-serif text-xl mb-2">
                  No saved addresses
                </h3>

                <p className="text-brand-600 mb-6">
                  Your saved delivery addresses will appear here.
                </p>

                <Button
                  variant="outline"
                  className="border-dashed"
                >
                  + Add New Address
                </Button>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};