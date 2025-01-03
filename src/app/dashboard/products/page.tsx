'use client'

import { useEffect, useState } from 'react'
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/products")
      if (response.status === 200) {
        setProducts(response.data.data)
      } else {
        console.error("Error fetching products:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddProduct = async (newProduct: Product) => {
    try {
      const response = await axiosInstance.post("/products", newProduct)
      if (response.status === 201) {
        fetchProducts()
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding product:", error)
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
        console.error("Error fetching product:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    try {
      const response = await axiosInstance.delete(`/products/${product._id}`)
      if (response.status === 200) {
        fetchProducts()
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const handleSubmit = async (values: Product) => {
    if (selectedProduct) {
      try {
        const response = await axiosInstance.put(`/products/${selectedProduct._id}`, values)
        if (response.status === 200) {
          fetchProducts()
          setIsDialogOpen(false)
          setSelectedProduct(null)
        }
      } catch (error) {
        console.error("Error updating product:", error)
      }
    } else {
      await handleAddProduct(values)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedProduct(null)}>Add Product</Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {selectedProduct ? 'Edit the details of the product here.' : 'Fill in the details of the new product here.'} Click save when you're done.
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
      <ProductsTable 
        data={products} 
        onView={handleViewProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  )
}

