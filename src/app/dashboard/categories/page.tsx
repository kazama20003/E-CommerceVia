'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CategoryForm } from '@/components/dashboard/categories/CategoryForm'
import { CategoryTable } from '@/components/dashboard/categories/CategoryTable'
import { axiosInstance } from '@/lib/axiosInstance'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface SubCategory {
  _id: string;
  name: string;
  category: string[];
}

interface Category {
  _id: string;
  name: string;
  description: string;
  subCategory: SubCategory[];
  image: {
    url: string;
    id: string;
  };
  status: 'Active' | 'Inactive';
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState('10')
  const { toast } = useToast()

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get<Category[]>('/categories')
      if (Array.isArray(response.data)) {
        setCategories(response.data)
      } else {
        console.error('Unexpected data format:', response.data)
        setError('Se recibió un formato de datos inesperado del servidor.')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Error al obtener las categorías. Por favor, inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const deleteCategory = async (id: string) => {
    try {
      await axiosInstance.delete(`/categories/${id}`)
      setCategories(prev => prev.filter(category => category._id !== id))
      toast({
        title: "Categoría eliminada con éxito",
        description: "La categoría ha sido eliminada de la lista.",
      })
    } catch (err) {
      console.error('Error deleting category:', err)
      toast({
        title: "Error al eliminar la categoría",
        description: "Por favor, inténtalo de nuevo",
        variant: "destructive",
      })
    }
  }

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }, [])

  const handleFormSubmit = useCallback((newCategory: Category) => {
    setCategories(prev => {
      const index = prev.findIndex(cat => cat._id === newCategory._id);
      if (index !== -1) {
        // Update existing category
        const updatedCategories = [...prev];
        updatedCategories[index] = newCategory;
        return updatedCategories;
      } else {
        // Add new category
        return [...prev, newCategory];
      }
    });
    setIsDialogOpen(false);
    setEditingCategory(null);
  }, []);

  const handleAddSubCategory = useCallback((categoryId: string, subCategoryName: string) => {
    setCategories(prev => prev.map(category => {
      if (category._id === categoryId) {
        return {
          ...category,
          subCategory: [...category.subCategory, { _id: Date.now().toString(), name: subCategoryName, category: [categoryId] }]
        };
      }
      return category;
    }));
  }, []);

  const handleOpenDialog = useCallback(() => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }, [])

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b">
            <h2 className="text-xl font-semibold leading-6 text-gray-900">Categorías</h2>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Mostrar</p>
                <Select 
                  value={entriesPerPage} 
                  onValueChange={setEntriesPerPage}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">entradas</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input 
                    placeholder="Buscar categorías" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-[250px]"
                  />
                </div>
                <Button 
                  onClick={handleOpenDialog}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" /> Añadir Categoría
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-destructive mb-4 p-4 bg-destructive/10 rounded-md"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <CategoryTable 
                  categories={filteredCategories}
                  onEdit={handleEdit}
                  onDelete={deleteCategory}
                  onAddSubCategory={handleAddSubCategory}
                />
              </div>
            )}

            <CategoryForm 
              open={isDialogOpen} 
              onOpenChange={setIsDialogOpen}
              onSubmit={handleFormSubmit}
              initialCategory={editingCategory}
            />

            <div className="pt-4 space-y-2 border-t">
              <p className="text-sm text-muted-foreground text-center">
                Mostrando 1 a {Math.min(parseInt(entriesPerPage), filteredCategories.length)} de {filteredCategories.length} entradas
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="outline"
                  size="sm"
                  disabled
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">Página</span>
                  <span className="text-sm font-medium">1</span>
                  <span className="text-sm text-muted-foreground">de 1</span>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  disabled
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

