'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { axiosInstance } from '@/lib/axiosInstance'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'
import { DialogTitle } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from 'next/image'
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
  variationId: {
    _id: string;
    price: number;
    size: string;
    color: string;
  };
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
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const promptLogin = useCallback(() => {
    toast({
      title: "Inicio de sesión requerido",
      description: "Por favor, inicia sesión para ver tu carrito.",
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
      
      if (response.data && Array.isArray(response.data.items)) {
        // Asegurarse de que todos los items tengan la información completa
        const normalizedItems = response.data.items.map((item: CartItem) => ({
          ...item,
          productId: {
            ...item.productId,
            name: item.productId?.name || "Producto Desconocido",
            sellingPrice: item.productId?.sellingPrice || 0,
            images: item.productId?.images || []
          },
          variationId: {
            ...item.variationId,
            price: item.variationId?.price || item.productId?.sellingPrice || 0
          }
        }))

        setCartData({
          ...response.data,
          items: normalizedItems
        })
      } else {
        throw new Error('Datos de carrito inválidos recibidos')
      }
    } catch (err) {
      console.error('Error al obtener los items del carrito:', err)
      setError('No se pudieron cargar los items del carrito. Por favor, intenta de nuevo.')
      toast({
        title: "Error",
        description: "No se pudieron cargar los items del carrito. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateQuantity = useCallback(async (itemId: string, change: number) => {
    if (isUpdating) return
    setIsUpdating(true)
    
    try {
      const token = Cookies.get('token')
      if (!token) throw new Error('No se encontró el token')

      const decodedToken = jwtDecode<DecodedToken>(token)
      const userId = decodedToken.userId

      const currentItem = cartData?.items.find(item => item._id === itemId)
      if (!currentItem) throw new Error('Item no encontrado en el carrito')

      const newQuantity = currentItem.quantity + change
      if (newQuantity < 1) return

      // Preservar los precios y datos originales durante la actualización local
      const itemPrice = currentItem.variationId?.price ?? currentItem.productId.sellingPrice
      
      // Actualización optimista manteniendo todos los datos originales
      setCartData(prev => {
        if (!prev) return null
        return {
          ...prev,
          items: prev.items.map(item => {
            if (item._id === itemId) {
              return {
                ...item,
                quantity: newQuantity,
                productId: {
                  ...item.productId,
                  sellingPrice: item.productId.sellingPrice, // Mantener precio original
                },
                variationId: {
                  ...item.variationId,
                  price: itemPrice, // Mantener precio de variación original
                }
              }
            }
            return item
          })
        }
      })

      // Realizar la actualización en el servidor
      const response = await axiosInstance.put(`/cart/${userId}/item/${itemId}`, { 
        quantity: newQuantity 
      })

      // Solo actualizar el estado si la respuesta del servidor es diferente
      if (response.data && response.data.cart) {
        const serverItems = response.data.cart.items as CartItem[];
        const updatedItems = serverItems.map((serverItem: CartItem) => {
          const existingItem = cartData?.items.find(i => i._id === serverItem._id)
          return {
            ...serverItem,
            productId: {
              ...serverItem.productId,
              name: existingItem?.productId.name || serverItem.productId.name,
              sellingPrice: existingItem?.productId.sellingPrice || serverItem.productId.sellingPrice,
              images: existingItem?.productId.images || serverItem.productId.images
            },
            variationId: {
              ...serverItem.variationId,
              price: existingItem?.variationId?.price || serverItem.variationId?.price || serverItem.productId.sellingPrice
            }
          }
        })

        const hasChanges = serverItems.some(serverItem => {
          const localItem = cartData?.items.find(i => i._id === serverItem._id)
          return !localItem || 
                 localItem.quantity !== serverItem.quantity ||
                 localItem.variationId?.price !== serverItem.variationId?.price
        })

        if (hasChanges) {
          setCartData(prev => ({
            ...prev!,
            items: updatedItems
          }))
        }
      }
    } catch (err) {
      console.error('Error al actualizar el item del carrito:', err)
      // En caso de error, revertir al estado anterior
      fetchCartItems()
      toast({
        title: "Error",
        description: "No se pudo actualizar el carrito. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }, [cartData, fetchCartItems, isUpdating])

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('No se encontró el token')
      }

      const decodedToken = jwtDecode<DecodedToken>(token)
      const userId = decodedToken.userId

      // Actualizar estado local primero
      setCartData(prev => {
        if (!prev) return null
        return {
          ...prev,
          items: prev.items.filter(item => item._id !== itemId)
        }
      })

      const response = await axiosInstance.delete(`/cart/${userId}/item/${itemId}`)

      if (response.status !== 200) {
        // Si hay error, recargar el carrito
        fetchCartItems()
        throw new Error('No se pudo eliminar el item')
      }

      toast({
        title: "Item eliminado",
        description: "El item ha sido eliminado de tu carrito.",
      })
    } catch (err) {
      console.error('Error al eliminar el item del carrito:', err)
      const errorMessage = err instanceof Error ? err.message : 'No se pudo eliminar el item. Por favor, intenta de nuevo.'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [fetchCartItems])

  const clearCart = useCallback(async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('No se encontró el token')
      }

      const decodedToken = jwtDecode<DecodedToken>(token)
      const userId = decodedToken.userId

      // Actualizar estado local primero
      setCartData(null)

      const response = await axiosInstance.delete(`/cart/${userId}`)

      if (response.status !== 200) {
        // Si hay error, recargar el carrito
        fetchCartItems()
        throw new Error('No se pudo vaciar el carrito')
      }

      toast({
        title: "Carrito vaciado",
        description: "Tu carrito ha sido vaciado exitosamente.",
      })
    } catch (err) {
      console.error('Error al vaciar el carrito:', err)
      const errorMessage = err instanceof Error ? err.message : 'No se pudo vaciar el carrito. Por favor, intenta de nuevo.'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [fetchCartItems])

  useEffect(() => {
    fetchCartItems()
  }, [fetchCartItems])

  // Memoizar el cálculo del total para evitar recálculos innecesarios
  const total = useMemo(() => {
    if (!cartData?.items?.length) return 0
    
    return cartData.items.reduce((sum, item) => {
      const itemPrice = item.variationId?.price ?? item.productId?.sellingPrice ?? 0
      return sum + (itemPrice * item.quantity)
    }, 0)
  }, [cartData?.items])

  // Memoizar el cálculo de la cantidad total de items
  const totalItems = useMemo(() => {
    return cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }, [cartData?.items])

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
        <Button size="icon" variant="outline" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {totalItems}
            </span>
          )}
          <span className="sr-only">Abrir carrito de compras</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full" aria-label="Contenido del carrito de compras">
        <div className="flex flex-col h-full">
          <SheetHeader>
            <DialogTitle asChild>
              <SheetTitle className="text-xl sm:text-2xl font-bold">Carrito de Compras</SheetTitle>
            </DialogTitle>
          </SheetHeader>
          <ScrollArea className="flex-grow mt-6 pr-4 -mr-4">
            {!Cookies.get('token') ? (
              <p className="text-center">Por favor, inicia sesión para ver tu carrito.</p>
            ) : isLoading ? (
              <p className="text-center">Cargando items del carrito...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : cartData && cartData.items && cartData.items.length > 0 ? (
              <div className="space-y-6">
                {cartData.items.map(item => (
                  <div key={`${item._id}-${item.quantity}`} className="flex items-start space-x-2 sm:space-x-4">
                    <Image 
                        src={item.productId?.images?.[0]?.url || "/placeholder.svg"}
                        alt={item.productId?.name || "Producto"}
                        width={80} // Establece el ancho (para la versión más pequeña)
                        height={80} // Establece la altura (para la versión más pequeña)
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-md object-cover" 
                        layout="intrinsic" // Asegura que las imágenes mantengan su proporción de aspecto
                      />
                    <div className="flex-1 space-y-1">
                      <h3 className="text-sm font-medium">{item.productId?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.variationId?.size && `Talla: ${item.variationId.size}`}
                        {item.variationId?.color && `, Color: ${item.variationId.color}`}
                      </p>
                      <p className="text-sm font-medium">
                        S/ {((item.variationId?.price ?? item.productId?.sellingPrice ?? 0) * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => updateQuantity(item._id, -1)}
                          disabled={item.quantity <= 1 || isUpdating}
                          className="h-7 w-7 sm:h-8 sm:w-8"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => updateQuantity(item._id, 1)}
                          disabled={isUpdating}
                          className="h-7 w-7 sm:h-8 sm:w-8"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => removeItem(item._id)}
                      disabled={isUpdating}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Eliminar item</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Tu carrito está vacío</p>
            )}
          </ScrollArea>
          {cartData && cartData.items && cartData.items.length > 0 && (
            <div className="space-y-4 mt-6 pt-6 border-t">
              <div className="flex justify-between text-base font-medium">
                <p>Total</p>
                <p>S/ {total.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={clearCart} 
                  variant="outline"
                  disabled={isUpdating}
                >
                  Limpiar carrito
                </Button>
                <Button asChild className="w-full">
                  <Link href="/checkout" className="w-full">
                    Proceder al pago
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

