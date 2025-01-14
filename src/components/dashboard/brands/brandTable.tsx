'use client'

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from 'next/image'
interface Brand {
  _id: string
  name: string
  description: string
  image: {
    url: string
    id: string
  }
  status: 'active' | 'inactive'
}

interface BrandTableProps {
  brands: Brand[]
  onEdit: (brand: Brand) => void
  onDelete: (id: string) => void
}

export function BrandTable({ brands, onEdit, onDelete }: BrandTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Name</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead className="hidden sm:table-cell w-[100px]">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand._id}>
              <TableCell className="font-medium">{brand.name}</TableCell>
              <TableCell className="hidden md:table-cell">{brand.description}</TableCell>
              <TableCell>
                {brand.image && brand.image.url ? (
                  <Image
                  src={brand.image.url}
                  alt={`Image for ${brand.name}`}
                  width={40}   // Ajusta el ancho según lo que necesites
                  height={40}  // Ajusta la altura según lo que necesites
                  className="object-cover rounded"
                />
                ) : (
                  <span className="text-muted-foreground">No image</span>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{brand.status}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(brand)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(brand._id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

