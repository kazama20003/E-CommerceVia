'use client'

import { useCallback, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { axiosInstance } from '@/lib/axiosInstance'
import { useToast } from '@/hooks/use-toast'

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

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Category is required'),
  description: Yup.string().required('Description is required'),
  image: Yup.object().shape({
    url: Yup.string().required('Image URL is required'),
    id: Yup.string().required('Image ID is required'),
  }),
  status: Yup.string().oneOf(['active', 'inactive']).required('Status is required'),
})

interface BrandFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: Omit<Brand, '_id'>) => void
  initialBrand: Brand | null
}

export function BrandForm({ open, onOpenChange, onSubmit, initialBrand }: BrandFormProps) {
  const { toast } = useToast()

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      image: { url: '', id: '' },
      status: 'active' as 'active' | 'inactive',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values)
      formik.resetForm()
    },
  })

  useEffect(() => {
    if (initialBrand) {
      const { _id, ...rest } = initialBrand
      formik.setValues(rest)
    } else {
      formik.resetForm()
    }
  }, [initialBrand])

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
        formik.setFieldValue('image', {
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
  }, [formik, toast])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...formik.getFieldProps('name')}
              className="mt-1"
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...formik.getFieldProps('description')}
              className="mt-1"
            />
            {formik.touched.description && formik.errors.description && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
            )}
          </div>

          <div>
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              onChange={handleImageUpload}
              className="mt-1"
            />
            {formik.values.image.url && (
              <img src={formik.values.image.url} alt="Preview" className="mt-2 w-full max-w-[200px] h-auto object-cover rounded" />
            )}
            {formik.touched.image && formik.errors.image && (
              <div className="text-red-500 text-sm mt-1">
                {typeof formik.errors.image === 'string' 
                  ? formik.errors.image 
                  : 'Invalid image'}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formik.values.status}
              onValueChange={(value: 'active' | 'inactive') => formik.setFieldValue('status', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.status}</div>
            )}
          </div>

          <Button type="submit" className="w-full mt-4">
            {initialBrand ? 'Update Brand' : 'Add Brand'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

