'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star, ShoppingCart, Heart, Truck, ArrowLeft, ArrowRight, PenToolIcon as Tool, Package, Shield } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { ProductTabs } from '@/components/ProductTabs';
import { axiosInstance } from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Variation {
  color: string;
  size: string;
  price: number;
  sku: string;
  _id: string;
}

interface ProductImage {
  url: string;
  id: string;
  _id: string;
}

interface RelatedProduct {
  _id: string;
  slug: string;
  name: string;
  images: Array<{
    url: string;
    id: string;
    _id: string;
  }>;
  variations: Variation[];
  offer?: {
    discountPercentage: number;
  };
  brand: string;
  status: string;
  unit: string;
}

interface ProductDetail {
  _id: string;
  name: string;
  description: string;
  sellingPrice: number;
  images: ProductImage[];
  colors?: string[];
  sizes?: string[];
  rating?: number;
  relatedProducts?: RelatedProduct[];
  videos?: Array<{ provider: string; link: string; _id: string }>;
  shippingReturn?: {
    shippingType: string;
    shippingCost: number;
    isProductQuantityMultiply: boolean;
    shippingAndReturnPolicy: string;
  };
  variations: Variation[];
  slug: string;
  category?: {
    _id: string;
    name: string;
  };
}

interface DecodedToken {
  userId: string;
  role: string;
}

