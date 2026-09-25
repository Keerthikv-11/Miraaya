
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
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5">
          {isOutOfStock ? (
            <span className="bg-black/85 text-white text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-xs uppercase tracking-wider font-medium">
              Out of Stock
            </span>
          ) : product.stock <= 5 ? (
            <span className="bg-white/90 backdrop-blur-sm text-brand-900 text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-xs uppercase tracking-wider font-medium">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Wishlist */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all duration-300 md:translate-x-2 md:group-hover:translate-x-0">
          <button
            onClick={() => toggleWishlist(product)}
            className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-brand-900 transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart
              size={17}
              className={cn(
                isInWishlist(product.id) && 'fill-brand-900 text-brand-900'
              )}
            />
          </button>
        </div>

        {/* Add to Cart - Desktop Hover / Mobile Touch */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 w-full p-2 sm:p-3 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={() => addToCart(product)}
              className="w-full py-2 sm:py-2.5 bg-white/95 backdrop-blur-sm text-brand-900 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 rounded-xs shadow-md hover:bg-brand-900 hover:text-white transition-colors"
            >
              <ShoppingBag size={15} />
              Quick Add
            </button>
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col flex-grow">
        <div className="mb-0.5 text-[10px] sm:text-xs text-brand-500 uppercase tracking-widest font-medium">
          {product.category}
        </div>

        <Link
          to={`/product/${product.id}`}
          className="hover:text-brand-600 transition-colors"
        >
          <h3 className="font-serif text-xs sm:text-sm md:text-base font-medium leading-snug mb-1.5 truncate">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center gap-2">
          <span className="font-semibold text-xs sm:text-sm text-brand-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>

          {product.originalPrice && (
            <span className="text-[11px] sm:text-xs text-brand-400 line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};