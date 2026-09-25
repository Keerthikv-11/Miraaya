import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '../components/Button';
import {
  Heart,
  Minus,
  Plus,
  Truck,
  ArrowLeft,
  Star,
} from 'lucide-react';
import { cn } from '../utils/utils';
import { API_URL } from '../api';

interface BackendProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'Saree' | 'Jewellery' | 'Dress';
  image: string;
  stock: number;
  isAvailable: boolean;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface ReviewResponse {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
}

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ===============================
  // REVIEWS
  // ===============================

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState('');

  // ===============================
  // FETCH PRODUCT
  // ===============================

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `${API_URL}/products/${id}`
        );

        if (!response.ok) {
          throw new Error('Product not found');
        }

        const data: BackendProduct = await response.json();

        const frontendCategory =
          data.category === 'Saree'
            ? 'sarees'
            : data.category === 'Jewellery'
              ? 'jewellery'
              : 'dresses';

        const formattedProduct: Product = {
          id: data._id,
          name: data.name,
          category: frontendCategory,
          subcategory: '',
          description: data.description || '',
          price: data.price,
          images: data.image
            ? [data.image]
            : [
              'https://placehold.co/600x800/efe6d8/624431?text=Miraaya',
            ],
          rating: 0,
          reviewCount: 0,
          stock: data.stock,
          sizes:
            frontendCategory === 'dresses'
              ? ['XS', 'S', 'M', 'L', 'XL']
              : undefined,
          colors: [],
          fabric: '',
          material: '',
          occasion: '',
          featured: false,
          newArrival: false,
          bestseller: false,
        };

        setProduct(formattedProduct);
        setActiveImage(formattedProduct.images[0]);

        if (
          formattedProduct.sizes &&
          formattedProduct.sizes.length > 0
        ) {
          setSelectedSize(formattedProduct.sizes[0]);
        }

        setQuantity(1);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Unable to load this product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  // ===============================
  // FETCH REVIEWS
  // ===============================

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      setReviewsLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/reviews/product/${id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const data: ReviewResponse = await response.json();

        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // ===============================
  // REVIEW SUBMISSION
  // ===============================

  const handleSubmitReview = async () => {
    setReviewMessage('');
    setReviewError('');

    if (!selectedRating) {
      setReviewError('Please select a rating.');
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError('Please write a review.');
      return;
    }

    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      setReviewError('Please login to submit a review.');
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch {
      setReviewError('Please login again to submit a review.');
      return;
    }

    const userId = user.id || user._id;

    if (!userId) {
      setReviewError('Please login again to submit a review.');
      return;
    }

    if (!id) {
      setReviewError('Product information is missing.');
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await fetch(
        `${API_URL}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: id,
            userId,
            rating: selectedRating,
            comment: reviewComment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to submit review'
        );
      }

      setReviews((previousReviews) => [
        data.review,
        ...previousReviews,
      ]);

      setTotalReviews((previousTotal) => previousTotal + 1);

      setSelectedRating(0);
      setReviewComment('');
      setReviewMessage('Your review has been added successfully.');

      // Refresh review summary from backend
      const reviewResponse = await fetch(
        `${API_URL}/reviews/product/${id}`
      );

      if (reviewResponse.ok) {
        const reviewData: ReviewResponse =
          await reviewResponse.json();

        setReviews(reviewData.reviews || []);
        setAverageRating(reviewData.averageRating || 0);
        setTotalReviews(reviewData.totalReviews || 0);
      }
    } catch (err) {
      console.error('Error submitting review:', err);

      setReviewError(
        err instanceof Error
          ? err.message
          : 'Failed to submit review.'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex items-center justify-center">
        <p className="text-xl text-brand-600">
          Loading product...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif mb-4">
          Product Not Found
        </h2>

        <p className="text-brand-600 mb-6">
          {error || 'This product could not be found.'}
        </p>

        <Button
          onClick={() => navigate(-1)}
          variant="outline"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock <= 0) return;

    addToCart(product, quantity, selectedSize);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;

    handleAddToCart();
    navigate('/checkout');
  };

  const categoryPath =
    product.category === 'sarees'
      ? 'sarees'
      : product.category === 'jewellery'
        ? 'jewellery'
        : 'dresses';

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">

      {/* Breadcrumbs */}

      <div className="flex items-center gap-2 text-xs sm:text-sm text-brand-600 mb-6 sm:mb-8 uppercase tracking-wider">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-brand-900 transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <span>/</span>

        <span
          className="cursor-pointer hover:text-brand-900 transition-colors"
          onClick={() => navigate(`/${categoryPath}`)}
        >
          {product.category}
        </span>

        <span>/</span>

        <span className="text-brand-900 font-medium truncate w-32 sm:w-40">
          {product.name}
        </span>

      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16 sm:mb-20">

        {/* Product Images */}

        <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-3 sm:gap-4">

          {/* Thumbnails */}

          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[800px] no-scrollbar">

            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={cn(
                  'flex-shrink-0 w-16 sm:w-20 md:w-24 aspect-[3/4] overflow-hidden rounded-xs border-2 transition-colors',
                  activeImage === img
                    ? 'border-brand-900'
                    : 'border-transparent opacity-70 hover:opacity-100'
                )}
              >
                <img
                  src={img}
                  alt={`${product.name} thumbnail`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}

          </div>

          {/* Main Image */}

          <div className="flex-grow aspect-[3/4] bg-brand-100 rounded-xs overflow-hidden group cursor-zoom-in relative">

            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-150"
              style={{ transformOrigin: 'center center' }}
            />

            {isOutOfStock && (
              <div className="absolute top-3 left-3 bg-black/85 text-white px-2.5 py-1 text-xs font-medium tracking-wider rounded-xs uppercase">
                Out of Stock
              </div>
            )}

          </div>

        </div>

        {/* Product Info */}

        <div className="w-full lg:w-1/2 flex flex-col">

          <div className="mb-1 text-xs text-brand-600 uppercase tracking-widest font-medium">
            {product.category}
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 leading-tight text-brand-900">
            {product.name}
          </h1>

          {/* Price */}

          <div className="flex items-center gap-4 mb-6">

            <div className="flex items-center gap-3">

              <span className="text-2xl font-medium">
                ₹{product.price.toLocaleString('en-IN')}
              </span>

            </div>

            <div className="h-6 w-px bg-brand-200"></div>

            <div className="flex items-center gap-1 text-brand-600 text-sm">

              <Star
                size={16}
                className="fill-brand-900 text-brand-900"
              />

              <span>
                {averageRating > 0
                  ? `${averageRating} (${totalReviews})`
                  : 'No reviews yet'}
              </span>

            </div>

          </div>

          <p className="text-brand-700 leading-relaxed mb-8">
            {product.description}
          </p>

          <hr className="border-brand-100 mb-8" />

          {/* Sizes */}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-8">

              <div className="flex justify-between items-center mb-4">

                <span className="font-medium uppercase tracking-widest text-sm">
                  Size
                </span>

                <button className="text-sm text-brand-600 underline">
                  Size Guide
                </button>

              </div>

              <div className="flex flex-wrap gap-3">

                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'w-12 h-12 flex items-center justify-center border rounded-sm transition-colors text-sm font-medium',
                      selectedSize === size
                        ? 'border-brand-900 bg-brand-900 text-white'
                        : 'border-brand-200 text-brand-900 hover:border-brand-900'
                    )}
                  >
                    {size}
                  </button>
                ))}

              </div>

            </div>
          )}

          {/* Quantity */}

          <div className="mb-8 flex items-center gap-6">

            <span className="font-medium uppercase tracking-widest text-sm">
              Quantity
            </span>

            <div className="flex items-center border border-brand-200 rounded-sm">

              <button
                onClick={() =>
                  setQuantity(Math.max(1, quantity - 1))
                }
                disabled={isOutOfStock}
                className="w-10 h-10 flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-40"
              >
                <Minus size={16} />
              </button>

              <span className="w-12 text-center font-medium">
                {quantity}
              </span>

              <button
                onClick={() =>
                  setQuantity(
                    Math.min(product.stock, quantity + 1)
                  )
                }
                disabled={
                  isOutOfStock ||
                  quantity >= product.stock
                }
                className="w-10 h-10 flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-40"
              >
                <Plus size={16} />
              </button>

            </div>

            <span className="text-sm text-brand-500">
              {isOutOfStock
                ? 'Out of stock'
                : `${product.stock} available`}
            </span>

          </div>

          {/* Actions */}

          <div className="flex flex-col sm:flex-row gap-4 mb-8">

            <Button
              onClick={handleAddToCart}
              variant="outline"
              size="lg"
              disabled={isOutOfStock}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isOutOfStock
                ? 'Out of Stock'
                : 'Add to Cart'}
            </Button>

            <Button
              onClick={handleBuyNow}
              size="lg"
              disabled={isOutOfStock}
              className="flex-1"
            >
              Buy It Now
            </Button>

            <button
              onClick={() => toggleWishlist(product)}
              className="w-14 h-[56px] border border-brand-200 flex items-center justify-center rounded-sm hover:border-brand-900 transition-colors"
            >
              <Heart
                size={20}
                className={cn(
                  isInWishlist(product.id) &&
                  'fill-brand-900 text-brand-900'
                )}
              />
            </button>

          </div>

          {/* Highlights */}

          <div className="bg-brand-50 p-6 rounded-sm mb-8 space-y-4 text-sm text-brand-800">

            <div className="flex items-start gap-3">

              <Truck
                size={20}
                className="text-brand-900 shrink-0"
              />

              <div>

                <p className="font-medium text-brand-900 mb-1">
                  Free Shipping & Returns
                </p>

                <p>
                  Free standard shipping on orders over ₹2000.
                  15-day return policy.
                </p>

              </div>

            </div>

          </div>

          {/* Product Details */}

          <div className="space-y-4">

            <div className="border-t border-brand-100 pt-4">

              <h4 className="font-serif text-lg mb-2">
                Product Details
              </h4>

              <ul className="list-disc pl-5 text-sm text-brand-700 space-y-2">

                <li>Premium quality product</li>

                <li>Carefully selected for Miraaya</li>

                <li>Dry clean only recommended</li>

                <li>
                  Availability:{' '}
                  {isOutOfStock
                    ? 'Out of Stock'
                    : 'In Stock'}
                </li>

              </ul>

            </div>

          </div>

        </div>

      </div>

      {/* ========================================
          REVIEWS & RATINGS
      ======================================== */}

      <section className="border-t border-brand-100 pt-12 pb-20">

        <div className="mb-10">

          <h2 className="font-serif text-3xl md:text-4xl text-brand-900 mb-2">
            Reviews & Ratings
          </h2>

          <p className="text-brand-600">
            See what customers have to say about this product.
          </p>

        </div>

        {/* Rating Summary */}

        <div className="bg-brand-50 p-6 md:p-8 rounded-sm mb-10">

          <div className="flex flex-col md:flex-row md:items-center gap-6">

            <div className="text-center md:text-left">

              <div className="flex items-center justify-center md:justify-start gap-2">

                <span className="font-serif text-4xl text-brand-900">
                  {averageRating > 0
                    ? averageRating.toFixed(1)
                    : '0.0'}
                </span>

                <Star
                  size={28}
                  className="fill-brand-900 text-brand-900"
                />

              </div>

              <p className="text-sm text-brand-600 mt-1">
                Based on {totalReviews}{' '}
                {totalReviews === 1
                  ? 'review'
                  : 'reviews'}
              </p>

            </div>

            <div className="hidden md:block h-16 w-px bg-brand-200"></div>

            <div>

              <p className="text-sm text-brand-700">
                Customer ratings help other shoppers make
                informed decisions.
              </p>

            </div>

          </div>

        </div>

        {/* Write Review */}

        <div className="border border-brand-100 p-6 md:p-8 rounded-sm mb-12">

          <h3 className="font-serif text-2xl text-brand-900 mb-6">
            Write a Review
          </h3>

          <div className="mb-6">

            <p className="text-sm font-medium text-brand-800 mb-3">
              Your Rating
            </p>

            <div className="flex items-center gap-2">

              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    setSelectedRating(rating)
                  }
                  className="transition-transform hover:scale-110"
                  aria-label={`Rate ${rating} stars`}
                >
                  <Star
                    size={28}
                    className={
                      rating <= selectedRating
                        ? 'fill-brand-900 text-brand-900'
                        : 'text-brand-300'
                    }
                  />
                </button>
              ))}

            </div>

          </div>

          <div className="mb-6">

            <label
              htmlFor="review-comment"
              className="block text-sm font-medium text-brand-800 mb-3"
            >
              Your Review
            </label>

            <textarea
              id="review-comment"
              value={reviewComment}
              onChange={(event) =>
                setReviewComment(event.target.value)
              }
              placeholder="Share your experience with this product..."
              rows={5}
              maxLength={1000}
              className="w-full border border-brand-200 rounded-sm px-4 py-3 text-brand-900 placeholder:text-brand-400 focus:outline-none focus:border-brand-900 resize-none"
            />

            <p className="text-xs text-brand-500 mt-2 text-right">
              {reviewComment.length}/1000
            </p>

          </div>

          {reviewError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-sm">
              {reviewError}
            </div>
          )}

          {reviewMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-sm">
              {reviewMessage}
            </div>
          )}

          <Button
            onClick={handleSubmitReview}
            disabled={submittingReview}
          >
            {submittingReview
              ? 'Submitting...'
              : 'Submit Review'}
          </Button>

        </div>

        {/* Reviews List */}

        <div>

          <h3 className="font-serif text-2xl text-brand-900 mb-6">
            Customer Reviews
          </h3>

          {reviewsLoading ? (
            <div className="py-10 text-center">

              <p className="text-brand-600">
                Loading reviews...
              </p>

            </div>
          ) : reviews.length === 0 ? (
            <div className="border border-brand-100 border-dashed p-10 text-center">

              <Star
                size={40}
                className="mx-auto mb-4 text-brand-300"
              />

              <h4 className="font-serif text-xl text-brand-900 mb-2">
                No reviews yet
              </h4>

              <p className="text-brand-600 text-sm">
                Be the first customer to review this product.
              </p>

            </div>
          ) : (
            <div className="space-y-6">

              {reviews.map((review) => (

                <div
                  key={review._id}
                  className="border-b border-brand-100 pb-6"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">

                    <div>

                      <p className="font-medium text-brand-900">
                        {review.user?.name || 'Customer'}
                      </p>

                      <div className="flex items-center gap-1 mt-1">

                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={15}
                            className={
                              star <= review.rating
                                ? 'fill-brand-900 text-brand-900'
                                : 'text-brand-300'
                            }
                          />
                        ))}

                      </div>

                    </div>

                    <p className="text-xs text-brand-500">
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString('en-IN')}
                    </p>

                  </div>

                  <p className="text-brand-700 leading-relaxed">
                    {review.comment}
                  </p>

                </div>

              ))}

            </div>
          )}

        </div>

      </section>

    </div>
  );
};