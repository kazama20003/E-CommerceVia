'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { axiosInstance } from '@/lib/axiosInstance'
import Image from 'next/image'

type Category = {
  _id: string
  name: string
  image: {
    url: string
  }
}

const CategoryCard = ({ category }: { category: Category }) => (
  <motion.div 
    className="flex flex-col items-center justify-center w-full h-56 bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
    whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
    whileTap={{ scale: 0.95 }}
    layout
  >
    <motion.div 
      className="w-full h-36 overflow-hidden"
      whileHover={{ scale: 1.1 }}
    >
      <Image 
        src={category.image.url || "/placeholder.svg"} 
        alt={category.name} 
        width={192}
        height={144}
        className="w-full h-full object-cover"
      />
    </motion.div>
    <div className="p-4 text-center">
      <h3 className="text-lg font-semibold text-gray-800 truncate">{category.name}</h3>
    </div>
  </motion.div>
)

const MovingRow = ({ categories }: { categories: Category[] }) => {
  const controls = useAnimation()
  const row = useRef<HTMLDivElement>(null)
  const inView = useInView(row)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2)
      } else if (window.innerWidth < 1280) {
        setItemsPerPage(3)
      } else {
        setItemsPerPage(4)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 })
    }
  }, [controls, inView])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + itemsPerPage >= categories.length) ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex === 0) ? Math.max(categories.length - itemsPerPage, 0) : prevIndex - 1
    )
  }

  return (
    <div className="relative w-full overflow-hidden py-4" ref={row}>
      <motion.div 
        className="flex"
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <AnimatePresence initial={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {categories.slice(currentIndex, currentIndex + itemsPerPage).map((category) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </motion.div>
      <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center transform -translate-y-1/2 px-4">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/80 hover:bg-white rounded-full shadow-md z-10"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Anterior</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/80 hover:bg-white rounded-full shadow-md z-10"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Siguiente</span>
        </Button>
      </div>
    </div>
  )
}

export default function CategoryCarousel() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await axiosInstance.get('/categories')
        console.log(response, "categories");
        
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data.map((category: { _id: string; name: string; image: { url: string } }) => ({
            _id: category._id,
            name: category.name,
            image: { url: category.image.url }
          })))
        } else {
          console.error('Unexpected response format:', response.data)
          setError('Unexpected data format received from server.')
        }
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to fetch categories. Please try again later.')
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Nuestras Categorías</h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg text-gray-600">Cargando categorías...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Nuestras Categorías</h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg text-red-500">{error}</p>
          </motion.div>
        </div>
      </div>
    )
  }

  const activeCategories = categories
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl font-bold text-center mb-8 text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Nuestras Categorías
        </motion.h2>
        {activeCategories.length > 0 ? (
          <MovingRow categories={activeCategories} />
        ) : (
          <motion.p 
            className="text-center text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No se encontraron categorías activas.
          </motion.p>
        )}
      </div>
    </div>
  )
}

