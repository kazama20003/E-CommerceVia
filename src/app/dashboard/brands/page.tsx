'use client'

import { useState, useEffect } from 'react'
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
import { BrandForm } from '@/components/dashboard/brands/BrandForm'
import { BrandTable } from '@/components/dashboard/brands/brandTable'
import { axiosInstance } from '@/lib/axiosInstance'
import { useToast } from '@/hooks/use-toast'

interface Brand {
  _id: string;
  name: string;
  description: string;
  image: {
    url: string;
    id: string;
  };
  status: 'active' | 'inactive';
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get<Brand[]>('/brands')
      console.log(response);
      
      if (Array.isArray(response.data)) {
        setBrands(response.data)
      } else {
        console.error('Unexpected data format:', response.data)
        setError('Received unexpected data format from server.')
      }
    } catch (err) {
      console.error('Error fetching brands:', err)
      setError('Failed to fetch brands. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const addBrand = async (newBrand: Omit<Brand, '_id'>) => {
    try {
      const response = await axiosInstance.post<Brand>('/brands', newBrand)
      if (response.data) {
        setBrands(prev => [...prev, response.data])
        toast({
          title: "Brand added successfully",
          description: "The new brand has been added to the list.",
        })
      }
    } catch (err) {
      console.error('Error adding brand:', err)
      toast({
        title: "Failed to add brand",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const updateBrand = async (updatedBrand: Brand) => {
    try {
      const response = await axiosInstance.put<Brand>(`/brands/${updatedBrand._id}`, updatedBrand)
      if (response.data) {
        setBrands(prev => prev.map(brand => brand._id === updatedBrand._id ? response.data : brand))
        toast({
          title: "Brand updated successfully",
          description: "The brand information has been updated.",
        })
      }
    } catch (err) {
      console.error('Error updating brand:', err)
      toast({
        title: "Failed to update brand",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const deleteBrand = async (id: string) => {
    try {
      await axiosInstance.delete(`/brands/${id}`)
      setBrands(prev => prev.filter(brand => brand._id !== id))
      toast({
        title: "Brand deleted successfully",
        description: "The brand has been removed from the list.",
      })
    } catch (err) {
      console.error('Error deleting brand:', err)
      toast({
        title: "Failed to delete brand",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setIsDialogOpen(true)
  }

  const handleFormSubmit = (values: Omit<Brand, '_id'>) => {
    if (editingBrand) {
      updateBrand({ ...values, _id: editingBrand._id });
    } else {
      addBrand(values);
    }
    setIsDialogOpen(false);
    setEditingBrand(null);
  };

  if (isLoading) {
    return <div className="flex-1 p-4 md:p-8">Loading brands...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Brands</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <p className="text-sm text-muted-foreground whitespace-nowrap">Show</p>
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
            <p className="text-sm text-muted-foreground whitespace-nowrap">entries</p>
          </div>
          <Input 
            placeholder="Search" 
            className="max-w-[250px] w-full"
          />
          <Button 
            onClick={() => {
              setEditingBrand(null)
              setIsDialogOpen(true)
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Brand
          </Button>
        </div>
      </div>

      {error && <div className="text-destructive mb-4">{error}</div>}

      <BrandTable 
        brands={brands}
        onEdit={handleEdit}
        onDelete={deleteBrand}
      />
      <BrandForm 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSubmit={handleFormSubmit}
        initialBrand={editingBrand}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing 1 to {brands.length} of {brands.length} entries
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <p className="text-sm">Page</p>
            <strong>1</strong>
            <p className="text-sm">of 1</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

