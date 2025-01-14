'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Plus, X, Check, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { axiosInstance } from '@/lib/axiosInstance'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Variation {
  _id: string;
  color: string;
  size: string;
  price: number;
  sku: string;
}

interface ProductProps {
  product: {
    _id: string;
    variations: Variation[];
  };
}

export const VariationTab: React.FC<ProductProps> = ({ product }) => {
  const [variations, setVariations] = useState<Variation[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null)
  const [formData, setFormData] = useState({
    color: '',
    size: '',
    price: '',
    sku: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const params = useParams()
  const productId = params.slug as string

  useEffect(() => {
    setVariations(product.variations || [])
  }, [product.variations])

  const generateSKU = useCallback(() => {
    const random = Math.floor(Math.random() * 90000) + 10000
    setFormData(prev => ({ ...prev, sku: `SKU-${random}` }))
  }, [])

  const openDialog = useCallback((variation: Variation | null) => {
    setSelectedVariation(variation)
    setFormData({
      color: variation?.color || '',
      size: variation?.size || '',
      price: variation?.price?.toString() || '',
      sku: variation?.sku || ''
    })
    setIsDialogOpen(true)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!formData.color || !formData.size || !formData.price || !formData.sku) {
      toast({ title: "Please fill all required fields", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0 // Ensure price is always a number
      }

      let response
      if (selectedVariation) {
        response = await axiosInstance.put(`/products/${productId}/variations/${selectedVariation._id}`, payload)
      } else {
        response = await axiosInstance.post(`/products/${productId}/variations`, payload)
      }

      if (response.status === 200) {
        setVariations(prev => selectedVariation 
          ? prev.map(v => v._id === selectedVariation._id ? { ...v, ...payload } : v)
          : [...prev, response.data]
        )
        setIsDialogOpen(false)
        toast({ 
          title: selectedVariation ? "Variation updated successfully" : "Variation added successfully", 
          variant: "default" 
        })
      }
    } catch (error) {
      console.error('Error saving variation:', error)
      toast({ 
        title: "Error saving variation", 
        description: "Please try again", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }, [formData, selectedVariation, productId, toast])

  const handleDelete = useCallback(async (variationId: string) => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.delete(`/products/${productId}/variations/${variationId}`)
      if (response.status === 200) {
        setVariations(prev => prev.filter(v => v._id !== variationId))
        toast({ title: "Variation deleted successfully", variant: "default" })
      }
    } catch (error) {
      console.error('Error deleting variation:', error)
      toast({ 
        title: "Error deleting variation", 
        description: "Please try again", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }, [productId, toast])

  const getBadgeStyles = useCallback((color: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      'White': { bg: '#FFFFFF', text: '#000000' },
      'Black': { bg: '#000000', text: '#FFFFFF' },
      'Navy': { bg: '#000080', text: '#FFFFFF' },
      'Gray': { bg: '#808080', text: '#FFFFFF' },
      'Beige': { bg: '#F5F5DC', text: '#000000' },
      'Brown': { bg: '#8B4513', text: '#FFFFFF' },
      'Red': { bg: '#FF0000', text: '#FFFFFF' },
      'Green': { bg: '#008000', text: '#FFFFFF' },
      'Blue': { bg: '#0000FF', text: '#FFFFFF' }
    }

    return colorMap[color] || { bg: '#CCCCCC', text: '#000000' }
  }, [])

  const variationsList = useMemo(() => {
    return variations.map((variation, index) => {
      const { bg, } = getBadgeStyles(variation.color || '')
      return (
        <div 
          key={variation._id || index} 
          className="grid grid-cols-5 gap-4 px-4 py-3 items-center hover:bg-gray-50/50 transition-colors"
        >
          <div>
            <div 
              className="w-6 h-6 rounded-full"
              style={{
                backgroundColor: bg,
                border: '1px solid rgba(0,0,0,0.1)'
              }}
              title={variation.color || 'N/A'}
            />
          </div>
          <div className="text-sm">{variation.size || 'N/A'}</div>
          <div className="text-sm">
            S/{typeof variation.price === 'number' ? variation.price.toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-gray-500">{variation.sku || 'N/A'}</div>
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => openDialog(variation)}
              disabled={isLoading}
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => handleDelete(variation._id)}
              disabled={isLoading}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      )
    })
  }, [variations, getBadgeStyles, openDialog, handleDelete, isLoading])

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="px-4 py-3 space-y-2">
        <CardTitle className="text-xl font-semibold">Product Variations</CardTitle>
        <Button 
          onClick={() => openDialog(null)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variation
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          {variations.length > 0 ? (
            <div className="border-t">
              <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50/80 text-sm font-medium text-gray-500">
                <div>Color</div>
                <div>Talla</div>
                <div>Price</div>
                <div>SKU</div>
                <div className="text-right">Actions</div>
              </div>
              <div className="divide-y">
                {variationsList}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No variations added yet. Add some variations to your product!
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedVariation ? 'Edit Variation' : 'Add Variation'}
            </DialogTitle>
            <DialogDescription>
              {selectedVariation ? 'Modify the details of this variation.' : 'Add a new variation to your product.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                >
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="White">White</SelectItem>
                    <SelectItem value="Black">Black</SelectItem>
                    <SelectItem value="Navy">Navy</SelectItem>
                    <SelectItem value="Gray">Gray</SelectItem>
                    <SelectItem value="Beige">Beige</SelectItem>
                    <SelectItem value="Brown">Brown</SelectItem>
                    <SelectItem value="Red">Red</SelectItem>
                    <SelectItem value="Green">Green</SelectItem>
                    <SelectItem value="Blue">Blue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Talla</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}
                >
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pequeño">Pequeño</SelectItem>
                    <SelectItem value="Mediano">Mediano</SelectItem>
                    <SelectItem value="Grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Enter price"
                step="0.01"
                min="0"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Enter SKU"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={generateSKU}
                  className="flex-shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

