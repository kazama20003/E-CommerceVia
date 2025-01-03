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

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Category) => void;
  initialCategory: Category | null;
}

const CategorySchema = Yup.object().shape({
  name: Yup.string().required('Category name is required'),
  description: Yup.string().required('Description is required'),
  status: Yup.string().oneOf(['Active', 'Inactive']).required('Status is required'),
})

function ImageUpload({ imageUrl, setFieldValue, values }: { imageUrl: string, setFieldValue: (field: string, value: any) => void, values: any }) {
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)

  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Delete the previous image if it exists
      if (values.image.id) {
        await axiosInstance.delete(`/upload/${values.image.id}`)
      }

      const response = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setFieldValue('image', {
        url: response.data.result.secure_url,
        id: response.data.result.public_id
      })
    } catch (error) {
      console.error('Error handling image:', error)
      toast({
        title: "Error handling image",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }, [setFieldValue, toast, values.image.id])

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
      <Label htmlFor="image-upload">Category Image</Label>
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
            <img 
              src={imageUrl} 
              alt="Category preview" 
              className="w-full h-48 object-contain rounded-md"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setFieldValue('image', { url: '', id: '' })}
              >
                Change Image
              </Button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center h-48 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            <Upload className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Drop an image here or click to upload</span>
            <span className="text-xs mt-1">PNG, JPG up to 10MB</span>
          </label>
        )}
      </div>
    </div>
  )
}

export function CategoryForm({ open, onOpenChange, onSubmit, initialCategory }: CategoryFormProps) {
  const { toast } = useToast()
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [newSubCategoryName, setNewSubCategoryName] = useState('')

  const fetchSubCategories = useCallback(async (categoryId: string) => {
    try {
      const response = await axiosInstance.get(`/categories/${categoryId}/subcategories`)
      setSubCategories(response.data)
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      toast({
        title: "Error fetching subcategories",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
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

  const handleSubmit = useCallback(async (values: Omit<Category, '_id'> & { _id?: string }) => {
    try {
      const categoryData = {
        name: values.name,
        description: values.description,
        image: values.image,
        status: values.status,
      };

      let response;
      if (values._id) {
        response = await axiosInstance.put(`/categories/${values._id}`, categoryData);
      } else {
        response = await axiosInstance.post('/categories', categoryData);
      }

      const savedCategory: Category = response.data;

      // Handle subcategories
      const updatedSubCategories = await Promise.all(
        subCategories.map(async (subCategory) => {
          if (subCategory._id.startsWith('temp_')) {
            const newSubCategoryResponse = await axiosInstance.post(`/categories/${savedCategory._id}/subcategories`, {
              name: subCategory.name,
            });
            return newSubCategoryResponse.data;
          }
          return subCategory;
        })
      );

      onSubmit({
        ...savedCategory,
        subCategory: updatedSubCategories,
      });

      toast({
        title: "Category submitted successfully",
        description: "The category has been added/updated.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting category:', error);
      toast({
        title: "Error submitting category",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  }, [onSubmit, onOpenChange, subCategories, toast]);

  const handleAddSubCategory = useCallback(() => {
    if (newSubCategoryName.trim() === '') return;

    const newSubCategory: SubCategory = {
      _id: `temp_${Date.now()}`, // Temporary ID
      name: newSubCategoryName,
      category: initialCategory ? [initialCategory._id] : [],
    };

    setSubCategories(prev => [...prev, newSubCategory]);
    setNewSubCategoryName('');
  }, [newSubCategoryName, initialCategory]);

  const handleRemoveSubCategory = useCallback(async (subCategoryId: string) => {
    if (!initialCategory?._id) return;

    try {
      // Update the API endpoint to match the server's expected format
      await axiosInstance.delete(`/categories/${initialCategory._id}/subcategories/${subCategoryId}`);
    
      setSubCategories(prev => prev.filter(sc => sc._id !== subCategoryId));
      toast({
        title: "Subcategory removed successfully",
        description: "The subcategory has been removed.",
      });
    } catch (error) {
      console.error('Error removing subcategory:', error);
      toast({
        title: "Error removing subcategory",
        description: "Please try again. If the problem persists, contact support.",
        variant: "destructive",
      });
    }
  }, [initialCategory, toast]);

  const handleDialogClose = useCallback(() => {
    onOpenChange(false);
    setSubCategories([]);
    setNewSubCategoryName('');
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-auto max-h-[90vh]">
        <DialogHeader className="p-6 border-b bg-muted/10 sticky top-0 z-10">
          <DialogTitle className="text-xl">
            {initialCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription>
            {initialCategory ? 'Update the details of an existing category.' : 'Create a new category for your products.'}
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
                  <Label htmlFor="name">Category Name</Label>
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
                  <Label htmlFor="status">Status</Label>
                  <Field name="status">
                    {({ field }: { field: any }) => (
                      <Select 
                        onValueChange={(value) => setFieldValue('status', value)} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger 
                          id="status"
                          className={errors.status && touched.status ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
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
                <Label htmlFor="description">Description</Label>
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
                  <Label>Subcategories</Label>
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
                          aria-label={`Remove ${subCategory.name}`}
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSubCategoryName}
                      onChange={(e) => setNewSubCategoryName(e.target.value)}
                      placeholder="Add a subcategory"
                      className="flex-1"
                      aria-label="New subcategory name"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddSubCategory}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}

              <DialogFooter className="border-t pt-4 sticky bottom-0 bg-white z-10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {initialCategory ? 'Update' : 'Create'} Category
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

