import { Pencil, Trash2, MoreVertical, Plus } from 'lucide-react'
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
import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { axiosInstance } from '@/lib/axiosInstance'
import { useToast } from "@/hooks/use-toast"
import Image from 'next/image'
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
  onAddSubCategory: (categoryId: string, subCategoryName: string) => void
}

export function CategoryTable({ categories, onEdit, onDelete, onAddSubCategory }: CategoryTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [newSubCategoryName, setNewSubCategoryName] = useState('')
  const { toast } = useToast()

  const handleAddSubCategory = async () => {
    if (selectedCategoryId && newSubCategoryName.trim()) {
      try {
        await axiosInstance.post(`/categories/${selectedCategoryId}/subcategories`, {
          name: newSubCategoryName
        });
        onAddSubCategory(selectedCategoryId, newSubCategoryName);
        setIsDialogOpen(false);
        setNewSubCategoryName('');
        toast({
          title: "Subcategoría añadida con éxito",
          description: "La nueva subcategoría ha sido agregada a la categoría.",
        });
      } catch (error) {
        console.error('Error al añadir subcategoría:', error);
        toast({
          title: "Error al añadir subcategoría",
          description: "Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px] pl-4">Imagen</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="hidden md:table-cell">Subcategorías</TableHead>
            <TableHead className="hidden sm:table-cell">Estado</TableHead>
            <TableHead className="w-[80px] text-right pr-4">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category._id} className="hover:bg-transparent">
              <TableCell className="pl-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={category.image.url}
                  alt={category.name}
                  width={500}  // Ajusta el ancho según lo necesites
                  height={500} // Ajusta la altura según lo necesites
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
                  {category.status === 'Active' ? 'Activo' : 'Inactivo'}
                </span>
              </TableCell>
              <TableCell className="text-right pr-4">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(category)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(category._id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedCategoryId(category._id);
                        setIsDialogOpen(true);
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Añadir Subcategoría</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Subcategoría</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nombre de la subcategoría"
              value={newSubCategoryName}
              onChange={(e) => setNewSubCategoryName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddSubCategory}>Añadir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

