'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Trash2, Upload, ImageIcon, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { axiosInstance } from '@/lib/axiosInstance'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Image {
  _id: string;
  url: string;
  id: string;
}

interface ProductProps {
  product: {
    _id: string;
    images: Image[];
  };
}

export const ImagesTab: React.FC<ProductProps> = ({ product: initialProduct }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [product, setProduct] = useState<ProductProps['product']>(initialProduct)
  const params = useParams()
  const productId = params.slug as string
  const { toast } = useToast()

  const fetchProductImages = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/products/${productId}/images`);
      if (response.data.status) {
        setProduct(prevProduct => ({
          ...prevProduct,
          images: response.data.data || []
        }));
        setMainImageIndex(0);  // Reset main image index when fetching new images
      } else {
        throw new Error(response.data.msg || 'Failed to fetch product images');
      }
    } catch (error) {
      console.error('Error fetching product images:', error);
      toast({
        title: "Error fetching product images",
        description: "Please try again",
        variant: "destructive",
      });
      setProduct(prevProduct => ({ ...prevProduct, images: [] }));
    }
  }, [productId, toast]);

  useEffect(() => {
    fetchProductImages();
  }, [fetchProductImages]);

  const addImageToProduct = async (imageUrl: string, publicId: string) => {
    try {
      const response = await axiosInstance.post(`/products/${productId}/images`, { 
        url: imageUrl,
        imageId: publicId
      });
      if (response.data.status) {
        toast({
          title: "Image added successfully",
          variant: "default",
        });
        fetchProductImages();
      } else {
        throw new Error(response.data.msg || 'Failed to add image');
      }
    } catch (error) {
      console.error('Error adding image to product:', error);
      toast({
        title: "Error adding image to product",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, imageToEdit?: Image) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        if (imageToEdit) {
          await axiosInstance.delete(`/upload/${imageToEdit.id}`);
          await axiosInstance.delete(`/products/${productId}/images/${imageToEdit._id}`);
        }

        const uploadResponse = await axiosInstance.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const imageUrl = uploadResponse.data.result.secure_url;
        const publicId = uploadResponse.data.result.public_id;
        
        await addImageToProduct(imageUrl, publicId);

        toast({
          title: imageToEdit ? "Image updated successfully" : "Image uploaded successfully",
          variant: "default",
        });

        setIsEditing(false);
        setSelectedImage(null);
        fetchProductImages();
      } catch (error) {
        console.error('Error uploading/updating image:', error);
        toast({
          title: "Error uploading/updating image",
          description: "Please try again",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  }, [addImageToProduct, productId, toast, fetchProductImages]);

  const handleDeleteImage = async (imageId: string, publicId: string) => {
    try {
      await axiosInstance.delete(`/upload/${publicId}`);
      const productResponse = await axiosInstance.delete(`/products/${productId}/images/${imageId}`);
      if (!productResponse.data.status) {
        throw new Error(productResponse.data.msg || 'Failed to delete image from product');
      }

      toast({
        title: "Image deleted successfully",
        variant: "default",
      });
      
      // Update local state immediately
      setProduct(prevProduct => ({
        ...prevProduct,
        images: prevProduct.images.filter(img => img._id !== imageId)
      }));

      // Adjust mainImageIndex if necessary
      setMainImageIndex(prevIndex => {
        if (prevIndex >= product.images.length - 1) {
          return Math.max(0, product.images.length - 2);
        }
        return prevIndex;
      });

      // Fetch updated images from server
      fetchProductImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error deleting image",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handlePrevImage = () => {
    setMainImageIndex((prevIndex) => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setMainImageIndex((prevIndex) => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Product Images</h2>
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e)}
            className="hidden"
            id="image-upload"
            disabled={isUploading}
          />
          <Button 
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </div>
      </div>

      {product.images && product.images.length > 0 ? (
        <div className="space-y-6">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden max-w-2xl mx-auto">
            <div className="aspect-w-4 aspect-h-3 md:aspect-w-3 md:aspect-h-2">
              <img 
                src={product.images[mainImageIndex]?.url} 
                alt={`Product Image ${mainImageIndex + 1}`}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-between p-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-white/80 hover:bg-white"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/80 hover:bg-white"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {product.images.map((image, index) => (
              <Card 
                key={image._id} 
                className={cn(
                  "overflow-hidden cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105",
                  index === mainImageIndex && "ring-2 ring-primary"
                )}
                onClick={() => setMainImageIndex(index)}
              >
                <CardContent className="p-1">
                  <div className="relative aspect-square">
                    <img 
                      src={image.url} 
                      alt={`Product Thumbnail ${index + 1}`}
                      className="object-cover w-full h-full rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(image);
                          setIsEditing(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image._id, image.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No images</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading a new image.</p>
        </div>
      )}

      <Dialog open={!!selectedImage} onOpenChange={() => {
        setSelectedImage(null);
        setIsEditing(false);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Image' : 'Image Preview'}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img src={selectedImage.url} alt="Product" className="w-full h-auto rounded" />
              {isEditing && (
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, selectedImage)}
                    className="hidden"
                    id="image-edit"
                    disabled={isUploading}
                  />
                  <Button 
                    onClick={() => document.getElementById('image-edit')?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Updating...' : 'Update Image'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {product.images && product.images.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {product.images.length} to {product.images.length} of {product.images.length} entries
        </div>
      )}
    </div>
  )
}

