import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Product } from '../data/products';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const API_URL = 'http://localhost:5000/api';

export const WishlistProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [, setLoading] = useState(true);

  // Get logged-in user
  const getUser = () => {
    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  };

  // Convert backend product to frontend Product format
  const mapProduct = (product: any): Product => {
    return {
      id: product._id,
      name: product.name,
      category:
        product.category === 'Saree'
          ? 'sarees'
          : product.category === 'Jewellery'
            ? 'jewellery'
            : 'dresses',
      subcategory: '',
      description: product.description || '',
      price: product.price || 0,
      originalPrice: undefined,
      discount: undefined,
      images: product.image ? [product.image] : [],
      rating: 0,
      reviewCount: 0,
      stock: product.stock || 0,
      sizes: product.category === 'Dress' ? ['S', 'M', 'L', 'XL'] : undefined,
      colors: [],
      fabric: '',
      material: '',
      occasion: '',
      featured: false,
      newArrival: false,
      bestseller: false,
    };
  };

  // Load wishlist from MongoDB
  const fetchWishlist = async () => {
    const user = getUser();

    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    const userId = user.id || user._id;

    if (!userId) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/wishlist/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch wishlist'
        );
      }

      const products = (data.products || [])
        .filter((product: any) => product)
        .map(mapProduct);

      setWishlist(products);
    } catch (error: any) {
      console.error('Wishlist fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load wishlist when the app starts
  useEffect(() => {
    fetchWishlist();
  }, []);

  // Add or remove product
  const toggleWishlist = async (product: Product) => {
    const user = getUser();

    if (!user) {
      toast.error('Please login to use your wishlist');
      return;
    }

    const userId = user.id || user._id;

    if (!userId) {
      toast.error('Please login again');
      return;
    }

    const exists = wishlist.some(
      (item) => item.id === product.id
    );

    try {
      if (exists) {
        // Remove from wishlist
        const response = await fetch(
          `${API_URL}/wishlist/${userId}/remove/${product.id}`,
          {
            method: 'DELETE',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to remove from wishlist'
          );
        }

        const updatedWishlist = (data.wishlist?.products || [])
          .filter((item: any) => item)
          .map(mapProduct);

        setWishlist(updatedWishlist);

        toast.success(
          `Removed ${product.name} from wishlist`
        );
      } else {
        // Add to wishlist
        const response = await fetch(
          `${API_URL}/wishlist/${userId}/add`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: product.id,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to add to wishlist'
          );
        }

        const updatedWishlist = (data.wishlist?.products || [])
          .filter((item: any) => item)
          .map(mapProduct);

        setWishlist(updatedWishlist);

        toast.success(
          `Added ${product.name} to wishlist`
        );
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);

      toast.error(
        error.message || 'Something went wrong'
      );
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(
      (item) => item.id === productId
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (context === undefined) {
    throw new Error(
      'useWishlist must be used within a WishlistProvider'
    );
  }

  return context;
};