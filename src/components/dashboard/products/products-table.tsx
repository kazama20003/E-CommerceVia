'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Product } from "./product-form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Search, Eye, Pencil, Trash, Menu } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProductsTableProps {
  data: Product[]
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

type SortKey = 'name' | 'category' | 'buyingPrice' | 'sellingPrice' | 'status'

export function ProductsTable({ data, onView, onEdit, onDelete }: ProductsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')

  const sortedAndFilteredData = useMemo(() => {
    return data
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof product.category === 'object' && product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof product.category === 'string' && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortKey === 'category') {
          const aCategory = typeof a.category === 'object' ? a.category?.name : a.category
          const bCategory = typeof b.category === 'object' ? b.category?.name : b.category
          return sortOrder === 'asc' 
            ? aCategory.localeCompare(bCategory)
            : bCategory.localeCompare(aCategory)
        }
        if (sortKey === 'buyingPrice' || sortKey === 'sellingPrice') {
          return sortOrder === 'asc' 
            ? (a[sortKey] || 0) - (b[sortKey] || 0)
            : (b[sortKey] || 0) - (a[sortKey] || 0)
        }
        return sortOrder === 'asc' 
          ? a[sortKey].localeCompare(b[sortKey])
          : b[sortKey].localeCompare(a[sortKey])
      })
  }, [data, sortKey, sortOrder, searchTerm])

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => (
    sortKey === columnKey ? (
      sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
    ) : null
  )

  // Mobile product card component
  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-4"
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1">{product.name || 'N/A'}</h3>
              <p className="text-sm text-muted-foreground">
                {typeof product.category === 'object' && product.category 
                  ? product.category.name 
                  : (product.category || 'N/A')}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(product)}>
                  <Eye className="mr-2 h-4 w-4" /> Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(product)}>
                  <Trash className="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <p className="text-xs text-muted-foreground">Precio de compra</p>
              <p className="font-medium">S/ {product.buyingPrice?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Precio de venta</p>
              <p className="font-medium">S/ {product.sellingPrice?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
          <div className="mt-3">
            <Badge variant={product.status === 'In Stock' ? 'default' : 'secondary'}>
              {product.status === 'In Stock' ? 'En Stock' : 'Agotado'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSort('name')} className="whitespace-nowrap">
            Ordenar por nombre {sortKey === 'name' && <SortIcon columnKey="name" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSort('sellingPrice')} className="whitespace-nowrap">
            Por precio {sortKey === 'sellingPrice' && <SortIcon columnKey="sellingPrice" />}
          </Button>
        </div>
      </motion.div>

      {/* Mobile View */}
      <div className="block sm:hidden">
        <AnimatePresence>
          {sortedAndFilteredData.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </AnimatePresence>
      </div>

      {/* Desktop View */}
      <motion.div 
        className="hidden sm:block rounded-md border overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <ScrollArea className="h-[calc(100vh-300px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button variant="ghost" onClick={() => handleSort('name')} className="font-bold">
                    Nombre <SortIcon columnKey="name" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('category')} className="font-bold">
                    Categoría <SortIcon columnKey="category" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => handleSort('buyingPrice')} className="font-bold">
                    Precio de Compra <SortIcon columnKey="buyingPrice" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => handleSort('sellingPrice')} className="font-bold">
                    Precio de Venta <SortIcon columnKey="sellingPrice" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('status')} className="font-bold">
                    Estado <SortIcon columnKey="status" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {sortedAndFilteredData.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TableCell className="font-medium">{product.name || 'N/A'}</TableCell>
                    <TableCell>
                      {typeof product.category === 'object' && product.category ? product.category.name : (product.category || 'N/A')}
                    </TableCell>
                    <TableCell className="text-right">S/ {product.buyingPrice?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell className="text-right">S/ {product.sellingPrice?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'In Stock' ? 'default' : 'secondary'}>
                        {product.status === 'In Stock' ? 'En Stock' : 'Agotado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <ViewButton onClick={() => onView(product)} />
                        <EditButton onClick={() => onEdit(product)} />
                        <DeleteButton onClick={() => onDelete(product)} />
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </ScrollArea>
      </motion.div>
    </motion.div>
  )
}

interface ButtonProps {
  onClick: () => void;
  showText?: boolean;
}

export function ViewButton({ onClick }: ButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={onClick}>
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ver detalles</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function EditButton({ onClick }: ButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={onClick}>
            <Pencil className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Editar producto</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function DeleteButton({ onClick }: ButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={onClick}>
            <Trash className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Eliminar producto</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

