import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../data/products';
import { API_URL } from '../api';

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  /*
   * Keep New Arrivals as the only main product-grid section.
   * This avoids repeating the same product layout three times.
   */
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

  return (
    <div className="flex flex-col pb-20">

      {/* =========================================================
          NEW ARRIVALS
      ========================================================== */}

      <section className="container mx-auto px-4 pt-14 md:pt-20">

        <div className="text-center mb-12">

          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-brand-300"></span>

            <p className="text-xs uppercase tracking-[0.35em] text-brand-600">
              Just In
            </p>

            <span className="w-8 h-[1px] bg-brand-300"></span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl text-brand-900 mb-4">
            New Arrivals
          </h1>

          <p className="text-brand-600 max-w-xl mx-auto leading-relaxed">
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

      <section className="container mx-auto px-4 mt-24 md:mt-32">

        <div className="text-center mb-12">

          <p className="text-xs uppercase tracking-[0.35em] text-brand-600 mb-4">
            Discover
          </p>

          <h2 className="font-serif text-4xl md:text-5xl text-brand-900 mb-4">
            The Miraaya Edit
          </h2>

          <p className="text-brand-600 max-w-xl mx-auto">
            Three worlds of style, brought together under one trunk.
          </p>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Sarees */}

          <Link
            to="/sarees"
            className="group relative h-[420px] md:h-[520px] overflow-hidden bg-brand-100"
          >

            {collectionImage(sareeProducts) ? (
              <img
                src={collectionImage(sareeProducts)}
                alt="Miraaya Sarees"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-serif text-4xl text-brand-400">
                  Sarees
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9 text-white">

              <p className="text-xs uppercase tracking-[0.3em] mb-3 opacity-90">
                Timeless
              </p>

              <h3 className="font-serif text-4xl md:text-5xl mb-4">
                Sarees
              </h3>

              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] border-b border-white pb-2">
                Explore Collection
                <ArrowRight size={14} />
              </span>

            </div>

          </Link>


          {/* Dresses */}

          <Link
            to="/dresses"
            className="group relative h-[420px] md:h-[520px] overflow-hidden bg-brand-100"
          >

            {collectionImage(dressProducts) ? (
              <img
                src={collectionImage(dressProducts)}
                alt="Miraaya Dresses"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-serif text-4xl text-brand-400">
                  Dresses
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9 text-white">

              <p className="text-xs uppercase tracking-[0.3em] mb-3 opacity-90">
                Effortless
              </p>

              <h3 className="font-serif text-4xl md:text-5xl mb-4">
                Dresses
              </h3>

              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] border-b border-white pb-2">
                Explore Collection
                <ArrowRight size={14} />
              </span>

            </div>

          </Link>


          {/* Jewellery - full width */}

          <Link
            to="/jewellery"
            className="group relative md:col-span-2 h-[300px] md:h-[360px] overflow-hidden bg-brand-100"
          >

            {collectionImage(jewelleryProducts) ? (
              <img
                src={collectionImage(jewelleryProducts)}
                alt="Miraaya Jewellery"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-serif text-4xl text-brand-400">
                  Jewellery
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>

            <div className="absolute inset-y-0 left-0 flex items-center p-8 md:p-14 text-white">

              <div>

                <p className="text-xs uppercase tracking-[0.3em] mb-3 opacity-90">
                  Little Details
                </p>

                <h3 className="font-serif text-4xl md:text-5xl mb-4">
                  Jewellery
                </h3>

                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] border-b border-white pb-2">
                  Discover More
                  <ArrowRight size={14} />
                </span>

              </div>

            </div>

          </Link>

        </div>

      </section>


      {/* =========================================================
          FEATURED PIECE
      ========================================================== */}

      <section className="mt-24 md:mt-32 bg-brand-50 py-16 md:py-24">

        <div className="container mx-auto px-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center max-w-6xl mx-auto">

            {/* Image */}

            <div className="relative">

              <div className="absolute -top-4 -left-4 w-20 h-20 border-l border-t border-brand-300"></div>

              <div className="absolute -bottom-4 -right-4 w-20 h-20 border-r border-b border-brand-300"></div>

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

              <p className="text-xs uppercase tracking-[0.35em] text-brand-600 mb-5">
                Miraaya Pick
              </p>

              <h2 className="font-serif text-4xl md:text-5xl text-brand-900 leading-tight mb-6">
                A Piece Worth
                <br />
                Keeping
              </h2>

              <div className="w-14 h-[1px] bg-brand-900 mb-6 mx-auto md:mx-0"></div>

              <p className="text-brand-700 leading-relaxed max-w-md mx-auto md:mx-0 mb-8">
                Some pieces simply stay with you. Discover a handpicked
                Miraaya favourite that deserves a place in your wardrobe.
              </p>

              {featuredProduct ? (
                <Link
                  to={`/product/${featuredProduct.id}`}
                  className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] border border-brand-900 px-7 py-3.5 hover:bg-brand-900 hover:text-white transition-all"
                >
                  Discover the Piece
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <Link
                  to="/sarees"
                  className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] border border-brand-900 px-7 py-3.5 hover:bg-brand-900 hover:text-white transition-all"
                >
                  Shop Miraaya
                  <ArrowRight size={15} />
                </Link>
              )}

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          MIRAAYA STORY
      ========================================================== */}

      <section className="mt-24 md:mt-32 bg-brand-100 py-20 md:py-28">

        <div className="container mx-auto px-4">

          <div className="max-w-4xl mx-auto text-center">

            <p className="text-xs uppercase tracking-[0.35em] text-brand-600 mb-5">
              The Miraaya Story
            </p>

            <h2 className="font-serif text-4xl md:text-6xl text-brand-900 leading-tight mb-8">
              More Than A Shop,
              <br />
              A Trunk of Beautiful Collections
            </h2>

            <div className="w-16 h-[1px] bg-brand-900 mx-auto mb-8"></div>

            <p className="text-brand-700 leading-relaxed text-base md:text-lg max-w-2xl mx-auto">
              At Miraaya, we believe that fashion is more than what you wear.
              It is a reflection of who you are, how you feel, and the moments
              you choose to remember.
            </p>

            <p className="text-brand-700 leading-relaxed text-base md:text-lg max-w-2xl mx-auto mt-5">
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