'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { axiosInstance } from '@/lib/axiosInstance'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import axios from 'axios'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link';
import { DialogTitle } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
interface DecodedToken {
  userId: string;
  role: string;
}

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    sellingPrice: number;
    images: Array<{
      url: string;
      id: string;
      _id: string;
    }>;
  };
  variationId: string;
  quantity: number;
}

interface CartData {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export function ShoppingCartSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const promptLogin = useCallback(() => {
    toast({
      title: "Login Required",
      description: "Please log in to view your cart.",
      variant: "default",
    })
    router.push('/login')
  }, [router])

  const fetchCartItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = Cookies.get('token')
      if (!token) {
        setCartData(null)
        setIsLoading(false)
        return
      }

      const decodedToken = jwtDecode<DecodedToken>(token)
      const userId = decodedToken.userId
      
      const response = await axiosInstance.get(`/cart/${userId}`)
      console.log('get cart',response);
      
      if (response.data && Array.isArray(response.data.items)) {
        setCartData(response.data)
      } else {
        throw new Error('Invalid cart data received')
      }
    } catch (err) {
      console.error('Error fetching cart items:', err)
      setError('Failed to load cart items. Please try again.')
      toast({
        title: "Error",
        description: "Failed to load cart items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('No token found')
      }

      const decodedToken = jwtDecode<DecodedToken>(token)
      const userId = decodedToken.userId

      const response = await axiosInstance.delete(`/cart/${userId}/item/${itemId}`)

      if (response.status === 200) {
        // Item successfully removed, update the cart data
        const updatedItems = cartData?.items.filter(item => item._id !== itemId) || []
        setCartData(prev => prev ? { ...prev, items: updatedItems } : null)
        toast({
          title: "Item removed",
          description: "The item has been removed from your cart.",
        })
      } else {
        throw new Error('Failed to remove item')
      }
    } catch (err) {
      console.error('Error removing cart item:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item. Please try again.'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [cartData, setCartData, toast])

  const clearCart = useCallback(async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('No token found')
      }

      const decodedToken = jwtDecode<DecodedToken>(token)
      const userId = decodedToken.userId

      const response = await axiosInstance.delete(`/cart/${userId}`)

      if (response.status === 200) {
        setCartData(null)
        toast({
          title: "Cart cleared",
          description: "Your cart has been cleared successfully.",
        })
      } else {
        throw new Error('Failed to clear cart')
      }
    } catch (err) {
      console.error('Error clearing cart:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart. Please try again.'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [setCartData, toast])

  const updateQuantity = useCallback(async (itemId: string, change: number) => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('No token found')
      }

      const decodedToken = jwtDecode<DecodedToken>(token)
      const userId = decodedToken.userId

      // Find the current item and its quantity
      const currentItem = cartData?.items.find(item => item._id === itemId)
      if (!currentItem) {
        throw new Error('Item not found in cart')
      }

      const newQuantity = currentItem.quantity + change
      const response = await axiosInstance.put(`/cart/${userId}/item/${itemId}`, { quantity: newQuantity })

      if (response.data && response.data.cart) {
        const updatedItems = response.data.cart.items.map((item: CartItem) => {
          const existingItem = cartData?.items.find(i => i._id === item._id)
          return {
            ...item,
            productId: {
              ...item.productId,
              name: existingItem?.productId.name || item.productId.name,
              images: item.productId.images && item.productId.images.length > 0
                ? item.productId.images
                : existingItem?.productId.images || []
            }
          }
        })

        setCartData({
          ...response.data.cart,
          items: updatedItems
        })

        if (change > 0) {
          toast({
            title: "Cart updated",
            description: "Your cart has been updated successfully.",
          })
        }
      } else {
        throw new Error('Invalid response data')
      }
    } catch (err) {
      console.error('Error updating cart item:', err)
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data.message || 'Failed to update cart. Please try again.'
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } else {
        setError('Failed to update cart. Please try again.')
        toast({
          title: "Error",
          description: "Failed to update cart. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [cartData, setCartData, toast])


  useEffect(() => {
    fetchCartItems()
  }, [fetchCartItems])

  const total = cartData?.items?.reduce((sum, item) => {
    const price = item.productId?.sellingPrice ?? 0
    return sum + price * item.quantity
  }, 0) || 0

  const handleOpenChange = useCallback((open: boolean) => {
    if (open && !Cookies.get('token')) {
      promptLogin()
    } else {
      setIsOpen(open)
      if (open) {
        fetchCartItems()
      }
    }
  }, [promptLogin, fetchCartItems])

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="icon" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {cartData && cartData.items && cartData.items.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {cartData.items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
          <span className="sr-only">Open shopping cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg" aria-label="Shopping cart contents">
        <SheetHeader>
          <DialogTitle asChild>
            <SheetTitle>Shopping Cart</SheetTitle>
          </DialogTitle>
        </SheetHeader>
        <div className="mt-8 space-y-4">
          {!Cookies.get('token') ? (
            <p className="text-center">Please log in to view your cart.</p>
          ) : isLoading ? (
            <p className="text-center">Loading cart items...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : cartData && cartData.items && cartData.items.length > 0 ? (
            cartData.items.map(item => (
              <div key={`${item._id}-${item.quantity}`} className="flex items-center space-x-4">
                <img 
                  src={item.productId?.images?.[0]?.url || "/placeholder.svg"}
                  alt={item.productId?.name || "Product"} 
                  className="h-16 w-16 rounded object-cover" 
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{item.productId?.name || "Unknown Product"}</h3>
                  <p className="text-sm text-gray-500">${(item.productId?.sellingPrice ?? 0).toFixed(2)}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => updateQuantity(item._id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                      <span className="sr-only">Decrease quantity</span>
                    </Button>
                    <span>{item.quantity}</span>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => updateQuantity(item._id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => removeItem(item._id)}
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Remove item</span>
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center">Your cart is empty</p>
          )}
        </div>
        {cartData && cartData.items && cartData.items.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between text-base font-medium">
              <p>Total</p>
              <p>${total.toFixed(2)}</p>
            </div>
            <Button className="mt-6 w-full" variant="outline" onClick={clearCart}>
              Limpiar carrito
            </Button>
            <Link href="/checkout">
              <Button className="mt-2 w-full">Checkout</Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

