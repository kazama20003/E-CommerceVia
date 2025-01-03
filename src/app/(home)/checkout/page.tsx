'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { axiosInstance } from '@/lib/axiosInstance'
import { CartStep } from '@/components/home/checkOut/CartStep'
import { AddressStep } from '@/components/home/checkOut/AddressStep'
import { PaymentStep } from '@/components/home/checkOut/PaymentStep'
import { OrderSummary } from '@/components/home/checkOut/OrderSummary'
import { CheckoutProgress } from '@/components/home/checkOut/CheckoutProgress'
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface DecodedToken {
  userId: string;
  role: string;
  iat: number;
}

interface ProductVariation {
  _id: string;
  color: string;
  size: string;
  sku: string;
  price: number;
}

interface Product {
  _id: string;
  name: string;
  sellingPrice: number;
  tax: number;
  images: { url: string }[];
  variations: ProductVariation[];
}

interface CartItem {
  _id: string;
  productId: Product;
  quantity: number;
  variationId: string;
}

interface CartData {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

interface ShippingAddress {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  streetAddress: string;
}

export default function CheckoutPage() {
  const [step, setStep] = useState<'cart' | 'address' | 'payment'>('cart')
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [saveAsBilling, setSaveAsBilling] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchCartData = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('User not authenticated')
      }
      
      const decodedToken = jwtDecode<DecodedToken>(token)
      const userId = decodedToken.userId
      if (!userId) {
        throw new Error('User ID not found in token')
      }

      const response = await axiosInstance.get(`/cart/${userId}`)
      if (response.data) {
        setCartData(response.data)
      } else {
        throw new Error('No cart data received')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch cart data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const fetchShippingAddress = useCallback(async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('User not authenticated')
      }
      
      const decodedToken = jwtDecode<DecodedToken>(token)
      if (!decodedToken.userId) {
        throw new Error('User ID not found in token')
      }

      const response = await axiosInstance.get(`/users/${decodedToken.userId}`)
      if (response.data.status && response.data.user.shippingAddress) {
        setShippingAddress(response.data.user.shippingAddress)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shipping address. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchCartData()
    fetchShippingAddress()
  }, [fetchCartData, fetchShippingAddress])

