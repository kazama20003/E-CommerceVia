'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { axiosInstance } from '@/lib/axiosInstance'
import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface Variation {
  color: string;
  size: string;
  price: number;
  sku: string;
  _id: string;
}

interface Product {
  _id: string
  slug: string
  name: string
  images: Array<{
    url: string
    id: string
    _id: string
  }>
  variations: Variation[]
  offer?: {
    discountPercentage: number
  }
  brand: string
  status: string
  unit: string
}

interface ApiResponse {
  status: boolean
  data: Array<{
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
  }>
  message?: string
}

const Offerts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchOfferProducts = async () => {
      try {
        const response = await axiosInstance.get<ApiResponse>("/products/offers")
        console.log('offers', response.data)
        
        if (response.data.status && Array.isArray(response.data.data) && response.data.data.length > 0) {
          const mappedProducts: Product[] = response.data.data.map(item => ({
            ...item,
            variations: [{
              color: 'default',
              size: 'default',
              price: item.sellingPrice,
              sku: 'default-sku',
              _id: item._id
            }],
            brand: 'default brand',
            status: 'active',
            unit: 'piece'
          }))
          setProducts(mappedProducts)
        } else {
          setProducts([])
          setMessage(response.data.message || "No hay productos en oferta en este momento.")
        }
      } catch (err) {
        console.error("Error fetching offer products:", err)
        setProducts([])
        setMessage("No hay productos en oferta disponibles en este momento.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOfferProducts()
  }, [])

  if (isLoading) {
    return <div className="text-center py-12">Cargando productos en oferta...</div>
  }

  return (
    <>
    <Header />
    <div className='xl:container px-2 xl:px-4 py-12 mx-auto'>
      <div className='flex items-center flex-wrap'>
        <h1 className='text-4xl font-bold mb-2 mr-2'>Productos en Oferta</h1>
        <span className='text-xl relative top-[-5px]'>({products.length} Productos Encontrados)</span>
      </div>
      <div className='mt-5'>
        {products.length > 0 ? (
          <ProductCard isWishlisted={false} data={products} />
        ) : (
          <div className="text-center py-12 text-lg text-gray-600">
            {message || "No hay productos en oferta disponibles en este momento."}
          </div>
        )}
      </div>
    </div>
    <Footer />
    </>
  )
}

export default Offerts

