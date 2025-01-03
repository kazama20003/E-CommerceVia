import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'
import { Minus, Plus, X, ShoppingCart } from 'lucide-react'
import Image from 'next/image'

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

interface CartStepProps {
  items: CartItem[]
  onQuantityChange: (itemId: string, change: number) => void
  onRemoveItem: (itemId: string) => void
  onProceedToCheckout: () => void
}

export function CartStep({ items, onQuantityChange, onRemoveItem, onProceedToCheckout }: CartStepProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding some items to your cart.</p>
        <div className="mt-6">
          <Button onClick={() => {/* Navigate to products page */}}>
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const variation = item.productId.variations.find(v => v._id === item.variationId)
        return (
          <Card key={item._id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden">
                  <Image
                    src={item.productId.images[0]?.url || "/placeholder.svg"}
                    alt={item.productId.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-gray-900">
                    {item.productId.name}
                  </h3>
                  {variation && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="secondary">Color: {variation.color}</Badge>
                      <Badge variant="secondary">Size: {variation.size}</Badge>
                      <Badge variant="secondary">SKU: {variation.sku}</Badge>
                    </div>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    ${(variation ? variation.price : item.productId.sellingPrice).toFixed(2)}
                  </p>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center border rounded-md">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onQuantityChange(item._id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onQuantityChange(item._id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRemoveItem(item._id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      <Button 
        className="w-full"
        onClick={onProceedToCheckout}
      >
        Proceed to Checkout
      </Button>
    </div>
  )
}