  const handleQuantityChange = async (itemId: string, change: number) => {
    if (!cartData) return

    const updatedItems = cartData.items.map(item =>
      item._id === itemId
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    )

    setCartData({ ...cartData, items: updatedItems })

    try {
      await axiosInstance.put(`/cart/${cartData.userId}/item/${itemId}`, {
        quantity: updatedItems.find(item => item._id === itemId)?.quantity
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item quantity. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!cartData) return

    try {
      await axiosInstance.delete(`/cart/${cartData.userId}/item/${itemId}`)
      setCartData({
        ...cartData,
        items: cartData.items.filter(item => item._id !== itemId)
      })
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveAddress = async (address: Omit<ShippingAddress, '_id'>) => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('User not authenticated')
      }
      
      const decodedToken = jwtDecode<DecodedToken>(token)
      if (!decodedToken.userId) {
        throw new Error('User ID not found in token')
      }

      const shippingResponse = await axiosInstance.post(`/users/${decodedToken.userId}/shippingAddress`, address)
      if (shippingResponse.data.status && shippingResponse.data.user.shippingAddress) {
        setShippingAddress(shippingResponse.data.user.shippingAddress)
      }

      toast({
        title: "Address saved",
        description: "Your new shipping address has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveAsBilling = useCallback(async (checked: boolean) => {
    setSaveAsBilling(checked)
    if (checked && shippingAddress) {
      try {
        const token = Cookies.get('token')
        if (!token) {
          throw new Error('User not authenticated')
        }
        
        const decodedToken = jwtDecode<DecodedToken>(token)
        if (!decodedToken.userId) {
          throw new Error('User ID not found in token')
        }

        await axiosInstance.put(`/users/${decodedToken.userId}/billingAddress`, shippingAddress)
        toast({
          title: "Billing address saved",
          description: "Your shipping address has been set as your billing address.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save billing address. Please try again.",
          variant: "destructive",
        })
        setSaveAsBilling(false)
      }
    }
  }, [shippingAddress, toast])

  const handleDeleteShippingAddress = useCallback(async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('User not authenticated')
      }
      
      const decodedToken = jwtDecode<DecodedToken>(token)
      if (!decodedToken.userId) {
        throw new Error('User ID not found in token')
      }

      await axiosInstance.delete(`/users/${decodedToken.userId}/shippingAddress`)
      setShippingAddress(null)
      toast({
        title: "Shipping address deleted",
        description: "Your shipping address has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete shipping address. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleDeleteBillingAddress = useCallback(async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('User not authenticated')
      }
      
      const decodedToken = jwtDecode<DecodedToken>(token)
      if (!decodedToken.userId) {
        throw new Error('User ID not found in token')
      }

      await axiosInstance.delete(`/users/${decodedToken.userId}/billingAddress`)
      setSaveAsBilling(false)
      toast({
        title: "Billing address deleted",
        description: "Your billing address has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete billing address. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleOrderSubmission = async (paymentMethod: string) => {
    if (!cartData || !shippingAddress) {
      toast({
        title: "Error",
        description: "Missing cart data or shipping address.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Set the token in the headers for all requests
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const orderData = {
        paymentType: paymentMethod, 
        orderType: paymentMethod,
        items: cartData.items.map(item => {
          const variation = item.productId.variations.find(v => v._id === item.variationId);
          return {
            productName: item.productId.name,
            productImage: item.productId.images[0]?.url || "",
            color: variation?.color || "",
            size: variation?.size || "",
            price: variation ? variation.price : item.productId.sellingPrice,
            quantity: item.quantity,
            sku: variation?.sku || ""
          };
        }),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.street,
          addressLine2: shippingAddress.streetAddress,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipcode,
          country: shippingAddress.country
        },
        billingAddress: saveAsBilling ? {
          fullName: shippingAddress.fullName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.street,
          addressLine2: shippingAddress.streetAddress,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipcode,
          country: shippingAddress.country
        } : undefined, 
        subtotal: cartData.items.reduce((total, item) => {
          const variation = item.productId.variations.find(v => v._id === item.variationId)
          const price = variation ? variation.price : item.productId.sellingPrice
          return total + price * item.quantity
        }, 0),
        tax: cartData.items.reduce((total, item) => total + (item.productId.tax * item.quantity), 0),
        discount: 0, // Assuming no discount for now
        shippingCharge: 0, // Assuming free shipping for now
        total: cartData.items.reduce((total, item) => {
          const variation = item.productId.variations.find(v => v._id === item.variationId)
          const price = variation ? variation.price : item.productId.sellingPrice
          return total + price * item.quantity + item.productId.tax * item.quantity
        }, 0)
      };

      const response = await axiosInstance.post("/orders", orderData);
      console.log('Server response:', response);

      if (response.data && response.data.status && response.data.data) {
        toast({
          title: "Order Placed Successfully",
          description: `Your order has been placed successfully using ${paymentMethod}.`,
        })
        // Here you can redirect to an order confirmation page
        // For example:
        // router.push(`/order-confirmation/${response.data.data._id}`);

        if (paymentMethod === 'whatsapp') {
          const whatsappMessage = formatWhatsAppMessage(orderData);
          const whatsappNumber = '51901206784'; // Reemplaza con el número de WhatsApp de tu negocio, incluyendo el código de país
          // Asegúrate de que el número de WhatsApp incluya el código de país sin el símbolo '+'.
          // Por ejemplo, para Perú (código de país +51), el número debería ser '51934745245'.
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber.replace(/\D/g, '')}&text=${whatsappMessage}`;
          window.open(whatsappUrl, '_blank');
        }
      } else {
        throw new Error('Order placement failed: Invalid response from server');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to place order: ${error.message}`
          : "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
    <Header></Header>
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>
        
        <CheckoutProgress step={step} />
        
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <Card>
              <CardContent className="p-6">
                {step === 'cart' && cartData && (
                  <CartStep 
                    items={cartData.items}
                    onQuantityChange={handleQuantityChange}
                    onRemoveItem={handleRemoveItem}
                    onProceedToCheckout={() => setStep('address')}
                  />
                )}
                {step === 'address' && (
                  <AddressStep 
                    shippingAddress={shippingAddress}
                    saveAsBilling={saveAsBilling}
                    onSaveAddress={handleSaveAddress}
                    onDeleteShippingAddress={handleDeleteShippingAddress}
                    onDeleteBillingAddress={handleDeleteBillingAddress}
                    onSaveAsBillingChange={handleSaveAsBilling}
                    onBack={() => setStep('cart')}
                    onNext={() => setStep('payment')}
                  />
                )}
                {step === 'payment' && (
                  <PaymentStep 
                    onBack={() => setStep('address')}
                    onConfirmOrder={handleOrderSubmission}
                  />
                )}
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="summary-heading" className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5">
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
              Order summary
            </h2>

            {cartData && <OrderSummary cartData={cartData} />}
          </section>
        </div>
      </div>
    </div>
    <Footer></Footer>
    </>
  )
}

const formatWhatsAppMessage = (orderData: any) => {
  let message = "🛒 *Nueva Orden*\n\n";
  message += `👤 *Cliente:* ${orderData.shippingAddress.fullName}\n`;
  message += `📞 *Teléfono:* ${orderData.shippingAddress.phone}\n\n`;
  message += "*Productos:*\n";
  orderData.items.forEach((item: any, index: number) => {
    message += `${index + 1}. ${item.productName}\n`;
    message += `   Cantidad: ${item.quantity}\n`;
    message += `   Precio: $${item.price.toFixed(2)}\n`;
    message += `   Subtotal: $${(item.price * item.quantity).toFixed(2)}\n\n`;
  });
  message += `💰 *Subtotal:* $${orderData.subtotal.toFixed(2)}\n`;
  message += `🏷️ *Impuestos:* $${orderData.tax.toFixed(2)}\n`;
  message += `🚚 *Envío:* $${orderData.shippingCharge.toFixed(2)}\n`;
  message += `🏷️ *Descuento:* $${orderData.discount.toFixed(2)}\n`;
  message += `*TOTAL:* $${orderData.total.toFixed(2)}\n\n`;
  message += "*Dirección de envío:*\n";
  message += `${orderData.shippingAddress.addressLine1}, ${orderData.shippingAddress.addressLine2}\n`;
  message += `${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}\n`;
  message += `${orderData.shippingAddress.zipCode}, ${orderData.shippingAddress.country}\n`;
  return encodeURIComponent(message);
};

