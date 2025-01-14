'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, useAnimation, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import Image from 'next/image'
import { axiosInstance } from '@/lib/axiosInstance'

type Brand = {
  name: string
  description: string
  image: {
    url: string
    id: string
  }
}

const BrandCard = ({ brand }: { brand: Brand }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div 
      className="flex flex-col items-center justify-center w-40 h-40 mx-2 bg-white rounded-lg shadow-md flex-shrink-0 relative overflow-hidden"
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Image src={brand.image.url || "/placeholder.svg"} alt={brand.name} width={96} height={96} className="object-contain mb-2" />
      <motion.div 
        className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2"
        initial={{ y: '100%' }}
        animate={{ y: isHovered ? 0 : '100%' }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-center text-sm font-semibold">{brand.name}</h3>
      </motion.div>
    </motion.div>
  )
}

const AnimatedCarousel = ({ brands }: { brands: Brand[] }) => {
  const carouselRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const x = useMotionValue(0)
  const [width, setWidth] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  const updateWidth = useCallback(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth)
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => {
      setIsMounted(false)
      window.removeEventListener('resize', updateWidth)
    }
  }, [updateWidth])

  useEffect(() => {
    updateWidth()
  }, [brands, updateWidth])

  useEffect(() => {
    if (!isMounted || width === 0) return

    let animationFrame: number

    const animateCarousel = () => {
      x.set(0)
      controls.start({
        x: -width,
        transition: { duration: 40, ease: "linear", repeat: Infinity, repeatType: "loop" }
      })
    }

    const startAnimation = () => {
      if (isMounted && width > 0) {
        animationFrame = requestAnimationFrame(animateCarousel)
      }
    }

    const timeoutId = setTimeout(startAnimation, 0)

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(animationFrame)
      controls.stop()
    }
  }, [controls, width, isMounted, x])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      controls.start({
        x: 0,
        transition: { duration: 0.5, ease: "easeOut" }
      })
    } else if (info.offset.x < -100) {
      controls.start({
        x: -width,
        transition: { duration: 0.5, ease: "easeOut" }
      })
    }
  }

  const opacity = useTransform(
    x,
    [-width, 0, width],
    [0.5, 1, 0.5]
  )

  return (
    <div ref={carouselRef} className="overflow-hidden cursor-grab active:cursor-grabbing">
      <motion.div
        className="flex"
        drag="x"
        dragConstraints={{ right: 0, left: -width }}
        animate={controls}
        style={{ x, opacity }}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: "grabbing" }}
      >
        {[...brands, ...brands].map((brand, index) => (
          <BrandCard key={`${brand.name}-${index}`} brand={brand} />
        ))}
      </motion.div>
    </div>
  )
}

export default function PopularBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true)
        const response = await axiosInstance.get('/brands')
        setBrands(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching brands:', error)
        setError('Failed to fetch brands. Please try again later.')
        setIsLoading(false)
      }
    }

    fetchBrands()
  }, [])

  if (isLoading) {
    return (
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Marcas Populares</h2>
          <p>Cargando marcas...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Marcas Populares</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Marcas Populares</h2>
        {brands.length > 0 ? (
          <AnimatedCarousel brands={brands} />
        ) : (
          <p className="text-center">No se encontraron marcas.</p>
        )}
      </div>
    </section>
  )
}

