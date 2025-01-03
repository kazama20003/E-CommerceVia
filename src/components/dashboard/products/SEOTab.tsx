'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Trash2, Upload } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { axiosInstance } from '@/lib/axiosInstance'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios';

interface SEOImage {
  url: string;
  id: string;
}

interface SEOFormValues {
  title: string;
  description: string;
  keywords: string;
  image: SEOImage;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(60, 'Title should be at most 60 characters'),
  description: Yup.string().required('Description is required').max(160, 'Description should be at most 160 characters'),
  keywords: Yup.string().required('Keywords are required'),
})

export const SEOTab: React.FC = () => {
  const params = useParams()
  const productId = params.slug as string
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const formik = useFormik<SEOFormValues>({
    initialValues: {
      title: '',
      description: '',
      keywords: '',
      image: { url: '', id: '' }
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await axiosInstance.put(`/products/${productId}/seo`, values)
        console.log('SEO details updated:', response.data.data)
        toast({
          title: "SEO details updated successfully",
          variant: "default",
        })
      } catch (error) {
        console.error('Error updating SEO details:', error)
        toast({
          title: "Error updating SEO details",
          description: "Please try again",
          variant: "destructive",
        })
      }
    },
  })

  useEffect(() => {
    const fetchSEOData = async () => {
      try {
        const response = await axiosInstance.get(`/products/${productId}/seo`)
        const seoData = response.data.data
        formik.setValues({
          title: seoData.title || '',
          description: seoData.description || '',
          keywords: seoData.keywords || '',
          image: seoData.image || { url: '', id: '' }
        })
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            // If SEO data doesn't exist yet, keep the initial empty values
            console.log('No SEO data found for this product. You can add new SEO details.')
          } else {
            console.error('Error fetching SEO data:', error.message)
            toast({
              title: "Error fetching SEO data",
              description: error.message || "Please try again",
              variant: "destructive",
            })
          }
        } else {
          console.error('Unexpected error:', error)
          toast({
            title: "Unexpected error",
            description: "Please try again",
            variant: "destructive",
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSEOData()
  }, [productId, toast])

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await axiosInstance.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        formik.setFieldValue('image', {
          url: response.data.result.secure_url,
          id: response.data.result.public_id
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error uploading image",
          description: "Please try again",
          variant: "destructive",
        })
      }
    }
  }, [formik, toast]);

  const handleDeleteImage = useCallback(async () => {
    if (formik.values.image.id) {
      try {
        await axiosInstance.delete(`/upload/${formik.values.image.id}`);
        formik.setFieldValue('image', { url: '', id: '' });
        toast({
          title: "Image deleted successfully",
          variant: "default",
        })
      } catch (error) {
        console.error('Error deleting image:', error);
        toast({
          title: "Error deleting image",
          description: "Please try again",
          variant: "destructive",
        })
      }
    }
  }, [formik, toast]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...formik.getFieldProps('title')}
              placeholder="Meta Title"
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-sm text-red-500">{formik.errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              {...formik.getFieldProps('description')}
              placeholder="Meta Description"
              className="min-h-[100px]"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-500">{formik.errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords" className="text-sm font-medium">
              Meta Keywords <span className="text-red-500">*</span>
            </Label>
            <Input
              id="keywords"
              {...formik.getFieldProps('keywords')}
              placeholder="Enter keywords separated by commas"
            />
            {formik.touched.keywords && formik.errors.keywords && (
              <p className="text-sm text-red-500">{formik.errors.keywords}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Image
            </Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="seo-image"
              />
              <label
                htmlFor="seo-image"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                {formik.values.image.url ? (
                  <div className="relative">
                    <img
                      src={formik.values.image.url}
                      alt="SEO preview"
                      className="max-w-[200px] h-auto rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={handleDeleteImage}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
          >
            Save SEO Details
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

