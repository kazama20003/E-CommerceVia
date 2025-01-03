'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
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
  const { toast } = useToast()

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get<Category[]>('/categories')
      if (Array.isArray(response.data)) {
        setCategories(response.data)
      } else {
        console.error('Unexpected data format:', response.data)
        setError('Received unexpected data format from server.')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to fetch categories. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const addCategory = async (newCategory: Category) => {
    try {
      const response = await axiosInstance.post<Category>('/categories', newCategory)
      if (response.data) {
        setCategories(prev => [...prev, response.data])
        toast({
          title: "Category added successfully",
          description: "The new category has been added to the list.",
        })
      }
    } catch (err) {
      console.error('Error adding category:', err)
      toast({
        title: "Failed to add category",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const updateCategory = async (updatedCategory: Category) => {
    try {
      const response = await axiosInstance.put<Category>(`/categories/${updatedCategory._id}`, updatedCategory)
      if (response.data) {
        setCategories(prev => prev.map(category => category._id === updatedCategory._id ? response.data : category))
        toast({
          title: "Category updated successfully",
          description: "The category information has been updated.",
        })
      }
    } catch (err) {
      console.error('Error updating category:', err)
      toast({
        title: "Failed to update category",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await axiosInstance.delete(`/categories/${id}`)
      setCategories(prev => prev.filter(category => category._id !== id))
      toast({
        title: "Category deleted successfully",
        description: "The category has been removed from the list.",
      })
    } catch (err) {
      console.error('Error deleting category:', err)
      toast({
        title: "Failed to delete category",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }, [])

  const handleFormSubmit = useCallback((values: Category) => {
    if (editingCategory) {
      updateCategory(values);
    } else {
      addCategory(values);
    }
    setIsDialogOpen(false);
    setEditingCategory(null);
  }, [editingCategory]);

  const handleOpenDialog = useCallback(() => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }, [])

  if (isLoading) {
    return <div className="p-4">Loading categories...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full">
        <div className="bg-white shadow-sm">
          <div className="px-4 py-5 sm:px-6 border-b">
            <h2 className="text-lg font-semibold leading-6 text-gray-900">Categories</h2>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Show</p>
                <Select defaultValue="5">
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="5" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">entries</p>
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <Input 
                  placeholder="Search categories" 
                  className="pr-12"
                />
                <Button 
                  onClick={handleOpenDialog}
                  size="sm"
                  className="absolute right-1 top-1 rounded-full w-8 h-8 p-0 bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>

            {error && <div className="text-destructive">{error}</div>}

            <div className="bg-white -mx-4 sm:-mx-6 md:mx-0 md:rounded-lg shadow overflow-hidden">
              <CategoryTable 
                categories={categories}
                onEdit={handleEdit}
                onDelete={deleteCategory}
              />
            </div>

            <CategoryForm 
              open={isDialogOpen} 
              onOpenChange={setIsDialogOpen}
              onSubmit={handleFormSubmit}
              initialCategory={editingCategory}
            />

            <div className="pt-4 space-y-2 border-t">
              <p className="text-sm text-muted-foreground text-center">
                Showing 1 to {categories.length} of {categories.length} entries
              </p>
              <div className="flex items-center justify-center gap-4">
                <button 
                  className="text-sm text-muted-foreground disabled:opacity-50" 
                  disabled
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">Page</span>
                  <span className="text-sm">1</span>
                  <span className="text-sm text-muted-foreground">of 1</span>
                </div>
                <button 
                  className="text-sm text-muted-foreground disabled:opacity-50"
                  disabled
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