const ProductDetail = () => {
  const params = useParams();
  const { toast } = useToast()
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [formErrors, setFormErrors] = useState({
    color: '',
    size: ''
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/products/${params.slug}/byslug`);
        console.log(response);
        
        if (response.data?.status && response.data?.data) {
          const productData = response.data.data as ProductDetail;
          setProduct(productData);
          if (productData.images?.[0]?.url) {
            setSelectedImage(productData.images[0].url);
          }
          if (productData.variations?.[0]) {
            setSelectedColor(productData.variations[0].color);
            setSelectedSize('');
          }

          // Fetch related products based on the category
          if (productData.category?._id) {
            const relatedResponse = await axiosInstance.get(`/products?category=${productData.category._id}&limit=4`);
            if (relatedResponse.data?.data) {
              setRelatedProducts(relatedResponse.data.data.filter((p: RelatedProduct) => p._id !== productData._id));
            }
          }
        }
      } catch (err) {
        setError('Error al cargar el producto');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const handleDecrease = () => {
    setQuantity(prevQuantity => prevQuantity > 1 ? prevQuantity - 1 : 1);
  };

  const handleIncrease = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const getUniqueColors = (variations: Variation[]) => {
    return [...new Set(variations.map(v => v.color))];
  };

  const getUniqueSizes = (variations: Variation[], selectedColor: string) => {
    return [...new Set(variations
      .filter(v => v.color === selectedColor)
      .map(v => v.size))];
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setSelectedSize('');
    setFormErrors({...formErrors, color: ''});
  };

  const getSelectedVariationPrice = () => {
    const selectedVariation = product?.variations.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
    return selectedVariation ? selectedVariation.price : product?.sellingPrice;
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { color: '', size: '' };

    if (!selectedColor) {
      errors.color = 'Por favor, selecciona un color';
      isValid = false;
    }

    if (!selectedSize) {
      errors.size = 'Por favor, selecciona un tamaño';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const addToWishlist = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Por favor, inicia sesión para agregar productos a tu lista de deseos",
        });
        return;
      }

      const decodedToken = jwtDecode(token) as DecodedToken;
      const userId = decodedToken.userId;

      const wishlistData = {
        userId: userId,
        productIds: [product?._id]
      };

      const response = await axiosInstance.post("/wishlist", wishlistData);

      if (response.data.product) {
        toast({
          title: "Éxito",
          description: "Producto agregado a la lista de deseos",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo agregar el producto a la lista de deseos",
        });
      }
    } catch (error) {
      console.error("Error al agregar el producto a la lista de deseos:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al agregar a la lista de deseos",
      });
    }
  };

  const addToCart = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Por favor, inicia sesión para agregar productos al carrito",
        });
        return;
      }

      if (!validateForm()) {
        return;
      }

      const decodedToken = jwtDecode(token) as DecodedToken;
      const userId = decodedToken.userId;

      const selectedVariation = product?.variations.find(
        v => v.color === selectedColor && v.size === selectedSize
      );

      if (!selectedVariation) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "La combinación seleccionada no está disponible",
        });
        return;
      }

      const cartData = {
        userId: userId,
        items: [
          {
            productId: product?._id,
            variationId: selectedVariation._id,
            quantity: quantity
          }
        ]
      };

      const response = await axiosInstance.post("/cart", cartData);
      console.log('post cart',response);
      
      if (response.data && response.status === 200) {
        toast({
          title: "Éxito",
          description: "Producto agregado al carrito exitosamente",
        });
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (error) {
      console.error("Error al agregar el producto al carrito:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al agregar el producto al carrito. Por favor, inténtalo de nuevo.",
      });
    }
  };

  const shareOnWhatsApp = () => {
    if (!product) return;

    const selectedVariation = product.variations.find(
      v => v.color === selectedColor && v.size === selectedSize
    );

    const message = `
¡Hola! Estoy interesado en comprar el siguiente producto:

*${product.name}*
Precio: S/${getSelectedVariationPrice()?.toFixed(2)}
Color: ${selectedColor || 'No seleccionado'}
Tamaño: ${selectedSize || 'No seleccionado'}
Cantidad: ${quantity}
SKU: ${selectedVariation?.sku || 'N/A'}

Descripción breve: ${product.description.substring(0, 100)}...

¿Podrías proporcionarme más información sobre la disponibilidad y el proceso de compra?
    `.trim();

    const url = `https://api.whatsapp.com/send?phone=YOUR_PHONE_NUMBER&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  if (error || !product) {
    return <div className="flex justify-center items-center min-h-screen">Error: {error || 'Producto no encontrado'}</div>;
  }

  const uniqueColors = getUniqueColors(product.variations);
  const uniqueSizes = getUniqueSizes(product.variations, selectedColor);

  return (
    <>
      <Header/>
      <div className='xl:container mx-auto px-4 py-8'>
        <nav aria-label="Breadcrumb" className='text-sm flex items-center text-gray-500 mb-6'>
          <Link href='/' className="hover:text-orange-600 transition-colors">Inicio</Link><ChevronRight size={16} />
          <Link href='/products' className="hover:text-orange-600 transition-colors">Productos</Link><ChevronRight size={16} />
          <span aria-current="page" className="font-medium">{product.name}</span>
        </nav>

        <div className='grid md:grid-cols-2 gap-8 lg:gap-12'>
          <div className='space-y-4'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-100 p-4 rounded-lg"
            >
              <Image 
                src={selectedImage} 
                alt={`Image of ${product.name}`} 
                width={600} 
                height={600} 
                className='w-full h-auto object-contain rounded-lg shadow-lg'
              />
            </motion.div>
            <div className='grid grid-cols-5 gap-2'>
              {product.images.map((img, index) => (
                <motion.button 
                  key={img._id} 
                  onClick={() => setSelectedImage(img.url)} 
                  className='focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-md overflow-hidden bg-gray-100'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image 
                    src={img.url} 
                    alt={`${product.name} - View ${index + 1}`} 
                    width={100} 
                    height={100} 
                    className='w-full h-auto object-contain hover:opacity-75 transition-opacity'
                  />
                </motion.button>
              ))}
            </div>
          </div>

          <div className='space-y-6'>
            <h1 className='text-4xl font-bold text-gray-800'>{product.name}</h1>
            <div className='flex items-center justify-between'>
              <p className='text-3xl font-semibold text-orange-600'>S/{getSelectedVariationPrice()?.toFixed(2)}</p>
              <div className='flex items-center' aria-label={`Product rating: ${product.rating || 0} out of 5 stars`}>
                {[...Array(5)].map((_, index) => (
                  <Star 
                    key={index} 
                    className={`w-5 h-5 ${index < (product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400 fill-gray-200'}`}
                  />
                ))}
                <span className='ml-2 text-gray-600 font-medium'>({product.rating || 0}/5)</span>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className='text-lg font-semibold mb-2 flex items-center'><Tool className="mr-2" /> Especificaciones:</h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h4 className='font-medium'>Color:</h4>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {uniqueColors.map((color) => (
                      <motion.button 
                        key={color} 
                        onClick={() => handleColorChange(color)}
                        className={`px-3 py-1 rounded-full text-sm ${selectedColor === color ? 'bg-orange-500 text-white' : 'bg-white text-gray-800 border border-gray-300'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {color}
                      </motion.button>
                    ))}
                  </div>
                  {formErrors.color && <p className="text-red-500 text-sm mt-1">{formErrors.color}</p>}
                </div>
                {selectedColor && (
                  <div>
                    <h4 className='font-medium'>Tamaño:</h4>
                    <div className='flex flex-wrap gap-2 mt-1'>
                      {uniqueSizes.map((size) => (
                        <motion.button 
                          key={size} 
                          onClick={() => {
                            setSelectedSize(size);
                            setFormErrors({...formErrors, size: ''});
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${selectedSize === size ? 'bg-orange-500 text-white' : 'bg-white text-gray-800 border border-gray-300'}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {size}
                        </motion.button>
                      ))}
                    </div>
                    {formErrors.size && <p className="text-red-500 text-sm mt-1">{formErrors.size}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className='text-lg font-semibold mb-2 flex items-center'><Package className="mr-2" /> Cantidad:</h3>
              <div className='flex items-center space-x-2'>
                <motion.button 
                  onClick={handleDecrease} 
                  className='bg-white hover:bg-gray-200 text-gray-800 w-10 h-10 flex items-center justify-center rounded-full border border-gray-300'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={16} />
                </motion.button>
                <input 
                  type="number" 
                  value={quantity} 
                  readOnly 
                  className='w-16 text-center border rounded-full py-2' 
                  aria-label='Product quantity'
                />
                <motion.button 
                  onClick={handleIncrease} 
                  className='bg-white hover:bg-gray-200 text-gray-800 w-10 h-10 flex items-center justify-center rounded-full border border-gray-300'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4'>
              <motion.button 
                onClick={addToCart} 
                className='flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-full flex items-center justify-center'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className='mr-2' />
                Agregar al Carrito
              </motion.button>
              <motion.button 
                onClick={addToWishlist}
                className='flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-full flex items-center justify-center'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className='mr-2' />
                Favoritos
              </motion.button>
              <motion.button 
                onClick={shareOnWhatsApp}
                className='flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-full flex items-center justify-center'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                WhatsApp
              </motion.button>
            </div>

            <div className='bg-gray-100 p-4 rounded-lg flex items-center mt-4'>
              <Truck className='text-orange-500 mr-3' />
              <p className='text-sm'>Envío gratis en pedidos superiores a S/100</p>
            </div>

            <div className='bg-gray-100 p-4 rounded-lg flex items-center'>
              <Shield className='text-orange-500 mr-3' />
              <p className='text-sm'>Garantía de calidad en todas nuestras herramientas</p>
            </div>
          </div>
        </div>

        <div className='mt-12'>
          <ProductTabs 
            description={product.description}
            videos={product.videos}
            shippingReturn={product.shippingReturn}
          />
        </div>

        {relatedProducts.length > 0 && (
          <div className='mt-16'>
            <h2 className='text-3xl font-bold mb-6 flex items-center'>
              <Tool className="mr-2 text-orange-500" />
              Productos Relacionados
            </h2>
            <ProductCard data={relatedProducts} isWishlisted={false} />
          </div>
        )}
        <Toaster />
      </div>
      <Footer/>
    </>
  );
};

export default ProductDetail;

