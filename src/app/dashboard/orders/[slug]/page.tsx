'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import { axiosInstance } from "@/lib/axiosInstance"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Clock, CreditCard, Package2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type OrderStatus = "Pending" | "Accepted" | "Shipped" | "On the way" | "Delivered" | "Cancelled" | "Returned" | "Refunded"
type ReturnStatus = "Pending" | "Processed" | "Rejected"

interface OrderItem {
  productName: string
  productImage: string
  size: string
  color: string
  price: number
  quantity: number
}

interface OrderDetails {
  _id: string
  orderId: string
  orderStatus: OrderStatus
  returnStatus: ReturnStatus
  returnReason?: string
  paymentType: string
  orderType: string
  createdAt: string
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  shippingCharge: number
  total: number
  shippingAddress: {
    fullName: string
    email: string
    phone: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  billingAddress: {
    fullName: string
    email: string
    phone: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true)
        const response = await axiosInstance.get(`/orders/${params.slug}`)
        if (response.data && response.data.data) {
          setOrder(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load order details"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.slug) {
      fetchOrderDetails()
    }
  }, [params.slug, toast])

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    if (!order) return

    try {
      setIsUpdating(true)
      const response = await axiosInstance.put(`/orders/${order._id}`, {
        orderStatus: newStatus
      })
      
      if (response.data && response.data.data) {
        setOrder(response.data.data)
        toast({
          title: "Status Updated",
          description: `Order status has been updated to ${newStatus}`,
        })
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'on the way':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800'
      case 'returned':
        return 'bg-orange-100 text-orange-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Order ID: {order.orderId}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStatusColor(order.orderStatus)}>
                {order.orderStatus}
              </Badge>
              <Badge variant="secondary">
                {order.orderType}
              </Badge>
              {order.returnStatus !== "Pending" && (
                <Badge variant="outline">
                  Return {order.returnStatus}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={order.orderStatus}
              onValueChange={(value: OrderStatus) => updateOrderStatus(value)}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Accepted">Accept</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="On the way">On the way</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancel</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss')}
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Type: {order.paymentType}
          </div>
          <div className="flex items-center gap-2">
            <Package2 className="h-4 w-4" />
            Order Type: {order.orderType}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      width={60}
                      height={60}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.color} / {item.size}
                    </p>
                    <p className="text-sm">₹{item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Price Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Fee</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-₹{order.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charge</span>
                <span>₹{order.shippingCharge.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="space-y-2">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.phone}
              </p>
              <p className="text-sm">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && (
                  <>, {order.shippingAddress.addressLine2}</>
                )}
              </p>
              <p className="text-sm">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-sm">{order.shippingAddress.country}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
            <div className="space-y-2">
              <p className="font-medium">{order.billingAddress.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {order.billingAddress.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.billingAddress.phone}
              </p>
              <p className="text-sm">
                {order.billingAddress.addressLine1}
                {order.billingAddress.addressLine2 && (
                  <>, {order.billingAddress.addressLine2}</>
                )}
              </p>
              <p className="text-sm">
                {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
              </p>
              <p className="text-sm">{order.billingAddress.country}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

