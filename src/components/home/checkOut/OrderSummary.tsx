import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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

interface CartData {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderSummaryProps {
  cartData: CartData
}

export function OrderSummary({ cartData }: OrderSummaryProps) {
  const calculateSubtotal = (): number => {
    return cartData.items.reduce((total, item) => {
      const variation = item.productId.variations.find(v => v._id === item.variationId)
      const price = variation ? variation.price : item.productId.sellingPrice
      return total + price * item.quantity
    }, 0)
  }

  const calculateTax = (): number => {
    return cartData.items.reduce((total, item) => total + (item.productId.tax * item.quantity), 0)
  }

  const shippingCharge: number = 0 // Assuming free shipping for now
  const discount: number = 0 // Assuming no discount for now

  const calculateTotal = (): number => calculateSubtotal() + calculateTax() + shippingCharge - discount

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">${calculateTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">${shippingCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium text-green-600">-${discount.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-base font-semibold">Total</span>
          <span className="text-lg font-bold">${calculateTotal().toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

