export interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  badge?: string;
  description: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Apple iPhone 13",
    price: 219999,
    rating: 5,
    reviews: 556,
    image: "/images/iphone13.png",
    category: "Electronics",
    badge: "New",
    description:
      "iPhone 13 is the latest model with A15 Bionic chip, 6.1-inch Super Retina XDR display, dual-camera system with 12MP ultra-wide and wide cameras, and up to 912GB storage.",
  },
  {
    id: 2,
    name: "Noise ColorFit Pro",
    price: 9999,
    rating: 4,
    reviews: 3989,
    image: "/images/smartwatch.png",
    category: "Electronics",
    description:
      "Noise ColorFit Pro smartwatch with 1.55-inch HD display, SpO2, heart rate monitoring, and up to 10 days battery life.",
  },
  {
    id: 3,
    name: "Sony 4K TV",
    price: 104999,
    rating: 4,
    reviews: 1245,
    image: "/images/tv.png",
    category: "Electronics",
    description:
      "Sony 4K Ultra HD Smart LED TV with HDR, Dolby Vision, built-in Google TV, and immersive sound.",
  },
  {
    id: 4,
    name: "JBL Headphones",
    price: 14499,
    rating: 4,
    reviews: 1343,
    image: "/images/headphones.png",
    category: "Electronics",
    description:
      "JBL wireless over-ear headphones with Active Noise Cancelling, 30-hour battery life, and JBL Pure Bass sound.",
  },
];

export const categories = [
  { name: "All", icon: "LayoutGrid" as const },
  { name: "Clothing", icon: "Shirt" as const },
  { name: "Electronics", icon: "Smartphone" as const },
  { name: "Beauty", icon: "Sparkles" as const },
  { name: "Groceries", icon: "ShoppingBasket" as const },
];

export function formatPrice(price: number): string {
  return `PKR ${price.toLocaleString()}`;
}
