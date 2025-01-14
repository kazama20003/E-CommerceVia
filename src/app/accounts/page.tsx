'use client'

import { useState, useEffect } from 'react'
import { User, ShoppingBag, CheckCircle, RotateCcw, Wallet, ChevronRight } from 'lucide-react'
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from 'next/link'
import { axiosInstance } from '@/lib/axiosInstance'
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

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

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Skeleton className="h-4 w-[100px]" />
        </CardTitle>
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-[60px]" />
      </CardContent>
    </Card>
  )
}

function MobileOrderList({ orders, getStatusBadgeStyles, getPaymentBadgeStyles }: {
  orders: Order[];
  getStatusBadgeStyles: (status: string) => string;
  getPaymentBadgeStyles: (type: string) => string;
}) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order._id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">#{order.orderId}</p>
                <p className="text-sm text-muted-foreground">{order.items.length} artículo(s)</p>
              </div>
              <Badge 
                variant="secondary"
                className={getStatusBadgeStyles(order.orderStatus)}
              >
                {order.orderStatus}
              </Badge>
            </div>
            <div className="flex justify-between items-center mb-2">
              <Badge 
                variant="outline"
                className={getPaymentBadgeStyles(order.paymentType)}
              >
                {order.paymentType}
              </Badge>
              <p className="font-semibold">S/ {order.total.toFixed(2)}</p>
            </div>
            <Button variant="ghost" size="sm" className="w-full text-primary" asChild>
              <Link href={`/accounts/orderHistory/${order._id}`}>
                Ver Detalles
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function Overview() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get('token')
        if (!token) {
          throw new Error('No se encontró el token')
        }

        const response = await axiosInstance.get('/orders')
        const orders: Order[] = response.data.data

        const totalOrders = orders.length
        const totalCompleted = orders.filter(order => order.orderStatus === 'Enviado').length
        const totalReturned = orders.filter(order => order.orderStatus === 'Devuelto').length
        const walletBalance = '0.00'

        setUserData({
          name: 'Usuario',
          totalOrders,
          totalCompleted,
          totalReturned,
          walletBalance,
          recentOrders: orders.slice(0, 5)
        })
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error)
        setError(error instanceof Error ? error.message : 'Error al cargar los datos del usuario')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const stats = [
    {
      title: "Total Pedidos",
      value: userData?.totalOrders.toString() || "0",
      icon: ShoppingBag,
      color: "text-pink-500",
      bgColor: "bg-pink-100",
    },
    {
      title: "Total Completados",
      value: userData?.totalCompleted.toString() || "0",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Devueltos",
      value: userData?.totalReturned.toString() || "0",
      icon: RotateCcw,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      title: "Saldo Billetera",
      value: `S/ ${userData?.walletBalance || "0.00"}`,
      icon: Wallet,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
  ]

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Enviado':
        return 'bg-green-100 text-green-700 hover:bg-green-200'
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      case 'Cancelado':
        return 'bg-red-100 text-red-700 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
  }

  const getPaymentBadgeStyles = (type: string) => {
    return type === 'Tarjeta de Crédito'
      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
      : 'bg-green-100 text-green-700 hover:bg-green-200'
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="text-destructive text-lg font-medium">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Intentar de nuevo
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full h-full p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <User className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              `¡Bienvenido de vuelta, ${userData?.name}!`
            )}
          </h1>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
          <Link href="/accounts/settings">
            Administrar Cuenta
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {isLoading
          ? Array(4).fill(0).map((_, i) => <StatsCardSkeleton key={i} />)
          : stats.map((stat, index) => (
            <Card key={index} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Card className="w-full mb-6 md:mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Historial de Pedidos</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary" asChild>
            <Link href="/accounts/orderHistory" className="flex items-center">
              Ver Todo
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-[100px] w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="hidden sm:block">
                <ScrollArea className="h-[300px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID Pedido</TableHead>
                        <TableHead className="hidden sm:table-cell">Productos</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="hidden md:table-cell">Pago</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-right w-[100px]">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userData?.recentOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">
                            <span className="hidden xs:inline">#</span>{order.orderId}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{order.items.length}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={getStatusBadgeStyles(order.orderStatus)}
                            >
                              {order.orderStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge 
                              variant="outline"
                              className={getPaymentBadgeStyles(order.paymentType)}
                            >
                              {order.paymentType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">S/ {order.total.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90" asChild>
                              <Link href={`/accounts/orderHistory/${order._id}`}>
                                Ver
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              <div className="sm:hidden">
                <MobileOrderList 
                  orders={userData?.recentOrders || []}
                  getStatusBadgeStyles={getStatusBadgeStyles}
                  getPaymentBadgeStyles={getPaymentBadgeStyles}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

