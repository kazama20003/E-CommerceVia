'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ViewButton } from "./view-button"
import { EditButton } from "./edit-button"
import { DeleteButton } from "./delete-button"
import { Badge } from "@/components/ui/badge"
import { Product } from "./product-form"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ProductsTableProps {
  data: Product[]
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductsTable({ data, onView, onEdit, onDelete }: ProductsTableProps) {
  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[calc(100vh-200px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Buying Price</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="hidden lg:table-cell">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, index) => (
              <TableRow key={product._id || index}>
                <TableCell className="font-medium">{product.name || 'N/A'}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {typeof product.category === 'object' && product.category ? product.category.name : (product.category || 'N/A')}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right">${product.buyingPrice?.toFixed(2) || 'N/A'}</TableCell>
                <TableCell className="text-right">${product.sellingPrice?.toFixed(2) || 'N/A'}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline">{product.status || 'N/A'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <ViewButton onClick={() => onView(product)} />
                    <EditButton onClick={() => onEdit(product)} />
                    <DeleteButton onClick={() => onDelete(product)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}

