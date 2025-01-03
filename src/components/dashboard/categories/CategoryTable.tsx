import { Pencil, Trash2, MoreVertical } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SubCategory {
  _id: string;
  name: string;
  category: string[];
}

interface Category {
  _id: string;
  name: string;
  description: string;
  subCategory: SubCategory[];
  image: {
    url: string;
    id: string;
  };
  status: 'Active' | 'Inactive';
}

export interface CategoryTableProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px] pl-4">Image</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="hidden md:table-cell">Subcategories</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="w-[80px] text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category._id} className="hover:bg-transparent">
              <TableCell className="pl-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                  <img 
                    src={category.image.url} 
                    alt={category.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">
                <div>{category.name}</div>
                <div className="text-sm text-muted-foreground md:hidden">
                  {category.subCategory.map(sub => sub.name).join(', ')}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {category.subCategory.map(sub => sub.name).join(', ')}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  category.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {category.status}
                </span>
              </TableCell>
              <TableCell className="text-right pr-4">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(category)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(category._id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

