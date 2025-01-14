'use client'

import { useEffect, useState } from 'react';
import Carousel from "@/components/home/Carousel";
import CategoryCarousel from "@/components/home/CategoryCarousel";
import PromotionCards from "@/components/home/PromotionCards";
import { ProductCard } from "@/components/ProductCard";
import PopularBrands from "@/components/home/PopularBrands";
import { BaggageClaim } from 'lucide-react';
import { axiosInstance } from "@/lib/axiosInstance";

interface Variation {
  color: string;
  size: string;
  price: number;
  sku: string;
  _id: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  images: Array<{
    url: string;
    id: string;
    _id: string;
  }>;
  buyingPrice: number;
  sellingPrice: number;
  offer?: {
    discountPercentage: number;
  };
  variations: Variation[]; // Ahora usamos el tipo 'Variation' para el array
  brand: string;
  status: string;
  unit: string;
}

export default function Home() {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const [flashSalesResponse, latestProductsResponse] = await Promise.all([
        axiosInstance.get("/products/flash-sales"),
        axiosInstance.get("/products")
      ]);

      if (flashSalesResponse.data?.status && Array.isArray(flashSalesResponse.data?.data)) {
        setFlashSaleProducts(flashSalesResponse.data.data);
      }

      if (latestProductsResponse.data?.status && Array.isArray(latestProductsResponse.data?.data)) {
        setLatestProducts(latestProductsResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Error al cargar los productos");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const services = [
    {
      icon: <BaggageClaim size={30} className="text-center text-[#f23e14]"/>,
      title: "Servicio Profesional",
      description: "Eficiencia en el soporte para tu compra"
    },
    {
      icon: <BaggageClaim size={30} className="text-center text-[#f23e14]"/>,
      title: "Pago Seguro",
      description: "Diferentes métodos de pago"
    },
    {
      icon: <BaggageClaim size={30} className="text-center text-[#f23e14]"/>,
      title: "Delivery Rápido",
      description: "Hacemos el envío lo más pronto posible"
    },
    {
      icon: <BaggageClaim size={30} className="text-center text-[#f23e14]"/>,
      title: "Calidad y garantía",
      description: "Productos de alta calidad con garantía"
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="mb-8 m-0">
      <Carousel/>
      <CategoryCarousel/>
      <PromotionCards/>
      <div className="xl:container px-4 xl:px-4 mt-10 mx-auto">
        <h2 className="text-4xl font-bold mb-4">Colección de productos</h2>
        <ProductCard 
          isWishlisted={isWishlisted} 
          data={latestProducts} 
          onToggleWishlist={toggleWishlist} 
        />
      </div>
      <div className="xl:container px-2 xl:px-4 mt-10 mx-auto">
        <h2 className="text-4xl font-bold mb-4">Ventas flash</h2>
        <ProductCard 
          isWishlisted={isWishlisted} 
          data={flashSaleProducts} 
          onToggleWishlist={toggleWishlist} 
        />
      </div>
      <PopularBrands/>
      <div className="mx-auto xl:container px-2 xl:px-4 mt-10 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
          {services.map((item, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

