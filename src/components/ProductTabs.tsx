'use client'

import { useState } from "react"
import { Circle, Truck, Star, Video } from 'lucide-react';

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

  return (
    <div className="border rounded-b-3xl rounded-t-3xl">
      <div className="flex tabs-container mb-4 p-4 overflow-x-auto flex-nowrap">
        {[
          { name: "Details", icon: <Circle /> },
          { name: "Videos", icon: <Video /> },
          { name: "Review", icon: <Star /> },
          { name: "Shipping & return", icon: <Truck /> },
        ].map((tab) => (
          <div
            className={`${
              activeTab === tab.name ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            } tab px-4 py-2 border rounded-3xl mr-2 cursor-pointer whitespace-nowrap flex items-center space-x-2`}
            key={tab.name}
            onClick={() => handleTabClick(tab.name)}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </div>
        ))}
      </div>
      <div className="tab-content border p-6 rounded-b-3xl">
        {activeTab === "Details" && (
          <div>
            <h2 className="text-3xl font-bold mb-4">Detalles del producto</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
          </div>
        )}
        {activeTab === "Videos" && (
          <div>
            <h2 className="text-3xl font-bold mb-4">Videos del producto</h2>
            {videos && videos.length > 0 ? (
              <div className="grid gap-4">
                {videos.map((video) => {
                  // Extract video ID from YouTube URL
                  const videoId = video.link.split('v=')[1]?.split('&')[0];
                  
                  return (
                    <div key={video._id} className="aspect-video">
                      {video.provider.toLowerCase() === 'youtube' && videoId && (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          className="w-full h-full rounded-lg"
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
              <p>No hay videos disponibles para este producto.</p>
            )}
          </div>
        )}
        {activeTab === "Review" && (
          <div>
            <h2 className="text-3xl font-bold mb-4">Calificaciones del producto</h2>
            <p>No hay reseñas disponibles para este producto.</p>
          </div>
        )}
        {activeTab === "Shipping & return" && (
          <div>
            <h2 className="text-3xl font-bold mb-4">Envío y devoluciones</h2>
            {shippingReturn ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Tipo de envío:</h3>
                  <p>{shippingReturn.shippingType}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Costo de envío:</h3>
                  <p>S/ {shippingReturn.shippingCost.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Políticas de envío y devolución:</h3>
                  <p className="whitespace-pre-wrap">{shippingReturn.shippingAndReturnPolicy}</p>
                </div>
              </div>
            ) : (
              <p>Información de envío no disponible.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

