'use client'

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Ban, ChevronDown, ChevronUp, Package, Eye } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { axiosInstance } from '@/lib/axiosInstance'
import Link from "next/link"
import Cookies from "js-cookie"
import { toast } from "@/hooks/use-toast"
import { jwtDecode, JwtPayload } from "jwt-decode"

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

interface OrderItem {
  productName: string;
  quantity: number;
}

interface Order {
  _id: string;
  orderId: string;
  orderDate: string;
  orderStatus: "Pending" | "Accepted" | "Shipped" | "On the way" | "Delivered" | "Cancelled" | "Returned" | "Refunded";
  paymentType: string;
  total: number;
  items: OrderItem[];
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('No token found')
      }

      const response = await axiosInstance.get('/orders')
      setOrders(response.data.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const cancelOrder = async (orderId: string) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No token found');
      }
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      const userId = decodedToken.userId;

      await axiosInstance.put(`/orders/${orderId}`, {
        userId: userId,
        orderStatus: "Cancelled"
      });
      toast({
        title: "Order Cancelled",
        description: "Your order has been successfully cancelled.",
      });
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: Order['orderStatus']): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Pending": return "secondary"
      case "Accepted": return "secondary"
      case "Shipped": return "default"
      case "On the way": return "default"
      case "Delivered": return "default"
      case "Cancelled": return "destructive"
      case "Returned": return "destructive"
      case "Refunded": return "outline"
      default: return "default"
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Package className="mr-3 h-8 w-8" />
          Order History
        </h1>
      </div>
      <div className="hidden md:block p-4">
        <Card>
          <CardContent className="p-0">
            <Table className="w-full">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleString()}</TableCell>
                    <TableCell>{order.items.length} Product(s)</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.paymentType || 'N/A'}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/accounts/orderHistory/${order._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {order.orderStatus === "Pending" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => cancelOrder(order._id)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <Card key={order._id} className="shadow-md">
            <CardHeader className="bg-muted">
              <CardTitle className="flex justify-between items-center">
                <span>Order #{order.orderId}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleOrderDetails(order._id)}
                >
                  {expandedOrder === order._id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
              <CardDescription>{new Date(order.orderDate).toLocaleString()}</CardDescription>
            </CardHeader>
            {expandedOrder === order._id && (
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Products:</div>
                  <div>{order.items.length} Product(s)</div>
                  <div className="font-medium">Status:</div>
                  <div>
                    <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                  <div className="font-medium">Payment Type:</div>
                  <div>{order.paymentType || 'N/A'}</div>
                  <div className="font-medium">Amount:</div>
                  <div>${order.total.toFixed(2)}</div>
                </div>
              </CardContent>
            )}
            <CardFooter className="flex justify-end gap-2 bg-muted">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/accounts/orderHistory/${order._id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              {order.orderStatus === "Pending" && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => cancelOrder(order._id)}
                >
                  <Ban className="h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-between items-center text-sm text-muted-foreground">
        <p>
          Showing 1 to {orders.length} of {orders.length} results
        </p>
      </div>
    </div>
  )
}

