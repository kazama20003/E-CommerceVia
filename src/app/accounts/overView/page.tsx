'use client'

import { useState, useEffect } from 'react'
import { User, ShoppingBag, CheckCircle, RotateCcw, Wallet } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import Link from 'next/link'
import { axiosInstance } from '@/lib/axiosInstance'
import Cookies from "js-cookie"

interface OrderItem {
  productName: string;
  quantity: number;
}

interface Order {
  _id: string;
  orderId: string;
  orderStatus: string;
  paymentType: string;
  total: number;
  items: OrderItem[];
}

interface UserData {
  name: string;
  totalOrders: number;
  totalCompleted: number;
  totalReturned: number;
  walletBalance: string;
  recentOrders: Order[];
}

export default function Overview() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get('token')
        if (!token) {
          throw new Error('No token found')
        }

        const response = await axiosInstance.get('/orders')
        const orders: Order[] = response.data.data

        const totalOrders = orders.length
        const totalCompleted = orders.filter(order => order.orderStatus === 'Shipped').length
        const totalReturned = orders.filter(order => order.orderStatus === 'Returned').length
        const walletBalance = '0.00'

        setUserData({
          name: 'User',
          totalOrders,
          totalCompleted,
          totalReturned,
          walletBalance,
          recentOrders: orders.slice(0, 5)
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!userData) {
    return <div className="flex items-center justify-center h-full">Error loading user data</div>
  }

  const stats = [
    {
      title: "Total Orders",
      value: userData?.totalOrders.toString() || "0",
      icon: ShoppingBag,
      color: "bg-pink-500",
      iconBg: "bg-pink-100",
    },
    {
      title: "Total Completed",
      value: userData?.totalCompleted.toString() || "0",
      icon: CheckCircle,
      color: "bg-orange-500",
      iconBg: "bg-orange-100",
    },
    {
      title: "Total Returned",
      value: userData?.totalReturned.toString() || "0",
      icon: RotateCcw,
      color: "bg-purple-500",
      iconBg: "bg-purple-100",
    },
    {
      title: "Wallet Balance",
      value: userData?.walletBalance || "0.00",
      icon: Wallet,
      color: "bg-blue-500",
      iconBg: "bg-blue-100",
    },
  ]

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8" />
        <h1 className="text-2xl font-bold">Welcome Back, {userData.name}!</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color.replace('bg-', 'text-').replace('500', '600')}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Order History</h2>
          <Button variant="ghost" asChild className="text-orange-500 hover:text-orange-600">
            <Link href="/account/order-history">
              Show Full History
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userData.recentOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">#{order.orderId}</TableCell>
                  <TableCell>{order.items.length} Product(s)</TableCell>
                  <TableCell>
                    <Badge 
                      variant={order.orderStatus === "Shipped" ? "default" : "secondary"}
                      className={
                        order.orderStatus === "Shipped" 
                          ? "bg-green-100 text-green-700 hover:bg-green-100" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                      }
                    >
                      {order.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={
                        order.paymentType === "Credit Card"
                          ? "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200"
                          : "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                      }
                    >
                      {order.paymentType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-600" asChild>
                      <Link href={`/accounts/orderHistory/${order._id}`}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

