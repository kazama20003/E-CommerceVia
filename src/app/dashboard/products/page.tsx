'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductsTable } from '@/components/dashboard/products/products-table'
import { ProductForm, Product } from '@/components/dashboard/products/product-form'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { axiosInstance } from '@/lib/axiosInstance'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get("/products")
      if (response.status === 200) {
        setProducts(response.data.data)
      } else {
        throw new Error(response.statusText)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const memoizedFetchProducts = useCallback(fetchProducts, [toast])

  useEffect(() => {
    memoizedFetchProducts()
  }, [memoizedFetchProducts])

  const handleAddProduct = async (newProduct: Product) => {
    try {
      const response = await axiosInstance.post("/products", newProduct)
      if (response.status === 201) {
        memoizedFetchProducts()
        setIsDialogOpen(false)
        toast({
          title: "Éxito",
          description: "Producto agregado exitosamente.",
        })
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el producto. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleViewProduct = (product: Product) => {
    router.push(`/dashboard/products/${product._id}`)
  }

  const handleEditProduct = async (product: Product) => {
    try {
      const response = await axiosInstance.get(`/products/${product._id}`)
      if (response.status === 200) {
        setSelectedProduct(response.data.data)
        setIsDialogOpen(true)
      } else {
        throw new Error(response.statusText)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del producto. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    try {
      const response = await axiosInstance.delete(`/products/${product._id}`)
      if (response.status === 200) {
        memoizedFetchProducts()
        toast({
          title: "Éxito",
          description: "Producto eliminado exitosamente.",
        })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (values: Product) => {
    if (selectedProduct) {
      try {
        const response = await axiosInstance.put(`/products/${selectedProduct._id}`, values)
        if (response.status === 200) {
          memoizedFetchProducts()
          setIsDialogOpen(false)
          setSelectedProduct(null)
          toast({
            title: "Éxito",
            description: "Producto actualizado exitosamente.",
          })
        }
      } catch (error) {
        console.error("Error updating product:", error)
        toast({
          title: "Error",
          description: "No se pudo actualizar el producto. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } else {
      await handleAddProduct(values)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
    >
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-4 sm:p-6">
          <div>
            <CardTitle className="text-2xl font-bold">Productos</CardTitle>
            <CardDescription className="mt-1">
              Administra tu inventario de productos aquí.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={memoizedFetchProducts}
              className="h-9 w-9"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setSelectedProduct(null)}
                  className="h-9"
                >
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Agregar Producto</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-full sm:w-full">
                <DialogHeader>
                  <DialogTitle>{selectedProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</DialogTitle>
                  <DialogDescription>
                    {selectedProduct ? 'Edita los detalles del producto aquí.' : 'Completa los detalles del nuevo producto aquí.'} 
                    Haz clic en guardar cuando hayas terminado.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[80vh] overflow-y-auto">
                  <ProductForm 
                    initialData={selectedProduct || undefined}
                    onSubmit={handleSubmit}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <AnimatePresence>
              <ProductsTable 
                data={products} 
                onView={handleViewProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

