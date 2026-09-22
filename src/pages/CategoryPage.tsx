import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Product } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal } from 'lucide-react';
import { API_URL } from '../api';

interface CategoryPageProps {
  category: 'sarees' | 'jewellery' | 'dresses';
  title: string;
  description: string;
}

interface BackendProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'Saree' | 'Jewellery' | 'Dress';
  image: string;
  stock: number;
  isAvailable: boolean;
  createdAt?: string;
}

export const CategoryPage = ({
  category,
  title,
  description,
}: CategoryPageProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const backendCategory =
          category === 'sarees'
            ? 'Saree'
            : category === 'jewellery'
              ? 'Jewellery'
              : 'Dress';

        const response = await fetch(
          `${API_URL}/products/category/${backendCategory}`
        );

        if (!response.ok) {
          throw new Error('Failed to load products');
        }

        const data: BackendProduct[] = await response.json();

        const formattedProducts: Product[] = data.map((product) => ({
          id: product._id,
          name: product.name,
          category,
          subcategory: '',
          description: product.description || '',
          price: product.price,
          images: product.image
            ? [product.image]
            : [
              'https://placehold.co/600x800/efe6d8/624431?text=Miraaya',
            ],
          rating: 0,
          reviewCount: 0,
          stock: product.stock,
          sizes:
            category === 'dresses'
              ? ['XS', 'S', 'M', 'L', 'XL']
              : undefined,
          colors: [],
          fabric: '',
          material: '',
          occasion: '',
          featured: false,
          newArrival: false,
          bestseller: false,
        }));

        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(
          'Unable to load products. Please make sure the Miraaya server is running.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, location.pathname]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    }

    if (sortBy === 'price-high') {
      return b.price - a.price;
    }

    // Backend products currently don't have featured/newArrival fields.
    // Keep the original backend order for these options.
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner */}
      <div className="bg-brand-100 rounded-sm py-16 px-8 text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl mb-4 text-brand-900">
          {title}
        </h1>

        <p className="text-brand-700 max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 font-medium uppercase tracking-widest text-sm border border-brand-200 px-4 py-2 rounded-sm"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-none bg-transparent font-medium uppercase tracking-widest text-sm focus:ring-0 cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Sidebar Filters */}
        <div
          className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'
            }`}
        >
          <div className="sticky top-32 space-y-8 pr-4">
            <div>
              <h3 className="font-serif text-xl mb-4 border-b border-brand-100 pb-2">
                Filters
              </h3>

              <div className="space-y-6 mt-6">
                {/* Availability */}
                <div>
                  <h4 className="font-medium mb-3">Availability</h4>

                  <label className="flex items-center gap-3 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-brand-900 border-brand-300 rounded-sm focus:ring-brand-900"
                    />
                    <span className="text-brand-700">
                      In Stock
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-brand-900 border-brand-300 rounded-sm focus:ring-brand-900"
                    />
                    <span className="text-brand-700">
                      Out of Stock
                    </span>
                  </label>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">
                    Price Range
                  </h4>

                  <label className="flex items-center gap-3 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-brand-900 border-brand-300 rounded-sm focus:ring-brand-900"
                    />
                    <span className="text-brand-700">
                      Under ₹5,000
                    </span>
                  </label>

                  <label className="flex items-center gap-3 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-brand-900 border-brand-300 rounded-sm focus:ring-brand-900"
                    />
                    <span className="text-brand-700">
                      ₹5,000 - ₹10,000
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-brand-900 border-brand-300 rounded-sm focus:ring-brand-900"
                    />
                    <span className="text-brand-700">
                      Over ₹10,000
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:w-3/4">
          <div className="hidden lg:flex justify-between items-center mb-8 pb-4 border-b border-brand-100">
            <p className="text-brand-600">
              {loading ? 'Loading...' : `${products.length} products`}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm uppercase tracking-widest text-brand-600">
                Sort by:
              </span>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-none bg-transparent font-medium uppercase tracking-widest text-sm focus:ring-0 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">
                  Price: Low to High
                </option>
                <option value="price-high">
                  Price: High to Low
                </option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <p className="text-xl text-brand-600">
                Loading Miraaya products...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-20">
              <p className="text-xl text-red-600 mb-3">
                {error}
              </p>

              <p className="text-sm text-brand-500">
                Check that your backend is running on port 5000.
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            sortedProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-brand-600">
                  No products found.
                </p>

                <p className="text-sm text-brand-500 mt-2">
                  Add products from the Miraaya admin panel.
                </p>
              </div>
            )}

          {/* Products */}
          {!loading &&
            !error &&
            sortedProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};