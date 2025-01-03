'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star, ShoppingCart, Heart, Truck, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface ProductDetail {
  _id: string;
  name: string;
  description: string;
  sellingPrice: number;
  images: Array<{
    url: string;
    id: string;
    _id: string;
  }>;
  colors?: string[];
  sizes?: string[];
  rating?: number;
  relatedProducts?: any[];
  videos?: any[];
  shippingReturn?: any;
  variations: Variation[];
  slug: string;
  category?: {
    _id: string;
  }
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
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/products/${params.slug}/byslug`);
        console.log(response);
        
        if (response.data?.status && response.data?.data) {
          const productData = response.data.data;
          setProduct(productData);
          if (productData.images?.[0]?.url) {
            setSelectedImage(productData.images[0].url);
          }
          if (productData.variations?.[0]) {
            setSelectedColor(productData.variations[0].color);
            setSelectedSize('');
          }

          // Fetch additional product data using the slug
          const slugResponse = await axiosInstance.get(`/products?slug=${productData.slug}`);
          console.log('Slug response:', slugResponse);

          if (slugResponse.data?.data?.[0]) {
            const slugData = slugResponse.data.data[0];
            
            // Fetch related products based on the category
            if (slugData.category?._id) {
              const relatedResponse = await axiosInstance.get(`/products?category=${slugData.category._id}&limit=4`);
              if (relatedResponse.data?.data) {
                setRelatedProducts(relatedResponse.data.data.filter((p: any) => p._id !== productData._id));
              }
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
  };

  const getSelectedVariationPrice = () => {
    const selectedVariation = product?.variations.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
    return selectedVariation ? selectedVariation.price : product?.sellingPrice;
  };

  const addToWishlist = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please log in to add items to your wishlist",
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
          title: "Success",
          description: "Product added to wishlist",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add product to wishlist",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while adding to wishlist",
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
          description: "Please log in to add items to your cart",
        });
        return;
      }

      if (!selectedColor || !selectedSize) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select both color and size",
        });
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
          description: "Selected combination is not available",
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
          title: "Success",
          description: "Product added to cart successfully",
        });
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while adding the product to the cart. Please try again.",
      });
    }
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
          <Link href='/' className="hover:text-blue-600 transition-colors">Home</Link><ChevronRight size={16} />
          <Link href='/products' className="hover:text-blue-600 transition-colors">Products</Link><ChevronRight size={16} />
          <span aria-current="page" className="font-medium">{product.name}</span>
        </nav>

        <div className='grid md:grid-cols-2 gap-12'>
          <div className='space-y-4'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image 
                src={selectedImage} 
                alt={`Image of ${product.name}`} 
                width={600} 
                height={600} 
                className='w-full h-auto object-cover rounded-lg shadow-lg'
              />
            </motion.div>
            <div className='grid grid-cols-5 gap-2'>
              {product.images.map((img, index) => (
                <motion.button 
                  key={img._id} 
                  onClick={() => setSelectedImage(img.url)} 
                  className='focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md overflow-hidden'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image 
                    src={img.url} 
                    alt={`${product.name} - View ${index + 1}`} 
                    width={100} 
                    height={100} 
                    className='w-full h-auto object-cover hover:opacity-75 transition-opacity'
                  />
                </motion.button>
              ))}
            </div>
          </div>

          <div className='space-y-6'>
            <h1 className='text-4xl font-bold text-gray-800'>{product.name}</h1>
            <p className='text-3xl font-semibold text-blue-600'>S/{getSelectedVariationPrice()?.toFixed(2)}</p>
            <div className='flex items-center' aria-label={`Product rating: ${product.rating || 0} out of 5 stars`}>
              {[...Array(5)].map((_, index) => (
                <Star 
                  key={index} 
                  className={index < (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                />
              ))}
              <span className='ml-2 text-gray-600'>({product.rating || 0}/5)</span>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-2'>Color:</h3>
              <div className='flex flex-wrap gap-2'>
                {uniqueColors.map((color) => (
                  <motion.button 
                    key={color} 
                    onClick={() => handleColorChange(color)}
                    className={`px-4 py-2 rounded-full ${selectedColor === color ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {color}
                  </motion.button>
                ))}
              </div>
            </div>
            {selectedColor && (
              <div>
                <h3 className='text-lg font-semibold mb-2'>Size:</h3>
                <div className='flex flex-wrap gap-2'>
                  {uniqueSizes.map((size) => (
                    <motion.button 
                      key={size} 
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-full ${selectedSize === size ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className='text-lg font-semibold mb-2'>Quantity:</h3>
              <div className='flex items-center space-x-2'>
                <motion.button 
                  onClick={handleDecrease} 
                  className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-full'
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
                  className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-full'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </div>

            <div className='flex space-x-4'>
              <motion.button 
                onClick={addToCart} 
                className='flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full flex items-center justify-center'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className='mr-2' />
                Add to Cart
              </motion.button>
              <motion.button 
                onClick={addToWishlist}
                className='bg-gray-200 hover:bg-gray-300 text-gray-800 p-3 rounded-full'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart />
              </motion.button>
            </div>

            <div className='bg-gray-100 p-4 rounded-lg flex items-center mt-4'>
              <Truck className='text-blue-500 mr-3' />
              <p className='text-sm'>Free shipping on orders over S/100</p>
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
            <h2 className='text-3xl font-bold mb-6'>Productos Relacionados</h2>
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

