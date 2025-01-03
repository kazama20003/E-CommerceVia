'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { axiosInstance } from '@/lib/axiosInstance'
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

interface ApiResponse {
  status: boolean
  data: Product[]
}

const Offerts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOfferProducts = async () => {
      try {
        const response = await axiosInstance.get<ApiResponse>("/products/offers")
        console.log(response.data)
        
        if (response.data.status && Array.isArray(response.data.data)) {
          setProducts(response.data.data)
        } else {
          setProducts([])
        }
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching offer products:", err)
        setError("Failed to fetch offer products. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchOfferProducts()
  }, [])

  if (isLoading) {
    return <div className="text-center py-12">Loading offer products...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>
  }

  return (
    <>
    <Header></Header>
    <div className='xl:container px-2 xl:px-4 py-12 mx-auto'>
      <div className='flex items-center flex-wrap'>
        <h1 className='text-4xl font-bold mb-2 mr-2'>Productos en Oferta</h1>
        <span className='text-xl relative top-[-5px]'>({products.length} Products Found)</span>
      </div>
      <div className='mt-5'>
        {products.length > 0 ? (
          <ProductCard isWishlisted={false} data={products} />
        ) : (
          <div className="text-center py-12">No offer products available.</div>
        )}
      </div>
    </div>
    <Footer></Footer>
    </>
  )
}

export default Offerts

