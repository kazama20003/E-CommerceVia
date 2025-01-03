'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ImageIcon, Info, Layers, Gift, Video, Truck, Search } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { axiosInstance } from '@/lib/axiosInstance'
import axios from 'axios'
import { InformationTab } from '@/components/dashboard/products/InformationTab'
import { ImagesTab } from '@/components/dashboard/products/ImagesTab'
import { VariationTab } from '@/components/dashboard/products/VariationTab'
import { OfferTab } from '@/components/dashboard/products/OfferTab'
import { VideoTab } from '@/components/dashboard/products/VideoTab'
import ShippingPage from '@/components/dashboard/products/ShippingTab'
import { SEOTab } from '@/components/dashboard/products/SEOTab'

interface SEOImage {
  url: string;
  id: string;
}

interface Variation {
  _id: string;
  color: string;
  size: string;
  price: number;
  sku: string;
}

interface Product {
  _id: string
  name: string
  sku: string
  category: string
  barcode: string
  buyingPrice: number
  sellingPrice: number
  tax: string
  brand: string
  status: string
  canPurchasable: boolean
  showStockOut: boolean
  refundable: boolean
  maximunPurchaseQuantity: number
  lowStockQuantityWarning: number
  unit: string
  weight: string
  tags: string
  description: string
  images: {
    _id: string;
    url: string;
    id: string;
  }[]
  offer?: {
    startDate: string;
    endDate: string;
    discountPercentage: number;
    flashSale: boolean;
    _id: string;
  };
  shippingReturn?: {
    shippingType: "Free" | "Flat Rate"
    shippingCost: number
    isProductQuantityMultiply: boolean
    shippingAndReturnPolicy: string
    _id: string
  };
  seo?: {
    title: string;
    description: string;
    keywords: string;
    image: {
      url: string;
      id: string;
    };
  };
  videos: {
    _id: string;
    provider: string;
    link: string;
  }[];
  variations: Variation[];
}

export default function ProductPage() {
  const params = useParams()
  const productId = params.slug as string
  
  const [product, setProduct] = useState<Product | null>({
    _id: '',
    name: '',
    sku: '',
    category: '',
    barcode: '',
    buyingPrice: 0,
    sellingPrice: 0,
    tax: '',
    brand: '',
    status: '',
    canPurchasable: false,
    showStockOut: false,
    refundable: false,
    maximunPurchaseQuantity: 0,
    lowStockQuantityWarning: 0,
    unit: '',
    weight: '',
    tags: '',
    description: '',
    images: [],
    videos: [],
    variations: [],
    seo: {
      title: '',
      description: '',
      keywords: '',
      image: {
        url: '',
        id: ''
      }
    },
  } as Product)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("information")

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', productId)
        const response = await axiosInstance.get(`/products/${productId}`)
        console.log('API Response:', response)
        
        if (response.status === 200) {
          const productData = response.data.data;
          setProduct({
            ...productData,
            images: productData.images || [],
            videos: productData.videos || [],
            variations: productData.variations || [],
          });
        } else {
          setError(`Failed to fetch product data. Status: ${response.status}`)
        }
      } catch (err) {
        console.error('Error details:', err);
        if (err instanceof Error) {
          if (axios.isAxiosError(err)) {
            if (err.response) {
              setError(`Server error: ${err.response.status}`);
            } else if (err.request) {
              setError('No response received from server');
            } else {
              setError(`An error occurred: ${err.message}`);
            }
          } else {
            setError(`An error occurred: ${err.message}`);
          }
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    } else {
      setError('No product ID provided')
      setIsLoading(false)
    }
  }, [productId])

  const mainTabs = [
    { id: "information", title: "Information", icon: Info, component: InformationTab },
    { id: "images", title: "Images", icon: ImageIcon, component: ImagesTab },
    { id: "variation", title: "Variation", icon: Layers, component: VariationTab },
    { id: "offer", title: "Offer", icon: Gift, component: OfferTab },
    { id: "video", title: "Video", icon: Video, component: VideoTab },
    { id: "shipping", title: "Shipping & Return", icon: Truck, component: ShippingPage },
    { id: "seo", title: "SEO", icon: Search, component: SEOTab }
  ]

  const renderContent = () => {
    if (!product) return null;
    const ActiveTabComponent = mainTabs.find(tab => tab.id === activeTab)?.component;
    return ActiveTabComponent ? <ActiveTabComponent product={product} /> : null;
  }

  if (isLoading) return <div className="container mx-auto px-4 py-6">Loading...</div>
  if (error) return <div className="container mx-auto px-4 py-6">Error: {error}</div>
  if (!product) return <div className="container mx-auto px-4 py-6">No product found</div>

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-2 sm:px-4 md:px-6 py-4">
        <div className="mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="flex">
              {mainTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center justify-center flex-1 gap-1.5 px-2 py-3 transition-colors whitespace-nowrap text-xs sm:text-sm border-b-2",
                      activeTab === tab.id
                        ? "bg-white text-red-500 font-medium border-red-500"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-transparent"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.title}</span>
                    <span className="sm:hidden">{tab.title.charAt(0)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm min-h-[calc(100vh-12rem)] overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

