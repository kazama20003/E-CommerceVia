'use client'

import { useCallback, useState, useEffect } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { axiosInstance } from '@/lib/axiosInstance'
import { useToast } from "@/hooks/use-toast"

interface SubCategory {
  _id: string
  name: string
  category: string
}

interface Category {
  _id: string
  category: string
  subCategories: SubCategory[]
  image: {
    url: string
    id: string
  }
  status: 'active' | 'inactive'
}

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: Category) => void
  initialCategory: Category | null
}

const CategorySchema = Yup.object().shape({
  category: Yup.string().required('Category name is required'),
  status: Yup.string().oneOf(['active', 'inactive']).required('Status is required'),
})

const SubCategorySchema = Yup.object().shape({
  name: Yup.string().required('Subcategory name is required'),
})

function ImageUpload({ imageUrl, setFieldValue }: { imageUrl: string, setFieldValue: (field: string, value: any) => void }) {
  const { toast } = useToast()

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
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
        console.error('Error uploading image:', error)
        toast({
          title: "Error uploading image",
          description: "Please try again",
          variant: "destructive",
        })
      }
    }
  }, [setFieldValue, toast])

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">Category Image</Label>
      <Input
        id="image-upload"
        type="file"
        onChange={handleImageUpload}
        accept="image/*"
      />
      {imageUrl && (
        <div className="mt-2">
          <img src={imageUrl} alt="Category preview" className="max-w-full h-auto max-h-48 object-contain" />
        </div>
      )}
    </div>
  )
}

export function CategoryForm({ open, onOpenChange, onSubmit, initialCategory }: CategoryFormProps) {
  const { toast } = useToast()
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (initialCategory) {
        try {
          const response = await axiosInstance.get(`/subcategories?category=${initialCategory._id}`)
          setSubCategories(response.data)
        } catch (error) {
          console.error('Error fetching subcategories:', error)
          toast({
            title: "Error fetching subcategories",
            description: "Please try again",
            variant: "destructive",
          })
        }
      } else {
        setSubCategories([])
      }
    }

    fetchSubCategories()
  }, [initialCategory, toast])

  const initialValues: Omit<Category, '_id'> & { _id?: string } = {
    _id: initialCategory?._id,
    category: initialCategory?.category || '',
    subCategories: [],
    image: initialCategory?.image || { url: '', id: '' },
    status: initialCategory?.status || 'active',
  }

  const handleSubmit = async (values: Omit<Category, '_id'> & { _id?: string }) => {
    try {
      let categoryId: string;

      if (values._id) {
        // Update existing category
        const response = await axiosInstance.put(`/categories/${values._id}`, {
          category: values.category,
          image: values.image,
          status: values.status
        });
        categoryId = values._id;
      } else {
        // Create new category
        const response = await axiosInstance.post('/categories', {
          category: values.category,
          image: values.image,
          status: values.status
        });
        categoryId = response.data._id;
      }

      // Handle subcategories
      const updatedSubCategories: SubCategory[] = [];
      for (const subCategory of subCategories) {
        if (subCategory._id.startsWith('temp_')) {
          // Create new subcategory
          const response = await axiosInstance.post('/subcategories', {
            name: subCategory.name,
            category: categoryId
          });
          updatedSubCategories.push(response.data);
        } else {
          // Existing subcategory, no need to update
          updatedSubCategories.push(subCategory);
        }
      }

      const finalCategory: Category = {
        _id: categoryId,
        category: values.category,
        subCategories: updatedSubCategories,
        image: values.image,
        status: values.status
      };

      onSubmit(finalCategory);
      toast({
        title: "Category submitted successfully",
        description: "The category and subcategories have been added/updated.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting category:', error);
      toast({
        title: "Error submitting category",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleAddSubCategory = () => {
    setSubCategories([...subCategories, { _id: `temp_${Date.now()}`, name: '', category: '' }]);
  };

  const handleRemoveSubCategory = (index: number) => {
    setSubCategories(subCategories.filter((_, i) => i !== index))
  }

  const handleSubCategoryChange = (index: number, name: string) => {
    const newSubCategories = [...subCategories]
    newSubCategories[index].name = name
    setSubCategories(newSubCategories)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={CategorySchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form className="space-y-4">
              <div>
                <Label htmlFor="category">Category Name</Label>
                <Field name="category" as={Input} id="category" />
                {errors.category && touched.category && <div className="text-red-500">{errors.category}</div>}
              </div>

              <ImageUpload imageUrl={values.image.url} setFieldValue={setFieldValue} />

              <div>
                <Label htmlFor="status">Status</Label>
                <Field name="status">
                  {({ field }: { field: any }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                {errors.status && touched.status && <div className="text-red-500">{errors.status}</div>}
              </div>

              <div>
                <Label>Subcategories</Label>
                {subCategories.map((subCategory, index) => (
                  <div key={subCategory._id} className="flex items-center gap-2 mt-2">
                    <Input
                      value={subCategory.name}
                      onChange={(e) => handleSubCategoryChange(index, e.target.value)}
                      placeholder="Subcategory name"
                    />
                    <Button type="button" variant="destructive" onClick={() => handleRemoveSubCategory(index)}>Remove</Button>
                  </div>
                ))}
                <Button type="button" onClick={handleAddSubCategory} className="mt-2">Add Subcategory</Button>
              </div>

              <Button type="submit">Submit</Button>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

