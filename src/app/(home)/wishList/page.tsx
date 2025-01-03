'use client'

import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import { Trash2, Heart } from 'lucide-react'
import { ProductWishList } from '@/components/dashboard/ProductWishList'
import { axiosInstance } from '@/lib/axiosInstance'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

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

interface DecodedToken {
  userId: string
}

interface WishlistResponse {
  product: Product[]
  user: string
  _id: string
  __v: number
}

export default function WishList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wishlistId, setWishlistId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchWishlist = async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      const decodedToken = jwtDecode(token) as DecodedToken
      const userId = decodedToken.userId
      setUserId(userId)

      const response = await axiosInstance.get<WishlistResponse>(`/wishlist/${userId}`)
      if (response.data && response.data.product && Array.isArray(response.data.product)) {
        setProducts(response.data.product)
        setWishlistId(response.data._id)
      } else {
        setError('Invalid response format')
      }
    } catch (err) {
      setError('Error fetching wishlist')
      console.error('Error fetching wishlist:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const removeFromWishlist = async (productId: string) => {
    try {
      if (!wishlistId) {
        setError('Wishlist ID not found')
        return
      }
      // Using the correct endpoint format
      await axiosInstance.delete(`/wishlist/${wishlistId}/product/${productId}`)
      // Update local state to remove the product
      setProducts(products.filter(product => product._id !== productId))
    } catch (err) {
      setError('Error removing product from wishlist')
      console.error('Error removing product from wishlist:', err)
    }
  }

  const deleteEntireWishlist = async () => {
    try {
      if (!userId) {
        setError('User ID not found')
        return
      }
      await axiosInstance.delete(`/wishlist/${userId}`)
      setProducts([])
    } catch (err) {
      setError('Error deleting entire wishlist')
      console.error('Error deleting entire wishlist:', err)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen">Error: {error}</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-gray-900" />
              <h1 className="text-2xl font-bold text-gray-900">Mi Lista de Deseos</h1>
              <span className="text-sm text-gray-600">
                ({products.length} {products.length === 1 ? 'Producto' : 'Productos'})
              </span>
            </div>
            <Button
              variant="destructive"
              onClick={deleteEntireWishlist}
              disabled={products.length === 0}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar toda la lista
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">Tu lista de deseos está vacía.</p>
            </div>
          ) : (
            <ProductWishList 
              data={products} 
              isWishlisted={true} 
              onRemoveFromWishlist={removeFromWishlist}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

