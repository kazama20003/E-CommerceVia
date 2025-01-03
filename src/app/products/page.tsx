'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import ProductFilter from '@/components/ProductFilter'
import { axiosInstance } from '@/lib/axiosInstance'
import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'

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
  brand: string
  category: string
  subCategory: string[]
  status: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const fetchProducts = useCallback(async (queryParams: URLSearchParams) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get('/products', { params: queryParams })
      if (response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data)
      } else if (response.data && Array.isArray(response.data) && response.data.length === 0) {
        setProducts([])
      } else {
        setError('Formato de datos inválido recibido del servidor.')
      }
    } catch (err) {
      setError('Error al cargar los productos. Por favor, intente nuevamente más tarde.')
      console.error('Error fetching products:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const queryParams = new URLSearchParams(searchParams.toString())
    fetchProducts(queryParams)
  }, [fetchProducts, searchParams])

  const handleFilterChange = (newFilters: any) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)

    const queryParams = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v))
      } else if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString())
      }
    })

    router.push(`/products?${queryParams.toString()}`)
  }

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-4">
          <p>Inicio</p>
          <ChevronRight className="h-4 w-4" />
          <p>Productos</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold">Explorar todos los productos</h1>
          <span className="text-lg sm:text-xl text-muted-foreground">({products.length} Productos Encontrados)</span>
        </div>
        <div className="lg:hidden mb-4">
          <Button onClick={toggleFilter} className="w-full">
            {isFilterOpen ? 'Cerrar Filtros' : 'Abrir Filtros'}
          </Button>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`w-full lg:w-64 flex-none ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <ProductFilter onFilterChange={handleFilterChange} initialFilters={filters} />
          </div>
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-12">Cargando...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No hay productos disponibles en este momento.</div>
            ) : (
              <ProductCard data={products} isWishlisted={false} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

