import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../data/products';
import { API_URL } from '../api';

interface HomeBanner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
}

const defaultBanners: HomeBanner[] = [
  {
    _id: 'default-1',
    title: 'Elegance Redefined',
    subtitle: 'Handcrafted Sarees & Statement Jewellery for Every Celebration',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600',
    link: '/sarees',
  },
  {
    _id: 'default-2',
    title: 'Royal Statement Jewellery',
    subtitle: 'Discover Exquisite Kundan & Gold Plated Necklaces',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1600',
    link: '/jewellery',
  },
  {
    _id: 'default-3',
    title: 'Effortless Modern Dresses',
    subtitle: 'Graceful Fusion Outfits & Contemporary Ethnic Wear',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1600',
    link: '/dresses',
  },
];

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<HomeBanner[]>(defaultBanners);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_URL}/banners`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setBanners(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch home banners:', err);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();

        const formattedProducts: Product[] = data.map((product: any) => ({
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
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Failed to load home products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const newArrivals = products.slice(0, 4);

  const sareeProducts = products.filter(
    (product) => product.category === 'sarees'
  );

  const dressProducts = products.filter(
    (product) => product.category === 'dresses'
  );

  const jewelleryProducts = products.filter(
    (product) => product.category === 'jewellery'
  );

  const featuredProduct = products[0];

  const collectionImage = (items: Product[]) =>
    items.length > 0 && items[0].images.length > 0
      ? items[0].images[0]
      : '';

  const activeBanner = banners[currentSlide] || banners[0];

  return (
    <div className="flex flex-col pb-20">

      {/* =========================================================
          HERO BILLBOARD / ADVERTISEMENT BANNER
      ========================================================== */}
      <section className="relative w-full overflow-hidden bg-brand-900 text-white min-h-[300px] sm:min-h-[420px] md:min-h-[540px] flex items-center">
        {/* Banner Background Image */}
        <div className="absolute inset-0 z-0">
          {banners.map((banner, idx) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'} transition-transform duration-10000 ease-out`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Banner Content */}
        <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10 py-8 sm:py-14">
          <div className="max-w-xl sm:max-w-2xl animate-in fade-in slide-in-from-left duration-500 key={activeBanner._id}">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-brand-200 mb-2 sm:mb-4">
              <Sparkles size={12} className="text-amber-300" /> Featured Advertisement
            </div>
            
            <h1 className="font-serif text-xl sm:text-3xl md:text-5xl font-light text-white leading-tight mb-2 sm:mb-3 drop-shadow-md">
              {activeBanner.title}
            </h1>

            {activeBanner.subtitle && (
              <p className="text-brand-100 text-[11px] sm:text-sm md:text-base font-light leading-relaxed mb-4 sm:mb-6 max-w-md drop-shadow line-clamp-2">
                {activeBanner.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={activeBanner.link || '/sarees'}
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-7 sm:py-3.5 bg-white text-brand-900 hover:bg-brand-100 text-[10px] sm:text-xs uppercase tracking-wider font-semibold rounded-xs shadow-md transition-all transform hover:-translate-y-0.5"
              >
                Explore Collection
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Prev/Next Controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all"
              title="Previous Banner"
            >
              <ChevronLeft size={16} className="sm:w-[20px] sm:h-[20px]" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all"
              title="Next Banner"
            >
              <ChevronRight size={16} className="sm:w-[20px] sm:h-[20px]" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 sm:h-1.5 rounded-full transition-all ${idx === currentSlide ? 'w-5 sm:w-7 bg-white' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* =========================================================
          NEW ARRIVALS
      ========================================================== */}

      <section className="container mx-auto px-3 sm:px-6 pt-10 sm:pt-16 md:pt-20">

        <div className="text-center mb-8 sm:mb-12">

          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <span className="w-6 sm:w-8 h-[1px] bg-brand-300"></span>

            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-brand-600 font-medium">
              Just In
            </p>

            <span className="w-6 sm:w-8 h-[1px] bg-brand-300"></span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-brand-900 mb-3">
            New Arrivals
          </h2>

          <p className="text-brand-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            A fresh collection of pieces chosen to bring something new
            to your wardrobe.
          </p>

        </div>

        {loading ? (
          <div className="text-center py-16 text-brand-600">
            Loading our latest pieces...
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="text-center py-16 bg-brand-50 border border-brand-100 border-dashed rounded-sm">

            <Sparkles
              size={28}
              className="mx-auto mb-4 text-brand-500"
            />

            <h3 className="font-serif text-2xl mb-2">
              Something beautiful is coming
            </h3>

            <p className="text-brand-600">
              Our latest collections will appear here once products are added.
            </p>

          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <Link
                to="/sarees"
                className="group flex items-center gap-3 text-xs uppercase tracking-[0.2em] border border-brand-900 px-7 py-3.5 rounded-sm hover:bg-brand-900 hover:text-white transition-all"
              >
                Explore New Pieces

                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </>
        )}

      </section>


      {/* =========================================================
          MIRAAYA EDIT
      ========================================================== */}

      <section className="container mx-auto px-3 sm:px-6 mt-16 sm:mt-24 md:mt-32">

        <div className="text-center mb-8 sm:mb-12">

          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-brand-600 mb-2 sm:mb-4 font-medium">
            Discover
          </p>

          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-brand-900 mb-3">
            The Miraaya Edit
          </h2>

          <p className="text-brand-600 text-xs sm:text-sm max-w-xl mx-auto">
            Three worlds of style, brought together under one trunk.
          </p>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

          {/* Sarees */}

          <Link
            to="/sarees"
            className="group relative h-[220px] sm:h-[340px] md:h-[480px] overflow-hidden bg-brand-100 rounded-xs"
          >

            {collectionImage(sareeProducts) ? (
              <img
                src={collectionImage(sareeProducts)}
                alt="Miraaya Sarees"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-serif text-xl sm:text-3xl text-brand-400">
                  Sarees
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">

              <p className="text-[9px] sm:text-xs uppercase tracking-[0.2em] mb-1 opacity-90 font-medium">
                Timeless
              </p>

              <h3 className="font-serif text-xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">
                Sarees
              </h3>

              <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-xs uppercase tracking-[0.15em] border-b border-white pb-1 font-medium">
                Explore Collection
                <ArrowRight size={12} />
              </span>

            </div>

          </Link>


          {/* Dresses */}

          <Link
            to="/dresses"
            className="group relative h-[220px] sm:h-[340px] md:h-[480px] overflow-hidden bg-brand-100 rounded-xs"
          >

            {collectionImage(dressProducts) ? (
              <img
                src={collectionImage(dressProducts)}
                alt="Miraaya Dresses"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-serif text-xl sm:text-3xl text-brand-400">
                  Dresses
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">

              <p className="text-[9px] sm:text-xs uppercase tracking-[0.2em] mb-1 opacity-90 font-medium">
                Effortless
              </p>

              <h3 className="font-serif text-xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">
                Dresses
              </h3>

              <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-xs uppercase tracking-[0.15em] border-b border-white pb-1 font-medium">
                Explore Collection
                <ArrowRight size={12} />
              </span>

            </div>

          </Link>


          {/* Jewellery - full width */}

          <Link
            to="/jewellery"
            className="group relative md:col-span-2 h-[170px] sm:h-[240px] md:h-[320px] overflow-hidden bg-brand-100 rounded-xs"
          >

            {collectionImage(jewelleryProducts) ? (
              <img
                src={collectionImage(jewelleryProducts)}
                alt="Miraaya Jewellery"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-serif text-xl sm:text-3xl text-brand-400">
                  Jewellery
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent"></div>

            <div className="absolute inset-y-0 left-0 flex items-center p-5 sm:p-8 md:p-12 text-white">

              <div>

                <p className="text-[9px] sm:text-xs uppercase tracking-[0.2em] mb-1 opacity-90 font-medium">
                  Little Details
                </p>

                <h3 className="font-serif text-xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">
                  Jewellery
                </h3>

                <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-xs uppercase tracking-[0.15em] border-b border-white pb-1 font-medium">
                  Discover More
                  <ArrowRight size={12} />
                </span>

              </div>

            </div>

          </Link>

        </div>

      </section>


      {/* =========================================================
          FEATURED PIECE
      ========================================================== */}

      <section className="mt-16 sm:mt-24 md:mt-32 bg-brand-50 py-12 sm:py-16 md:py-24">

        <div className="container mx-auto px-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center max-w-6xl mx-auto">

            {/* Image */}

            <div className="relative">

              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-16 h-16 sm:w-20 sm:h-20 border-l border-t border-brand-300"></div>

              <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-16 h-16 sm:w-20 sm:h-20 border-r border-b border-brand-300"></div>

              <div className="aspect-[4/5] bg-brand-100 overflow-hidden">

                {featuredProduct?.images?.[0] ? (
                  <img
                    src={featuredProduct.images[0]}
                    alt={featuredProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-400">
                    <Sparkles size={35} />
                  </div>
                )}

              </div>

            </div>


            {/* Content */}

            <div className="text-center md:text-left">

              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-brand-600 mb-3 sm:mb-5 font-medium">
                Miraaya Pick
              </p>

              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-brand-900 leading-tight mb-4 sm:mb-6">
                A Piece Worth
                <br />
                Keeping
              </h2>

              <div className="w-12 sm:w-14 h-[1px] bg-brand-900 mb-4 sm:mb-6 mx-auto md:mx-0"></div>

              <p className="text-brand-700 text-xs sm:text-sm leading-relaxed max-w-md mx-auto md:mx-0 mb-6 sm:mb-8">
                Some pieces simply stay with you. Discover a handpicked
                Miraaya favourite that deserves a place in your wardrobe.
              </p>

              {featuredProduct ? (
                <Link
                  to={`/product/${featuredProduct.id}`}
                  className="inline-flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs uppercase tracking-[0.2em] border border-brand-900 px-5 py-3 sm:px-7 sm:py-3.5 hover:bg-brand-900 hover:text-white transition-all"
                >
                  Discover the Piece
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  to="/sarees"
                  className="inline-flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs uppercase tracking-[0.2em] border border-brand-900 px-5 py-3 sm:px-7 sm:py-3.5 hover:bg-brand-900 hover:text-white transition-all"
                >
                  Shop Miraaya
                  <ArrowRight size={14} />
                </Link>
              )}

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          MIRAAYA STORY
      ========================================================== */}

      <section className="mt-16 sm:mt-24 md:mt-32 bg-brand-100 py-14 sm:py-20 md:py-28">

        <div className="container mx-auto px-4">

          <div className="max-w-4xl mx-auto text-center">

            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-brand-600 mb-3 sm:mb-5 font-medium">
              The Miraaya Story
            </p>

            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-brand-900 leading-tight mb-6 sm:mb-8">
              More Than A Shop,
              <br />
              A Trunk of Beautiful Collections
            </h2>

            <div className="w-12 sm:w-16 h-[1px] bg-brand-900 mx-auto mb-6 sm:mb-8"></div>

            <p className="text-brand-700 leading-relaxed text-xs sm:text-base md:text-lg max-w-2xl mx-auto">
              At Miraaya, we believe that fashion is more than what you wear.
              It is a reflection of who you are, how you feel, and the moments
              you choose to remember.
            </p>

            <p className="text-brand-700 leading-relaxed text-xs sm:text-base md:text-lg max-w-2xl mx-auto mt-4 sm:mt-5">
              From elegant sarees and graceful dresses to beautiful jewellery,
              every piece is thoughtfully chosen with love — timeless,
              effortless, and truly yours.
            </p>

            <div className="mt-9">

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};