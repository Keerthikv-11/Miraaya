
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { cn } from '../utils/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const image =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://placehold.co/600x800/efe6d8/624431?text=Miraaya';

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-100">
        <Link to={`/product/${product.id}`}>
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Stock Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOutOfStock ? (
            <span className="bg-black/80 text-white text-xs px-2 py-1 rounded-sm uppercase tracking-wider font-medium">
              Out of Stock
            </span>
          ) : product.stock <= 5 ? (
            <span className="bg-white/90 backdrop-blur-sm text-brand-900 text-xs px-2 py-1 rounded-sm uppercase tracking-wider font-medium">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Wishlist */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
          <button
            onClick={() => toggleWishlist(product)}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-brand-50 text-brand-900 transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart
              size={20}
              className={cn(
                isInWishlist(product.id) && 'fill-brand-900'
              )}
            />
          </button>
        </div>

        {/* Add to Cart */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={() => addToCart(product)}
              className="w-full py-3 bg-white/95 backdrop-blur-sm text-brand-900 font-medium text-sm flex items-center justify-center gap-2 rounded-sm shadow-lg hover:bg-brand-900 hover:text-white transition-colors"
            >
              <ShoppingBag size={18} />
              Quick Add
            </button>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-1 text-xs text-brand-500 uppercase tracking-widest">
          {product.category}
        </div>

        <Link
          to={`/product/${product.id}`}
          className="hover:text-brand-600 transition-colors"
        >
          <h3 className="font-serif text-lg leading-tight mb-2 truncate">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center gap-2">
          <span className="font-medium text-brand-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>

          {product.originalPrice && (
            <span className="text-sm text-brand-400 line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};