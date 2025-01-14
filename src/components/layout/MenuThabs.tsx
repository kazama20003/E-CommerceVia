'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { axiosInstance } from '@/lib/axiosInstance'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import Image from 'next/image'

type SubCategory = {
  _id: string
  name: string
  description: string
}

type Category = {
  _id: string
  name: string
  description: string
  image: {
    url: string
    id: string
  }
  status: string
  subCategory: SubCategory[]
}

interface MenuTabsProps {
  isMobile?: boolean
}

export default function MenuTabs({ isMobile = false }: MenuTabsProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<string>('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories")
        const categoriesData = response.data
        setCategories(categoriesData)
        if (categoriesData.length > 0) {
          setActiveTab(categoriesData[0]._id)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  const TabButton = ({ category }: { category: Category }) => (
    <button
      onClick={() => setActiveTab(category._id)}
      className={cn(
        'text-sm md:text-base font-medium transition-colors duration-200 px-3 py-2 rounded-md',
        activeTab === category._id
          ? 'bg-orange-500 text-white'
          : 'text-gray-600 hover:bg-orange-100 hover:text-orange-600'
      )}
    >
      {category.name}
    </button>
  )

  const SubCategoryList = ({ items, categoryName }: { items: SubCategory[], categoryName: string }) => (
    <ul className={cn(
      "space-y-1",
      isMobile && "pl-3"
    )}>
      {items.map((item) => (
        <li key={item._id}>
          <Link
            href={`/products?category=${encodeURIComponent(categoryName)}&subCategory=${encodeURIComponent(item.name)}`}
            className={cn(
              "group flex items-center text-sm transition-colors duration-200",
              isMobile 
                ? "px-3 py-2 -ml-3 rounded-md hover:bg-orange-100 hover:text-orange-600 text-muted-foreground" 
                : "text-gray-600 hover:text-orange-500"
            )}
          >
            <ChevronRight className={cn(
              "w-4 h-4 mr-2",
              isMobile 
                ? "text-muted-foreground group-hover:text-orange-600" 
                : "text-orange-500"
            )} />
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  )

  const renderDesktopContent = () => {
    const activeCategory = categories.find(cat => cat._id === activeTab)
    if (!activeCategory) return null

    return (
      <div className="flex flex-col lg:flex-row justify-between py-6 w-full">
        <div className="w-full lg:w-1/2 mb-6 lg:mb-0 lg:pr-6">
          <div className="relative h-64 md:h-80 lg:h-96 w-full rounded-lg overflow-hidden shadow-lg">
            <Image
              src={activeCategory.image.url}
              alt={activeCategory.name}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between space-y-6 md:space-y-0 md:space-x-8 w-full lg:w-1/2">
          <div className="w-full md:w-1/2 mb-4 md:mb-0">
            <h2 className="font-bold mb-4 text-xl text-gray-800">Subcategorías</h2>
            <SubCategoryList items={activeCategory.subCategory} categoryName={activeCategory.name} />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="font-bold mb-4 text-xl text-gray-800">Descripción</h2>
            <p className="text-sm text-gray-600">{activeCategory.description}</p>
          </div>
        </div>
      </div>
    )
  }

  const renderMobileContent = () => (
    <Accordion 
      type="single" 
      collapsible 
      className="w-full space-y-2 rounded-lg overflow-hidden"
    >
      {categories.map((category) => (
        <AccordionItem 
          value={category._id} 
          key={category._id} 
          className="border-b border-gray-200 last:border-b-0"
        >
          <AccordionTrigger className="hover:no-underline py-3 px-4 text-sm font-medium rounded-md hover:bg-orange-100 hover:text-orange-600 transition-colors data-[state=open]:bg-orange-100 data-[state=open]:text-orange-600">
            {category.name}
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-1 px-4">
            <SubCategoryList 
              items={category.subCategory} 
              categoryName={category.name} 
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )

  return (
    <div className={cn(
      "w-full bg-white",
      isMobile ? "px-0" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    )}>
      {isMobile ? (
        renderMobileContent()
      ) : (
        <>
          <nav className="flex flex-wrap justify-center gap-2 py-4 mb-6 border-b border-gray-200 overflow-x-auto">
            {categories.map((category) => (
              <TabButton key={category._id} category={category} />
            ))}
          </nav>
          {renderDesktopContent()}
        </>
      )}
    </div>
  )
}

