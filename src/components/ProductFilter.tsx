'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { axiosInstance } from '@/lib/axiosInstance'

interface FilterProps {
  onFilterChange: (filters: any) => void
  initialFilters: any
}

export default function ProductFilter({ onFilterChange, initialFilters }: FilterProps) {
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [brands, setBrands] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialFilters.brand || [])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters.category || [])
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '')
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || '')

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axiosInstance.get('/brands')
        if (response.data && Array.isArray(response.data)) {
          setBrands(response.data.map((brand: any) => brand.name))
        } else {
          console.error('Invalid brand data format:', response.data)
        }
      } catch (error) {
        console.error('Error fetching brands:', error)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/categories')
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data.map((category: any) => category.name))
        } else {
          console.error('Invalid category data format:', response.data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchBrands()
    fetchCategories()
  }, [])

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
    onFilterChange({ minPrice: value[0], maxPrice: value[1] })
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    const updatedBrands = checked
      ? [...selectedBrands, brand]
      : selectedBrands.filter((b) => b !== brand)
    setSelectedBrands(updatedBrands)
    onFilterChange({ brand: updatedBrands })
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter((c) => c !== category)
    setSelectedCategories(updatedCategories)
    onFilterChange({ category: updatedCategories })
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onFilterChange({ search: searchTerm })
  }

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setSortBy(value)
    onFilterChange({ sortBy: value })
  }

  return (
    <div className="space-y-6 bg-white p-4 rounded-lg shadow-md">
      <div>
        <h3 className="text-lg font-semibold mb-2">Buscar</h3>
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow"
          />
          <Button type="submit" className="w-full sm:w-auto">
            Buscar
          </Button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Rango de Precio</h3>
        <Slider
          min={0}
          max={1000}
          step={10}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="w-full"
        />
        <div className="flex justify-between mt-2 text-sm">
          <span>s/{priceRange[0]}</span>
          <span>s/{priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Marcas</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
              />
              <label htmlFor={brand} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Categorías</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
              />
              <label htmlFor={category} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Ordenar Por</h3>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="w-full p-2 border rounded-md text-sm"
        >
          <option value="">Seleccionar...</option>
          <option value="price-low-to-high">Precio: Menor a Mayor</option>
          <option value="price-high-to-low">Precio: Mayor a Menor</option>
          <option value="newest">Más Recientes</option>
        </select>
      </div>
    </div>
  )
}

