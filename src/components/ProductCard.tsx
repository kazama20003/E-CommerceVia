'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  _id: string;
  slug: string;
  name: string;
  images: Array<{
    url: string;
    id: string;
    _id: string;
  }>;
  buyingPrice: number;
  sellingPrice: number;
  offer?: {
    discountPercentage: number;
  };
  brand: string;
  status: string;
}

interface ProductCardProps {
  data: Product[];
  isWishlisted: boolean;
  onToggleWishlist?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ data, isWishlisted, onToggleWishlist }) => {
  console.log("ProductCard received data:", data);

  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">No hay productos disponibles en este momento.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((item) => (
        <ProductItem key={item._id} item={item} isWishlisted={isWishlisted} onToggleWishlist={onToggleWishlist} />
      ))}
    </div>
  );
};

const ProductItem: React.FC<{ item: Product; isWishlisted: boolean; onToggleWishlist?: () => void }> = ({ item, isWishlisted, onToggleWishlist }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (!item.images?.length) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % item.images.length);
  };

  const prevImage = () => {
    if (!item.images?.length) return;
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + item.images.length) % item.images.length);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-2">
      <div className="relative">
        {item.offer && (
          <span className="absolute top-3 left-3 z-10 bg-blue-900 text-white text-xs font-bold px-2 py-1 rounded-full">
            {item.offer.discountPercentage}% OFF
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist?.();
          }}
          className="absolute top-4 right-4 bg-white p-2 rounded-full z-10 transition-colors duration-200 ease-in-out hover:bg-gray-100"
          aria-label={isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart
            size={20}
            className={isWishlisted ? 'text-red-500' : 'text-gray-300'}
          />
        </button>
        <Link href={`/products/${item.slug}`}>
          <div className="overflow-hidden rounded-md relative">
            <Image
              src={item.images?.[currentImageIndex]?.url ?? '/placeholder.svg'}
              alt={`${item.name} - Image ${currentImageIndex + 1}`}
              width={300}
              height={300}
              className="w-full h-auto transform scale-95 hover:scale-100 transition duration-500 ease-in-out"
            />
            {(item.images?.length ?? 0) > 1 && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); prevImage(); }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/50 rounded-full p-1"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); nextImage(); }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/50 rounded-full p-1"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </Link>
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold">{item.name}</h2>
        <div className="my-2 flex items-center" aria-label={`Calificación: 5 de 5 estrellas`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={`${item._id}-star-${i}`}
              className="w-5 h-5 text-yellow-400 fill-current"
            />
          ))}
        </div>
        <div className="flex items-center">
          <span className="text-2xl font-bold text-black">s/{item.sellingPrice?.toFixed(2) ?? 'N/A'}</span>
          {item.buyingPrice !== item.sellingPrice && (
            <span className="text-red-500 line-through ms-2">s/{item.buyingPrice?.toFixed(2) ?? 'N/A'}</span>
          )}
        </div>
      </div>
    </div>
  );
};

