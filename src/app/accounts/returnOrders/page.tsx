'use client'

import { Package } from 'lucide-react'
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const returnOrders = [
  {
    id: "0110243",
    products: "Nike Air Max 270",
    status: "Processing Return",
    amount: "₹278.00",
  },
  {
    id: "0110244",
    products: "Adidas Ultraboost",
    status: "Return Approved",
    amount: "₹399.00",
  },
  {
    id: "0110245",
    products: "Puma RS-X",
    status: "Return Completed",
    amount: "₹199.00",
  }
]

export default function ReturnOrders() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 p-6 bg-gradient-to-b from-primary/20 to-background rounded-lg">
        <h1 className="text-3xl font-bold flex items-center">
          <Package className="mr-3 h-8 w-8" />
          Return Orders
        </h1>
      </div>

      <Card className="border border-primary/20">
        <CardHeader className="bg-gradient-to-b from-primary/10 to-background">
          <CardTitle>Return Orders List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returnOrders.length > 0 ? (
                returnOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.products}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          order.status === "Processing Return" 
                            ? "secondary"
                            : order.status === "Return Approved"
                            ? "outline"
                            : "default"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No return orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <p className="text-sm text-muted-foreground mt-4">
        Showing 1 to {returnOrders.length} of {returnOrders.length} results
      </p>
    </div>
  )
}

