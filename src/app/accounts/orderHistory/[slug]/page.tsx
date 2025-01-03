'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { axiosInstance } from "@/lib/axiosInstance"

interface Address {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderItem {
  productName: string;
  quantity: number;
  productImage: string;
  color: string;
  size: string;
  price: number;
  sku: string;
  _id: string;
}

interface Order {
  _id: string;
  orderId: string;
  orderDate: string;
  orderType: string;
  orderStatus: "Pending" | "Accepted" | "Shipped" | "On the way" | "Delivered" | "Cancelled" | "Returned" | "Refunded";
  paymentType: string;
  returnStatus: string;
  total: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  tax: number;
  shippingCharge: number;
  discount: number;
}

const orderStatusSteps = [
  { status: "Pending", label: "Order\nPending" },
  { status: "Accepted", label: "Order\nConfirmed" },
  { status: "Shipped", label: "Order\nShipped" },
  { status: "On the way", label: "Order\nOn the way" },
  { status: "Delivered", label: "Order\nDelivered" },
];

export default function OrderDetails() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const orderId = params?.slug
        if (!orderId) {
          throw new Error('Order ID is missing from URL parameters')
        }
        const response = await axiosInstance.get(`/orders/${orderId}`)
        setOrder(response.data.data)
      } catch (error) {
        console.error('Error fetching order details:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [params])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">Error: {error}</div>
  }

  if (!order) {
    return <div className="flex items-center justify-center min-h-screen">Order not found</div>
  }

  const getStepStatus = (stepStatus: string) => {
    const currentStatusIndex = orderStatusSteps.findIndex(step => step.status === order.orderStatus);
    const stepIndex = orderStatusSteps.findIndex(step => step.status === stepStatus);

    if (stepIndex < currentStatusIndex) return 'completed';
    if (stepIndex === currentStatusIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Thank You</CardTitle>
          <p className="text-muted-foreground">Your Order status is as follows</p>
          <p className="font-medium">Order ID: <span className="text-primary">{order.orderId}</span></p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Progress Tracker */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-between">
              {orderStatusSteps.map((step, index) => {
                const status = getStepStatus(step.status);
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                      ${status === 'current' ? 'bg-primary border-primary text-primary-foreground' : 
                      status === 'completed' ? 'bg-primary border-primary text-primary-foreground' :
                      'bg-background border-muted text-muted-foreground'}`}>
                      {status === 'current' && '●'}
                      {status === 'completed' && '✓'}
                    </div>
                    <div className="mt-2 text-center whitespace-pre-line text-sm">
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Order Information */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span>{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span>{new Date(order.orderDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Type:</span>
                  <span>{order.orderType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Status:</span>
                  <Badge variant="secondary">{order.orderStatus}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Type:</span>
                  <span>{order.paymentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Return Status:</span>
                  <Badge variant={order.returnStatus === "Pending" ? "secondary" : "default"}>{order.returnStatus}</Badge>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <h3 className="font-semibold">Shipping Address</h3>
                <div className="space-y-1">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.email}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  <p>{order.shippingAddress.addressLine2}</p>
                  <p>{`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-2">
                <h3 className="font-semibold">Billing Address</h3>
                <div className="space-y-1">
                  <p>{order.billingAddress.fullName}</p>
                  <p>{order.billingAddress.phone}</p>
                  <p>{order.billingAddress.email}</p>
                  <p>{order.billingAddress.addressLine1}</p>
                  <p>{order.billingAddress.addressLine2}</p>
                  <p>{`${order.billingAddress.city}, ${order.billingAddress.state} ${order.billingAddress.postalCode}`}</p>
                  <p>{order.billingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <Image
                        src={item.productImage || '/placeholder.svg'}
                        alt={item.productName || 'Product'}
                        width={64}
                        height={64}
                        className="rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName || 'Unknown Product'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.color || 'N/A'} | {item.size || 'N/A'}
                        </p>
                        <div className="flex justify-between mt-1">
                          <span>${(item.price || 0).toFixed(2)}</span>
                          <span>Quantity: {item.quantity || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No items in this order.</p>
                )}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(order.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(order.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Charge</span>
                    <span>${(order.shippingCharge || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>${(order.discount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>${(order.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button>Download Receipt</Button>
            <Button variant="outline">Cancel Order</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

