'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download, Eye, Filter, MoreVertical, PenToolIcon as Tool } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { axiosInstance } from "@/lib/axiosInstance"

interface Order {
  _id: string;
  orderId: string;
  orderType: string;
  shippingAddress: {
    fullName: string;
  };
  total: number;
  orderDate: string;
  orderStatus: string;
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
      case "canceled":
        return "bg-red-100 text-red-700 hover:bg-red-200"
      case "delivered":
        return "bg-green-100 text-green-700 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }
  }

  return (
    <Badge variant="secondary" className={getStatusStyles(status)}>
      {status}
    </Badge>
  )
}

function OrderCard({ order, onView }: { order: Order; onView: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm p-4 border"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">{order.orderId}</h3>
          <p className="text-sm text-muted-foreground">{order.shippingAddress.fullName}</p>
        </div>
        <Badge
          variant="secondary"
          className={
            order.orderType === "Online"
              ? "bg-orange-100 text-orange-700"
              : "bg-blue-100 text-blue-700"
          }
        >
          {order.orderType}
        </Badge>
      </div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalles
        </Button>
      </div>
    </motion.div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/orders');
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setOrders(response.data.data);
        } else {
          console.error('Formato de datos inválido recibido de la API');
          setOrders([]);
        }
      } catch (err) {
        console.error('Error al obtener pedidos:', err);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewOrder = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold mb-4 sm:mb-0 flex items-center">
          <Tool className="mr-2 h-6 w-6 text-orange-500" />
          Pedidos de Ferretería
        </h1>
        <div className="flex items-center gap-3">
          <Select defaultValue="10">
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">ID PEDIDO</TableHead>
                <TableHead>TIPO</TableHead>
                <TableHead>CLIENTE</TableHead>
                <TableHead>MONTO</TableHead>
                <TableHead>FECHA</TableHead>
                <TableHead>ESTADO</TableHead>
                <TableHead className="text-right">ACCIÓN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : Array.isArray(orders) && orders.length > 0 ? (
                  orders.map((order) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            order.orderType === "Online"
                              ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          }
                        >
                          {order.orderType}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.shippingAddress.fullName}</TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{new Date(order.orderDate).toLocaleTimeString()}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.orderStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewOrder(order._id)}>
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>Actualizar estado</DropdownMenuItem>
                              <DropdownMenuItem>Imprimir recibo</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No se encontraron pedidos
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="md:hidden space-y-4 mt-4">
        <AnimatePresence>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : Array.isArray(orders) && orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard key={order._id} order={order} onView={() => handleViewOrder(order._id)} />
            ))
          ) : (
            <div className="text-center py-8">No se encontraron pedidos</div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-4 sm:space-y-0">
        <p className="text-sm text-muted-foreground">
          Mostrando 1 a {orders.length} de {orders.length} entradas
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            1
          </Button>
          <Button variant="outline" size="icon">
            2
          </Button>
          <Button variant="ghost" size="icon" disabled>
            ...
          </Button>
          <Button variant="outline" size="icon">
            5
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

