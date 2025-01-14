'use client'

import { useState } from "react"
import {Truck, Star, Video, PenToolIcon as Tool, Package, Ruler } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductTabsProps {
  description: string;
  videos?: Array<{
    provider: string;
    link: string;
    _id: string;
  }>;
  shippingReturn?: {
    shippingType: string;
    shippingCost: number;
    isProductQuantityMultiply: boolean;
    shippingAndReturnPolicy: string;
  };
}

export const ProductTabs = ({ description, videos, shippingReturn }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>("Details")
  
  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
  }

  const tabs = [
    { name: "Details", icon: <Tool className="w-5 h-5" /> },
    { name: "Videos", icon: <Video className="w-5 h-5" /> },
    { name: "Review", icon: <Star className="w-5 h-5" /> },
    { name: "Shipping & return", icon: <Truck className="w-5 h-5" /> },
  ]

  return (
    <div className="border border-gray-200 rounded-lg shadow-lg bg-white">
      <div className="flex tabs-container mb-4 p-4 overflow-x-auto flex-nowrap border-b border-gray-200">
        {tabs.map((tab) => (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              ${activeTab === tab.name ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
              tab px-4 py-2 rounded-full mr-2 cursor-pointer whitespace-nowrap flex items-center space-x-2 transition-colors duration-200 ease-in-out
            `}
            key={tab.name}
            onClick={() => handleTabClick(tab.name)}
            aria-selected={activeTab === tab.name}
            role="tab"
          >
            {tab.icon}
            <span className="font-medium">{tab.name}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="tab-content p-6"
        >
          {activeTab === "Details" && (
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800 flex items-center">
                <Tool className="mr-2 text-orange-500" />
                Detalles del producto
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{description}</p>
            </div>
          )}
          {activeTab === "Videos" && (
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800 flex items-center">
                <Video className="mr-2 text-orange-500" />
                Videos del producto
              </h2>
              {videos && videos.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {videos.map((video) => {
                    const videoId = video.link.split('v=')[1]?.split('&')[0];
                    
                    return (
                      <div key={video._id} className="aspect-video rounded-lg overflow-hidden shadow-md">
                        {video.provider.toLowerCase() === 'youtube' && videoId && (
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Product video"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 italic">No hay videos disponibles para este producto.</p>
              )}
            </div>
          )}
          {activeTab === "Review" && (
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800 flex items-center">
                <Star className="mr-2 text-orange-500" />
                Calificaciones del producto
              </h2>
              <p className="text-gray-600 italic">No hay reseñas disponibles para este producto.</p>
            </div>
          )}
          {activeTab === "Shipping & return" && (
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800 flex items-center">
                <Truck className="mr-2 text-orange-500" />
                Envío y devoluciones
              </h2>
              {shippingReturn ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <Package className="text-orange-500 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">Tipo de envío:</h3>
                      <p className="text-gray-600">{shippingReturn.shippingType}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <Ruler className="text-orange-500 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">Costo de envío:</h3>
                      <p className="text-gray-600">S/ {shippingReturn.shippingCost.toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">Políticas de envío y devolución:</h3>
                    <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg leading-relaxed">
                      {shippingReturn.shippingAndReturnPolicy}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 italic">Información de envío no disponible.</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

