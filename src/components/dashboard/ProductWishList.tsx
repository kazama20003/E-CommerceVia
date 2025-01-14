'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface Product {
  _id: string
  slug: string
  name: string
  images: Array<{
    url: string
    id: string
    _id: string
  }>
  buyingPrice: number
  sellingPrice: number
  offer?: {
    discountPercentage: number
  }
}

interface ProductCardProps {
  data: Product[]
  isWishlisted: boolean
  onRemoveFromWishlist?: (productId: string) => void
}

export const ProductWishList: React.FC<ProductCardProps> = ({ data, isWishlisted, onRemoveFromWishlist }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">No hay productos disponibles en este momento.</div>
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {data.map((item) => (
        <ProductItem 
          key={item._id} 
          item={item} 
          isWishlisted={isWishlisted} 
          onRemoveFromWishlist={() => onRemoveFromWishlist?.(item._id)}
        />
      ))}
    </div>
  )
}

const ProductItem: React.FC<{ 
  item: Product
  isWishlisted: boolean
  onRemoveFromWishlist?: () => void 
}> = ({ item, onRemoveFromWishlist }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!item.images?.length) return
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % item.images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!item.images?.length) return
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + item.images.length) % item.images.length)
  }

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onRemoveFromWishlist?.()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <Link href={`/products/${item.slug}`} className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="relative w-full sm:w-48 h-48">
          {item.offer && (
            <span className="absolute top-2 left-2 z-10 bg-blue-900 text-white text-xs font-bold px-2 py-1 rounded-full">
              {item.offer.discountPercentage}% OFF
            </span>
          )}
          <button
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 z-10 bg-white p-1.5 rounded-full shadow-sm border transition-colors duration-200 hover:bg-gray-50"
            aria-label="Quitar de favoritos"
          >
            <Heart
              size={18}
              className="fill-red-500 stroke-red-500"
            />
          </button>
          <div className="relative w-full h-full overflow-hidden rounded-lg">
            <Image
              src={item.images?.[currentImageIndex]?.url ?? '/placeholder.svg'}
              alt={item.name}
              fill
              className="object-cover"
            />
            {(item.images?.length ?? 0) > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 transition-colors duration-200"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 transition-colors duration-200"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-900">{item.name}</h2>
          <div className="flex items-center gap-0.5 my-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className="fill-yellow-400 stroke-yellow-400"
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">s/{item.sellingPrice.toFixed(2)}</span>
            {item.buyingPrice > item.sellingPrice && (
              <span className="text-sm text-red-500 line-through">
                s/{item.buyingPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

