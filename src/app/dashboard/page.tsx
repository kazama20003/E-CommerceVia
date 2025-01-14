"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, Package, Clock, CheckCircle, Loader, Send, XCircle } from 'lucide-react'
import { axiosInstance } from "@/lib/axiosInstance"
import Cookies from 'js-cookie'
import { jwtDecode } from "jwt-decode"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { addDays, format } from "date-fns"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DateRange } from "react-day-picker"
import { motion } from "framer-motion"

interface DashboardMetrics {
  totalOrders: number
  totalCustomers: number
  totalEarning: number
  totalProducts: number
}

interface OrderStats {
  _id: string
  count: number
}

interface TopCustomer {
  _id: string
  fullName: string
  totalOrders: number
}

interface SalesSummary {
  totalSales: number
  avgSalesPerDay: number
  dailySales: { date: string; sales: number }[]
}

interface User {
  _id: string
  name: string
  email: string
}

interface Summary {
  salesSummary: SalesSummary
  orderSummary: {
    totalOrders: number
    orderStatusSummary: {
      Delivered?: number
      Cancelled?: number
      Rejected?: number
    }
  }
  customerActivity: { _id: string; count: number }[]
  topCustomers: TopCustomer[]
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [orderStats, setOrderStats] = useState<OrderStats[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('token')
      if (token) {
        try {
          const decodedToken = jwtDecode(token) as { userId: string }
          const response = await axiosInstance.get(`/users/${decodedToken.userId}`)
          if (response.data.status && response.data.user) {
            setUser(response.data.user)
          } else {
            console.error("User data not found in response")
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, orderStatsRes, summaryRes] = await Promise.all([
          axiosInstance.get("/dashboard/metrics", { params: { from: dateRange?.from, to: dateRange?.to } }),
          axiosInstance.get("/dashboard/order-stats", { params: { from: dateRange?.from, to: dateRange?.to } }),
          axiosInstance.get("/dashboard/summary", { params: { from: dateRange?.from, to: dateRange?.to } })
        ])

        setMetrics(metricsRes.data.data)
        setOrderStats(orderStatsRes.data.data)
        setSummary(summaryRes.data.data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [dateRange])

  const getOrderStatCount = (status: string) => {
    const stat = orderStats.find(s => s._id === status)
    return stat ? stat.count.toString() : "0"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-1"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-primary">
          ¡Buenos {getGreeting()}!
        </h2>
        <p className="text-sm sm:text-base text-gray-500">{user ? user.name : 'Cargando...'}</p>
      </motion.div>

      {/* Date Range Picker */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex justify-end"
      >
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      </motion.div>

      {/* Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-lg font-medium mb-2 sm:mb-4">Resumen General</h3>
        <div className="grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
            title="Ganancias Totales"
            value={`$${metrics?.totalEarning || 0}`}
            icon={DollarSign}
            color="bg-pink-500"
          />
          <OverviewCard
            title="Pedidos Totales"
            value={metrics?.totalOrders || 0}
            icon={ShoppingCart}
            color="bg-orange-500"
          />
          <OverviewCard
            title="Clientes Totales"
            value={metrics?.totalCustomers || 0}
            icon={Users}
            color="bg-purple-500"
          />
          <OverviewCard
            title="Productos Totales"
            value={metrics?.totalProducts || 0}
            icon={Package}
            color="bg-blue-500"
          />
        </div>
      </motion.div>

      {/* Order Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-lg font-medium mb-2 sm:mb-4">Estadísticas de Pedidos</h3>
        <div className="grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard icon={ShoppingCart} label="Total Pedidos" value={metrics?.totalOrders.toString() || "0"} />
          <StatCard icon={Clock} label="Pendientes" value={getOrderStatCount("Pending")} />
          <StatCard icon={Send} label="Enviados" value={getOrderStatCount("Shipped")} />
          <StatCard icon={CheckCircle} label="Entregados" value={getOrderStatCount("Delivered")} />
          <StatCard icon={XCircle} label="Cancelados" value={getOrderStatCount("Cancelled")} />
          <StatCard icon={XCircle} label="Rechazados" value={summary?.orderSummary.orderStatusSummary.Rejected?.toString() || "0"} />
        </div>
      </motion.div>

      {/* Summary Section */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-medium mb-2 sm:mb-4">Resumen de Ventas</h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xl sm:text-2xl font-bold">${summary?.salesSummary.totalSales || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Ventas Totales</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">${summary?.salesSummary.avgSalesPerDay || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Promedio Diario</p>
                </div>
              </div>
              <ChartContainer
                config={{
                  sales: {
                    label: "Ventas",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[200px] sm:h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary?.salesSummary.dailySales || []}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-medium mb-2 sm:mb-4">Resumen de Pedidos</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="text-center">
                <p className="text-base sm:text-lg font-medium">Total de Pedidos</p>
                <p className="text-2xl sm:text-3xl font-bold">{summary?.orderSummary.totalOrders || 0}</p>
              </div>
            </div>
            <ChartContainer
              config={{
                delivered: {
                  label: "Entregados",
                  color: "hsl(var(--success))",
                },
                cancelled: {
                  label: "Cancelados",
                  color: "hsl(var(--warning))",
                },
                rejected: {
                  label: "Rechazados",
                  color: "hsl(var(--destructive))",
                },
              }}
              className="h-[150px] sm:h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: 'Entregados', value: summary?.orderSummary.orderStatusSummary.Delivered || 0 },
                    { name: 'Cancelados', value: summary?.orderSummary.orderStatusSummary.Cancelled || 0 },
                    { name: 'Rechazados', value: summary?.orderSummary.orderStatusSummary.Rejected || 0 },
                  ]}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </motion.div>
      </div>

      {/* Customer Section */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-medium mb-2 sm:mb-4">Actividad de Clientes</h3>
            <ChartContainer
              config={{
                activity: {
                  label: "Actividad",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[150px] sm:h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary?.customerActivity || []}>
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-medium mb-2 sm:mb-4">Mejores Clientes</h3>
            <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {summary?.topCustomers.map((customer: TopCustomer) => (
                <CustomerCard 
                  key={customer._id}
                  name={customer.fullName}
                  orders={customer.totalOrders}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function OverviewCard({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <Card className={`p-3 sm:p-4 ${color} text-white`}>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
        <div>
          <p className="text-xs sm:text-sm font-medium">{title}</p>
          <h4 className="text-lg sm:text-2xl font-bold">{value}</h4>
        </div>
      </div>
    </Card>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs sm:text-sm font-medium text-gray-500">{label}</p>
          <p className="text-base sm:text-lg font-bold">{value}</p>
        </div>
      </div>
    </Card>
  )
}

function CustomerCard({ name, orders }: { name: string; orders: number }) {
  return (
    <div className="text-center p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full mx-auto mb-2 flex items-center justify-center">
        <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
      </div>
      <h4 className="text-sm sm:text-base font-medium">{name}</h4>
      <p className="text-xs sm:text-sm text-primary">{orders} Pedidos</p>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Días"
  if (hour < 18) return "Tardes"
  return "Noches"
}

