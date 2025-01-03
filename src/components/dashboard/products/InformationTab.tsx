import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tag, DollarSign, Package, Info } from 'lucide-react'

interface Product {
  _id: string
  name: string
  sku: string
  category: string
  barcode: string
  buyingPrice: number
  sellingPrice: number
  tax: string
  brand: string
  status: string
  canPurchasable: boolean
  showStockOut: boolean
  refundable: boolean
  maximunPurchaseQuantity: number
  lowStockQuantityWarning: number
  unit: string
  weight: string
  tags: string | string[] | null | undefined
  description: string
}

interface InformationTabProps {
  product: Product
}

export const InformationTab: React.FC<InformationTabProps> = ({ product }) => {
  const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2">
      <span className="text-sm font-medium text-gray-500 mb-1 sm:mb-0">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  )

  const renderTags = () => {
    if (!product.tags) return null;
    
    let tagsArray: string[];
    if (typeof product.tags === 'string') {
      tagsArray = product.tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(product.tags)) {
      tagsArray = product.tags;
    } else {
      return null;
    }

    return tagsArray.map((tag, index) => (
      <Badge key={index} variant="outline" className="mb-2 mr-2">{tag}</Badge>
    ));
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Info className="w-5 h-5 mr-2" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Name" value={product.name} />
            <InfoItem label="SKU" value={product.sku} />
            <InfoItem label="Category" value={<Badge variant="secondary">{product.category}</Badge>} />
            <InfoItem label="Brand" value={<Badge variant="secondary">{product.brand}</Badge>} />
            <InfoItem label="Status" value={
              <Badge variant={product.status === 'Active' ? 'default' : 'destructive'}>
                {product.status}
              </Badge>
            } />
            <InfoItem label="Barcode" value={product.barcode} />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <DollarSign className="w-5 h-5 mr-2" />
            Pricing and Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Buying Price" value={`$${product.buyingPrice.toFixed(2)}`} />
            <InfoItem label="Selling Price" value={`$${product.sellingPrice.toFixed(2)}`} />
            <InfoItem label="Tax" value={product.tax} />
            <InfoItem label="Maximum Purchase Quantity" value={product.maximunPurchaseQuantity} />
            <InfoItem label="Low Stock Quantity Warning" value={product.lowStockQuantityWarning} />
            <InfoItem label="Unit" value={product.unit} />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Package className="w-5 h-5 mr-2" />
            Product Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Weight" value={`${product.weight} ${product.unit}`} />
            <InfoItem label="Purchasable" value={product.canPurchasable ? 'Yes' : 'No'} />
            <InfoItem label="Show Stock Out" value={product.showStockOut ? 'Yes' : 'No'} />
            <InfoItem label="Refundable" value={product.refundable ? 'Yes' : 'No'} />
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">Description</h4>
            <p className="text-sm text-gray-900">{product.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Tag className="w-5 h-5 mr-2" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap -mb-2 -mr-2">
            {renderTags()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

