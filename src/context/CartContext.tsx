import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Product } from '../data/products';
import toast from 'react-hot-toast';
import { API_URL } from '../api';

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    size?: string
  ) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartItemCount: number;
  cartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Get logged-in user
  const getUser = () => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  };

  // Convert backend product into frontend Product format
  const mapProduct = (product: any): Product => {
    return {
      id: product._id,
      name: product.name || 'Product',
      category:
        product.category === 'Saree'
          ? 'sarees'
          : product.category === 'Jewellery'
            ? 'jewellery'
            : 'dresses',
      subcategory: '',
      description: product.description || '',
      price: Number(product.price) || 0,
      images: product.image ? [product.image] : [],
      rating: 0,
      reviewCount: 0,
      stock: Number(product.stock) || 0,
      featured: false,
      newArrival: false,
      bestseller: false,
    };
  };

  // Load cart from MongoDB
  const loadCart = async () => {
    const user = getUser();

    if (!user?.id) {
      setCart([]);
      return;
    }

    try {
      setCartLoading(true);

      const response = await fetch(
        `${API_URL}/cart/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load cart');
      }

      const formattedCart: CartItem[] = (data.items || [])
        .filter((item: any) => item.product)
        .map((item: any) => ({
          product: mapProduct(item.product),
          quantity: item.quantity,
        }));

      setCart(formattedCart);
    } catch (error: any) {
      console.error('Cart loading error:', error);
      toast.error('Failed to load your cart');
      setCart([]);
    } finally {
      setCartLoading(false);
    }
  };

  // Load cart when the user is logged in
  useEffect(() => {
    loadCart();
  }, []);

  // Listen for login/logout changes
  useEffect(() => {
    const handleStorageChange = () => {
      loadCart();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Add product to MongoDB cart
  const addToCart = async (
    product: Product,
    quantity = 1,
    _size?: string
  ) => {
    const user = getUser();

    if (!user?.id) {
      toast.error('Please login to add items to your cart');
      return;
    }

    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }

    try {
      setCartLoading(true);

      const response = await fetch(
        `${API_URL}/cart/${user.id}/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to add product to cart'
        );
      }

      const updatedCart: CartItem[] = (data.cart?.items || [])
        .filter((item: any) => item.product)
        .map((item: any) => ({
          product: mapProduct(item.product),
          quantity: item.quantity,
        }));

      setCart(updatedCart);

      toast.success(`Added ${product.name} to cart`);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.error(error.message || 'Failed to add product');
    } finally {
      setCartLoading(false);
    }
  };

  // Remove product from MongoDB cart
  const removeFromCart = async (productId: string) => {
    const user = getUser();

    if (!user?.id) {
      return;
    }

    try {
      setCartLoading(true);

      const response = await fetch(
        `${API_URL}/cart/${user.id}/remove/${productId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to remove product'
        );
      }

      const updatedCart: CartItem[] = (data.cart?.items || [])
        .filter((item: any) => item.product)
        .map((item: any) => ({
          product: mapProduct(item.product),
          quantity: item.quantity,
        }));

      setCart(updatedCart);

      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      toast.error(error.message || 'Failed to remove item');
    } finally {
      setCartLoading(false);
    }
  };

  // Update product quantity in MongoDB
  const updateQuantity = async (
    productId: string,
    quantity: number
  ) => {
    const user = getUser();

    if (!user?.id) {
      return;
    }

    if (quantity < 1) {
      return;
    }

    try {
      setCartLoading(true);

      const response = await fetch(
        `${API_URL}/cart/${user.id}/update/${productId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update cart'
        );
      }

      const updatedCart: CartItem[] = (data.cart?.items || [])
        .filter((item: any) => item.product)
        .map((item: any) => ({
          product: mapProduct(item.product),
          quantity: item.quantity,
        }));

      setCart(updatedCart);
    } catch (error: any) {
      console.error('Update quantity error:', error);
      toast.error(error.message || 'Failed to update quantity');
    } finally {
      setCartLoading(false);
    }
  };

  // Clear cart
  // Your current backend does not have a dedicated clear-cart route.
  // So we remove each item one by one.
  const clearCart = async () => {
    const user = getUser();

    if (!user?.id) {
      setCart([]);
      return;
    }

    try {
      setCartLoading(true);

      const currentCart = [...cart];

      for (const item of currentCart) {
        await fetch(
          `${API_URL}/cart/${user.id}/remove/${item.product.id}`,
          {
            method: 'DELETE',
          }
        );
      }

      setCart([]);
    } catch (error: any) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    } finally {
      setCartLoading(false);
    }
  };

  // Calculate total
  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  // Calculate number of products
  const cartItemCount = cart.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        cartLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error(
      'useCart must be used within a CartProvider'
    );
  }

  return context;
};