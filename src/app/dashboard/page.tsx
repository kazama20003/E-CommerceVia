"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, Package, Clock, CheckCircle, Loader, Send, XCircle, RotateCcw } from 'lucide-react'
import { axiosInstance } from "@/lib/axiosInstance"
import Cookies from 'js-cookie'
import { jwtDecode } from "jwt-decode"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { addDays, format } from "date-fns"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DateRange } from "react-day-picker"

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


export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [orderStats, setOrderStats] = useState<OrderStats[]>([])
  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState<any>(null)
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
          console.log(response);
          
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
        const [metricsRes, orderStatsRes, productsRes, summaryRes] = await Promise.all([
          axiosInstance.get("/dashboard/metrics", { params: { from: dateRange?.from, to: dateRange?.to } }),
          axiosInstance.get("/dashboard/order-stats", { params: { from: dateRange?.from, to: dateRange?.to } }),
          axiosInstance.get("/products"),
          axiosInstance.get("/dashboard/summary", { params: { from: dateRange?.from, to: dateRange?.to } })
        ])

        setMetrics(metricsRes.data.data)
        setOrderStats(orderStatsRes.data.data)
        setProducts(productsRes.data.data)
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
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-red-500">
          Buenos {getGreeting()}!
        </h2>
        <p className="text-gray-500">{user ? user.name : 'Loading...'}</p>
      </div>

      {/* Date Range Picker */}
      <div className="flex justify-end">
        <DatePickerWithRange date={dateRange} setDate={(newDateRange: DateRange | undefined) => setDateRange(newDateRange)} />
      </div>

      {/* Overview */}
      <div>
        <h3 className="text-lg font-medium mb-4">Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 bg-pink-500 text-white">
            <div className="flex items-center space-x-4">
              <DollarSign className="h-6 w-6" />
              <div>
                <p className="text-sm font-medium">Total Earnings</p>
                <h4 className="text-2xl font-bold">${metrics?.totalEarning || 0}</h4>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-orange-500 text-white">
            <div className="flex items-center space-x-4">
              <ShoppingCart className="h-6 w-6" />
              <div>
                <p className="text-sm font-medium">Total Orders</p>
                <h4 className="text-2xl font-bold">{metrics?.totalOrders || 0}</h4>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-purple-500 text-white">
            <div className="flex items-center space-x-4">
              <Users className="h-6 w-6" />
              <div>
                <p className="text-sm font-medium">Total Customers</p>
                <h4 className="text-2xl font-bold">{metrics?.totalCustomers || 0}</h4>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-blue-500 text-white">
            <div className="flex items-center space-x-4">
              <Package className="h-6 w-6" />
              <div>
                <p className="text-sm font-medium">Total Products</p>
                <h4 className="text-2xl font-bold">{metrics?.totalProducts || 0}</h4>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Order Statistics */}
      <div>
        <h3 className="text-lg font-medium mb-4">Order Statistics</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={ShoppingCart} label="Total Orders" value={metrics?.totalOrders.toString() || "0"} />
          <StatCard icon={Clock} label="Pending" value={getOrderStatCount("Pending")} />
          <StatCard icon={Send} label="Shipped" value={getOrderStatCount("Shipped")} />
          <StatCard icon={CheckCircle} label="Delivered" value={getOrderStatCount("Delivered")} />
          <StatCard icon={XCircle} label="Cancelled" value={getOrderStatCount("Cancelled")} />
          <StatCard icon={XCircle} label="Rejected" value={summary?.orderSummary?.orderStatusSummary?.Rejected?.toString() || "0"} />
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Sales Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">${summary?.salesSummary?.totalSales || 0}</p>
                <p className="text-sm text-gray-500">Total Sales</p>
              </div>
              <div>
                <p className="text-2xl font-bold">${summary?.salesSummary?.avgSalesPerDay || 0}</p>
                <p className="text-sm text-gray-500">Avg Sales Per Day</p>
              </div>
            </div>
            <ChartContainer
              config={{
                sales: {
                  label: "Sales",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary?.salesSummary?.dailySales || []}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--color-sales)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Orders Summary</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <p className="text-lg font-medium">Total Orders</p>
              <p className="text-3xl font-bold">{summary?.orderSummary?.totalOrders || 0}</p>
            </div>
          </div>
          <ChartContainer
            config={{
              delivered: {
                label: "Delivered",
                color: "hsl(var(--chart-1))",
              },
              cancelled: {
                label: "Cancelled",
                color: "hsl(var(--chart-2))",
              },
              rejected: {
                label: "Rejected",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { name: 'Delivered', value: summary?.orderSummary?.orderStatusSummary?.Delivered || 0 },
                  { name: 'Cancelled', value: summary?.orderSummary?.orderStatusSummary?.Cancelled || 0 },
                  { name: 'Rejected', value: summary?.orderSummary?.orderStatusSummary?.Rejected || 0 },
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="value" stroke="var(--color-delivered)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      </div>

      {/* Customer Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Customer Activity</h3>
          <ChartContainer
            config={{
              activity: {
                label: "Activity",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary?.customerActivity || []}>
                <XAxis dataKey="_id" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="var(--color-activity)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Top Customers</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {summary?.topCustomers?.map((customer: TopCustomer) => (
              <CustomerCard 
                key={customer._id}
                name={customer.fullName}
                orders={customer.totalOrders}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-gray-100 rounded-full">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </Card>
  )
}

function CustomerCard({ name, orders }: { name: string; orders: number }) {
  return (
    <div className="text-center p-4 border rounded-lg">
      <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto mb-2"></div>
      <h4 className="font-medium">{name}</h4>
      <p className="text-sm text-blue-500">{orders} Orders</p>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Dias"
  if (hour < 18) return "Tarde"
  return "Evening"
}

