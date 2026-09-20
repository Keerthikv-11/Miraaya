export type Product = {
  id: string;
  name: string;
  category: 'sarees' | 'jewellery' | 'dresses';
  subcategory: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  sizes?: string[];
  colors?: string[];
  fabric?: string;
  material?: string;
  occasion?: string;
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
};

const placeholderImage = (category: string, index: number, color1 = 'efe6d8', color2 = '624431') => 
  `https://placehold.co/600x800/${color1}/${color2}?text=${category}+${index}`;

export const products: Product[] = [
  // SAREES (12 items)
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `saree-${i + 1}`,
    name: ['Banarasi Silk Saree', 'Mysore Silk Saree', 'Organza Handloom Saree', 'Cotton Block Print', 'Designer Georgette Saree', 'Chanderi Silk Saree', 'Linen Minimal Saree', 'Printed Floral Saree', 'Kanjeevaram Saree', 'Tussar Silk Saree', 'Chiffon Party Saree', 'Bandhani Silk Saree'][i],
    category: 'sarees' as const,
    subcategory: ['Silk', 'Silk', 'Organza', 'Cotton', 'Designer', 'Silk', 'Linen', 'Printed', 'Silk', 'Silk', 'Designer', 'Printed'][i],
    description: 'An elegant creation crafted with premium fabric, perfect for festive occasions and celebrations. Features intricate detailing and a rich border.',
    price: [12999, 15500, 8999, 3500, 25000, 6500, 4500, 5200, 22000, 11500, 9500, 8500][i],
    originalPrice: i % 3 === 0 ? [14999, 18500, 10999, 4500, 28000, 8500, 5500, 7200, 25000, 13500, 11500, 10500][i] : undefined,
    discount: i % 3 === 0 ? 15 : undefined,
    images: [
      placeholderImage('Saree', i+1, 'efe6d8', '624431'),
      placeholderImage('Detail', i+1, 'e5d3bd', '624431')
    ],
    rating: 4.5 + (i % 5) * 0.1,
    reviewCount: 20 + i * 5,
    stock: 15,
    colors: ['Red', 'Gold', 'Pink', 'Green', 'Blue'],
    fabric: ['Silk', 'Silk', 'Organza', 'Cotton', 'Georgette', 'Silk', 'Linen', 'Crepe', 'Silk', 'Silk', 'Chiffon', 'Silk'][i],
    occasion: 'Festive, Wedding, Party',
    featured: i < 3,
    newArrival: i % 4 === 0,
    bestseller: i === 1 || i === 5,
  })),

  // JEWELLERY (12 items)
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `jewel-${i + 1}`,
    name: ['Kundan Choker Set', 'Polki Drop Earrings', 'Gold Plated Temple Chain', 'Pearl Embedded Bangles', 'Diamond Finish Bracelet', 'Emerald Statement Ring', 'Bridal Jewellery Set', 'Antique Silver Jhumkas', 'Navratna Necklace', 'Meenakari Chandbalis', 'Minimalist Gold Chain', 'Ruby Stud Earrings'][i],
    category: 'jewellery' as const,
    subcategory: ['Necklaces', 'Earrings', 'Chains', 'Bangles', 'Bracelets', 'Rings', 'Jewellery Sets', 'Earrings', 'Necklaces', 'Earrings', 'Chains', 'Earrings'][i],
    description: 'Exquisitely handcrafted jewellery that adds a touch of royal elegance to any outfit. Made with hypoallergenic premium materials.',
    price: [15999, 4500, 8500, 5200, 3500, 2500, 45000, 1800, 25500, 6500, 12500, 8900][i],
    originalPrice: i % 2 === 0 ? [18999, 5500, 9500, 6200, 4500, 3500, 50000, 2800, 28500, 8500, 14500, 10900][i] : undefined,
    discount: i % 2 === 0 ? 10 : undefined,
    images: [
      placeholderImage('Jewel', i+1, 'f7f2ea', '946345'),
      placeholderImage('CloseUp', i+1, 'fdfbf7', '946345')
    ],
    rating: 4.6 + (i % 4) * 0.1,
    reviewCount: 40 + i * 12,
    stock: 25,
    material: ['Gold Plated', 'Silver', 'Brass', 'Kundan', 'Polki', 'Diamond'][i % 6],
    colors: ['Gold', 'Silver', 'Rose Gold'],
    occasion: 'Wedding, Party, Everyday',
    featured: i === 0 || i === 6,
    newArrival: i % 3 === 0,
    bestseller: i === 1 || i === 3,
  })),

  // DRESSES (12 items)
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `dress-${i + 1}`,
    name: ['Embroidered Anarkali', 'Floral Maxi Dress', 'Chikankari Kurti Set', 'Silk Evening Gown', 'Cotton A-line Dress', 'Designer Party Wear', 'Georgette Sharara Set', 'Linen Casual Midi', 'Indo-Western Dress', 'Velvet Winter Suit', 'Satin Slip Dress', 'Block Print Tiered Dress'][i],
    category: 'dresses' as const,
    subcategory: ['Ethnic', 'Maxi', 'Kurti Dresses', 'Party Wear', 'Casual', 'Designer', 'Ethnic', 'Casual', 'Indo-Western', 'Party Wear', 'Party Wear', 'Casual'][i],
    description: 'A beautiful blend of modern silhouette and traditional aesthetics. Comfortable fit with premium stitching.',
    price: [8500, 3200, 4500, 12500, 2500, 15000, 9500, 3800, 7500, 11000, 4500, 3400][i],
    images: [
      placeholderImage('Dress', i+1, 'e5d3bd', '7a523a'),
      placeholderImage('Back', i+1, 'efe6d8', '7a523a')
    ],
    rating: 4.4 + (i % 5) * 0.1,
    reviewCount: 15 + i * 8,
    stock: 30,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Blush', 'Navy', 'Emerald', 'Mustard', 'Maroon'],
    fabric: ['Cotton', 'Silk', 'Georgette', 'Linen', 'Velvet'][i % 5],
    occasion: 'Casual, Party, Festive',
    featured: i === 0 || i === 3,
    newArrival: i > 8,
    bestseller: i === 2 || i === 4,
  })),
];

export const getProductsByCategory = (category: string) => products.filter(p => p.category === category);
export const getProductById = (id: string) => products.find(p => p.id === id);
export const getFeaturedProducts = () => products.filter(p => p.featured);
export const getNewArrivals = () => products.filter(p => p.newArrival);
export const getTrendingProducts = () => products.filter(p => p.bestseller);
