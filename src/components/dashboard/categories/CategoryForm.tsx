'use client'

import { useCallback, useState, useEffect, useMemo } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { X, Upload, AlertCircle } from 'lucide-react'
import { axiosInstance } from '@/lib/axiosInstance'
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from 'next/image'

interface Image {
  url: string;
  id: string;
}

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
  image: Image;
  status: 'Active' | 'Inactive';
}

type Status = 'Active' | 'Inactive';

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Category) => void;
  initialCategory: Category | null;
}

interface ImageUploadProps {
  imageUrl: string;
  setFieldValue: (field: string, value: Image) => void;
  values: Category;
}

const CategorySchema = Yup.object().shape({
  name: Yup.string().required('El nombre de la categoría es obligatorio'),
  description: Yup.string().required('La descripción es obligatoria'),
  status: Yup.string().oneOf(['Active', 'Inactive']).required('El estado es obligatorio'),
})

const ImageUpload = ({ imageUrl, setFieldValue, values }: ImageUploadProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      if (values.image.id) {
        await axiosInstance.delete(`/upload/${values.image.id}`);
      }

      const response = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFieldValue('image', {
        url: response.data.result.secure_url,
        id: response.data.result.public_id,
      });
    } catch (error) {
      console.error('Error al manejar la imagen:', error);
      toast({
        title: "Error al procesar la imagen",
        description: "Por favor, inténtalo de nuevo",
        variant: "destructive",
      });
    }
  }, [setFieldValue, toast, values.image.id]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }, [handleImageUpload])

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload">Imagen de la Categoría</Label>
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          id="image-upload"
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
          }}
          accept="image/*"
          className="hidden"
        />

        {imageUrl ? (
          <div className="relative group">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt="Vista previa de la categoría"
              width={500}
              height={200}
              className="object-contain rounded-md"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setFieldValue('image', { url: '', id: '' })}
              >
                Cambiar Imagen
              </Button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center h-48 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            <Upload className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Arrastra una imagen aquí o haz clic para subir</span>
            <span className="text-xs mt-1">PNG, JPG hasta 10MB</span>
          </label>
        )}
      </div>
    </div>
  )
}

export function CategoryForm({ open, onOpenChange, onSubmit, initialCategory }: CategoryFormProps) {
  const { toast } = useToast()
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [internalOpen, setInternalOpen] = useState(open)

  const fetchSubCategories = useCallback(async (categoryId: string) => {
    try {
      const response = await axiosInstance.get(`/categories/${categoryId}/subcategories`)
      setSubCategories(response.data)
    } catch (error) {
      console.error('Error al obtener subcategorías:', error)
      toast({
        title: "Error al obtener las subcategorías",
        description: "Por favor, inténtalo de nuevo",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    setInternalOpen(open)
    if (open && initialCategory?._id) {
      fetchSubCategories(initialCategory._id)
    } else {
      setSubCategories([])
    }
  }, [open, initialCategory, fetchSubCategories])

  const initialValues = useMemo(() => ({
    _id: initialCategory?._id ?? '',
    name: initialCategory?.name ?? '',
    description: initialCategory?.description ?? '',
    subCategory: initialCategory?.subCategory ?? [],
    image: initialCategory?.image ?? { url: '', id: '' },
    status: initialCategory?.status ?? 'Active',
  }), [initialCategory])

  const handleDialogClose = useCallback(() => {
    setInternalOpen(false);
    onOpenChange(false);
    setSubCategories([]);
    setIsSubmitting(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async (values: Omit<Category, '_id'> & { _id?: string }) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const categoryData = {
        name: values.name,
        description: values.description,
        image: values.image,
        status: values.status,
      };

      let savedCategory: Category;
      if (values._id) {
        const response = await axiosInstance.put(`/categories/${values._id}`, categoryData);
        savedCategory = response.data;
      } else {
        const response = await axiosInstance.post('/categories', categoryData);
        savedCategory = response.data;
      }

      onSubmit(savedCategory);

      toast({
        title: "Categoría enviada con éxito",
        description: "La categoría ha sido añadida/actualizada.",
      });
      handleDialogClose();
    } catch (error) {
      console.error('Error al enviar la categoría:', error);
      toast({
        title: "Error al enviar la categoría",
        description: error instanceof Error ? error.message : "Por favor, inténtalo de nuevo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, toast, isSubmitting, handleDialogClose]);

  const handleRemoveSubCategory = useCallback(async (subCategoryId: string) => {
    if (!initialCategory?._id) return;

    try {
      await axiosInstance.delete(`/categories/${initialCategory._id}/subcategories/${subCategoryId}`);
    
      setSubCategories(prev => prev.filter(sc => sc._id !== subCategoryId));
      toast({
        title: "Subcategoría eliminada con éxito",
        description: "La subcategoría ha sido eliminada.",
      });
    } catch (error) {
      console.error('Error al eliminar la subcategoría:', error);
      toast({
        title: "Error al eliminar la subcategoría",
        description: "Por favor, inténtalo de nuevo. Si el problema persiste, contacta con soporte.",
        variant: "destructive",
      });
    }
  }, [initialCategory, toast]);

  return (
    <Dialog open={internalOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-auto max-h-[90vh]">
        <DialogHeader className="p-6 border-b bg-muted/10 sticky top-0 z-10">
          <DialogTitle className="text-xl">
            {initialCategory ? 'Editar Categoría' : 'Añadir Nueva Categoría'}
          </DialogTitle>
          <DialogDescription>
            {initialCategory ? 'Actualiza los detalles de una categoría existente.' : 'Crea una nueva categoría para tus productos.'}
          </DialogDescription>
          <DialogClose onClick={handleDialogClose} />
        </DialogHeader>
        
        <Formik
          initialValues={initialValues}
          validationSchema={CategorySchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form className="space-y-6 p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Categoría</Label>
                  <Field 
                    name="name" 
                    as={Input} 
                    id="name"
                    className={errors.name && touched.name ? "border-destructive" : ""}
                  />
                  {errors.name && touched.name && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.name}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Field name="status">
                  {({ field }: { field: { value: Status } }) => (
                    <Select
                      onValueChange={(value: Status) => setFieldValue('status', value)} 
                      defaultValue={field.value}
                    >
                        <SelectTrigger 
                          id="status"
                          className={errors.status && touched.status ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Activo</SelectItem>
                          <SelectItem value="Inactive">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                  {errors.status && touched.status && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.status}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Field 
                  name="description" 
                  as={Textarea} 
                  id="description"
                  className={`min-h-[100px] ${errors.description && touched.description ? "border-destructive" : ""}`}
                />
                {errors.description && touched.description && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.description}</AlertDescription>
                  </Alert>
                )}
              </div>

              <ImageUpload 
                imageUrl={values.image.url} 
                setFieldValue={setFieldValue} 
                values={values}
              />

              {initialCategory && (
                <div className="space-y-4">
                  <Label>Subcategorías</Label>
                  <div className="flex flex-wrap gap-2">
                    {subCategories.map((subCategory) => (
                      <Badge 
                        key={subCategory._id.toString()}
                        variant="secondary" 
                        className="px-3 py-1 text-sm flex items-center gap-2"
                      >
                        {subCategory.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubCategory(subCategory._id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={`Eliminar ${subCategory.name}`}
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="border-t pt-4 sticky bottom-0 bg-white z-10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : (initialCategory ? 'Actualizar' : 'Crear')} Categoría
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

