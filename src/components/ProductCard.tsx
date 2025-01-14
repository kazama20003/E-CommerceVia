'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ChevronLeft, ChevronRight, PenToolIcon as Tool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance } from '@/lib/axiosInstance';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import axios from 'axios';

interface Variation {
  color: string;
  size: string;
  price: number;
  sku: string;
  _id: string;
}

interface Product {
  _id: string;
  slug: string;
  name: string;
  images: Array<{
    url: string;
    id: string;
    _id: string;
  }>;
  variations: Variation[];
  offer?: {
    discountPercentage: number;
  };
  brand: string;
  status: string;
  unit: string;
}

interface ProductCardProps {
  data: Product[];
  isWishlisted: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ data, isWishlisted, onToggleWishlist }) => {
  console.log("ProductCard received data:", data);

  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">No hay productos disponibles en este momento.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.map((item) => (
        <ProductItem key={item._id} item={item} isWishlisted={isWishlisted} onToggleWishlist={onToggleWishlist} />
      ))}
    </div>
  );
};

const ProductItem: React.FC<{ item: Product; isWishlisted: boolean; onToggleWishlist?: (productId: string) => void }> = ({ item, isWishlisted, onToggleWishlist }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isItemWishlisted, setIsItemWishlisted] = useState(isWishlisted);
  const [isLoading, setIsLoading] = useState(false);

  const nextImage = () => {
    if (!item.images?.length) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % item.images.length);
  };

  const prevImage = () => {
    if (!item.images?.length) return;
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + item.images.length) % item.images.length);
  };

  const toggleWishlist = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const decodedToken = jwtDecode(token) as { userId: string };
      const userId = decodedToken.userId;

      if (isItemWishlisted) {
        // Remove from wishlist
        await axiosInstance.delete(`/wishlist/${item._id}`);
      } else {
        // Add to wishlist
        await axiosInstance.post('/wishlist', { userId, productIds: [item._id] });
      }
      setIsItemWishlisted(!isItemWishlisted);
      onToggleWishlist?.(item._id);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Status code:', error.response?.status);
      }
      // Mostrar un mensaje de error más específico al usuario
      alert(`Hubo un problema al actualizar la lista de deseos: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, inténtalo de nuevo.`);
    } finally {
      setIsLoading(false);
    }
  };

  const price = item.variations[0]?.price ?? 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105"
    >
      <div className="relative">
        {item.offer && (
          <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {item.offer.discountPercentage}% OFF
          </span>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            if (!isLoading) toggleWishlist();
          }}
          className="absolute top-3 right-3 bg-white p-2 rounded-full z-10 transition-colors duration-200 ease-in-out hover:bg-gray-100"
          aria-label={isItemWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
          disabled={isLoading}
        >
          <AnimatePresence>
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"
              />
            ) : (
              <motion.div
                key="heart"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Heart
                  size={20}
                  className={isItemWishlisted ? 'text-red-500 fill-current' : 'text-gray-300'}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        <Link href={`/products/${item.slug}`}>
          <div className="overflow-hidden relative aspect-square">
            <Image
              src={item.images?.[currentImageIndex]?.url ?? '/placeholder.svg'}
              alt={`${item.name} - Image ${currentImageIndex + 1}`}
              layout="fill"
              objectFit="cover"
              className="transition duration-500 ease-in-out hover:scale-110"
            />
            {(item.images?.length ?? 0) > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.preventDefault(); prevImage(); }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.preventDefault(); nextImage(); }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </motion.button>
              </>
            )}
          </div>
        </Link>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-800 truncate">{item.name}</h2>
          <Tool className="text-gray-500" size={20} />
        </div>
        <div className="mb-2 flex items-center" aria-label={`Calificación: 5 de 5 estrellas`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={`${item._id}-star-${i}`}
              className="w-4 h-4 text-yellow-400 fill-current"
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">s/{typeof price === 'number' ? price.toFixed(2) : price}</span>
          <span className="text-sm text-gray-600">por {item.unit}</span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">{item.variations[0]?.size}</span>
          <span className="text-sm font-medium text-gray-500">{item.variations[0]?.color}</span>
        </div>
      </div>
    </motion.div>
  );
};

