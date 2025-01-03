'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useFormik } from 'formik'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { axiosInstance } from '@/lib/axiosInstance'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

interface ShippingFormValues {
  shippingType: "Free" | "Flat Rate"
  shippingCost: number
  isProductQuantityMultiply: boolean
  shippingAndReturnPolicy: string
}

export default function ShippingPage() {
  const params = useParams()
  const productId = params.slug as string
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const formik = useFormik<ShippingFormValues>({
    initialValues: {
      shippingType: "Free",
      shippingCost: 0,
      isProductQuantityMultiply: false,
      shippingAndReturnPolicy: ''
    },
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.put(`/products/${productId}/shippingreturn`, values);
        if (response.data.status) {
          toast({ description: 'Shipping details updated successfully' });
        } else {
          throw new Error('Failed to update shipping details');
        }
      } catch (error) {
        console.error('Error updating shipping details:', error);
        toast({ variant: "destructive", description: 'Failed to update shipping details. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    },
  })

  useEffect(() => {
    const fetchShippingData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/products/${productId}/shippingreturn`);
        const shippingData = response.data.data;
        if (shippingData) {
          formik.setValues({
            shippingType: shippingData.shippingType,
            shippingCost: shippingData.shippingCost,
            isProductQuantityMultiply: shippingData.isProductQuantityMultiply,
            shippingAndReturnPolicy: shippingData.shippingAndReturnPolicy,
          });
        }
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // If data is not found, we'll use the initial values
          console.log('No shipping data found. Using default values.');
        } else {
          console.error('Error fetching shipping data:', error);
          toast({ variant: "destructive", description: 'Failed to load shipping details. Using default values.' });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchShippingData();
  }, [productId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Shipping & Return Details</h1>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Shipping Type <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formik.values.shippingType}
                    onValueChange={(value: "Free" | "Flat Rate") => formik.setFieldValue('shippingType', value)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Free" id="free" />
                      <Label htmlFor="free">Free</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Flat Rate" id="flat-rate" />
                      <Label htmlFor="flat-rate">Flat Rate</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingCost" className="text-sm font-medium">
                    Shipping Cost <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    step="0.01"
                    value={formik.values.shippingCost}
                    onChange={(e) => formik.setFieldValue('shippingCost', parseFloat(e.target.value))}
                    disabled={formik.values.shippingType === "Free"}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Is Product Quantity Multiply <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formik.values.isProductQuantityMultiply ? "true" : "false"}
                  onValueChange={(value) => formik.setFieldValue('isProductQuantityMultiply', value === 'true')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="multiply-yes" />
                    <Label htmlFor="multiply-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="multiply-no" />
                    <Label htmlFor="multiply-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping & Return Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <textarea
                  {...formik.getFieldProps('shippingAndReturnPolicy')}
                  className="w-full p-4 min-h-[200px] focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit"
            className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
      <Toaster />
    </>
  )
}

