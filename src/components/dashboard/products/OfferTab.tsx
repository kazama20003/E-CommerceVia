'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { format } from "date-fns"
import { CalendarIcon, X, Percent } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { axiosInstance } from '@/lib/axiosInstance'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface OfferFormValues {
  startDate: Date | undefined
  endDate: Date | undefined
  discount: string
  flashSale: string
}

const OfferSchema = Yup.object().shape({
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().min(Yup.ref('startDate'), 'End date must be after start date').required('End date is required'),
  discount: Yup.number().min(0, 'Discount must be at least 0').max(100, 'Discount cannot exceed 100').required('Discount is required'),
  flashSale: Yup.string().oneOf(['yes', 'no'], 'Invalid selection').required('Flash sale selection is required')
})

export const OfferTab = () => {
  const params = useParams()
  const productId = params.slug as string
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isLoading, setIsLoading] = useState(true)
  const [offerId, setOfferId] = useState<string | null>(null);

  const formik = useFormik<OfferFormValues>({
    initialValues: {
      startDate: undefined,
      endDate: undefined,
      discount: '0',
      flashSale: 'no'
    },
    validationSchema: OfferSchema,
    onSubmit: async (values) => {
      setSubmitStatus('idle');
      try {
        const offerData = {
          startDate: values.startDate?.toISOString().split('T')[0],
          endDate: values.endDate?.toISOString().split('T')[0],
          discountPercentage: parseInt(values.discount, 10),
          flashSale: values.flashSale === 'yes'
        };

        let response;
        if (offerId) {
          // Update existing offer
          response = await axiosInstance.put(`/products/${productId}/offer`, offerData);
        } else {
          // Create new offer
          response = await axiosInstance.post(`/products/${productId}/offer`, offerData);
        }

        console.log('Offer updated:', response.data);
        setSubmitStatus('success');
        if (!offerId) {
          // If we just created a new offer, set the offerId
          setOfferId(response.data._id);
        }
      } catch (error) {
        console.error('Error updating offer:', error);
        setSubmitStatus('error');
      }
    },
  })

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await axiosInstance.get(`/products/${productId}/offer`);
        const offerData = response.data.data;
        if (offerData) {
          setOfferId(offerData._id);
          formik.setValues({
            startDate: offerData.startDate ? new Date(offerData.startDate) : undefined,
            endDate: offerData.endDate ? new Date(offerData.endDate) : undefined,
            discount: offerData.discountPercentage ? offerData.discountPercentage.toString() : '0',
            flashSale: offerData.flashSale ? 'yes' : 'no'
          });
        } else {
          // If no offer exists, reset the form and clear the offerId
          setOfferId(null);
          formik.resetForm();
        }
      } catch (error) {
        console.error('Error fetching offer:', error);
        // If there's an error (e.g., 404 Not Found), assume no offer exists
        setOfferId(null);
        formik.resetForm();
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffer();
  }, [productId, formik]);

  const renderError = (fieldName: keyof typeof formik.errors) => {
    if (formik.touched[fieldName] && formik.errors[fieldName]) {
      return <div className="text-red-500 text-sm mt-1" role="alert">{formik.errors[fieldName]?.toString()}</div>
    }
    return null
  }

  if (isLoading) {
    return <div className="text-center">Loading offer details...</div>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Offer Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {submitStatus === 'success' && (
            <Alert variant="default">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Offer details have been successfully updated.
              </AlertDescription>
            </Alert>
          )}
          {submitStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was an error updating the offer details. Please try again.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                Offer Start Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formik.values.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formik.values.startDate ? format(formik.values.startDate, "PPP") : "Select date"}
                    {formik.values.startDate && (
                      <X 
                        className="ml-auto h-4 w-4 hover:text-red-500" 
                        onClick={(e) => {
                          e.stopPropagation()
                          formik.setFieldValue('startDate', undefined)
                        }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formik.values.startDate}
                    onSelect={(date) => formik.setFieldValue('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {renderError('startDate')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                Offer End Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formik.values.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formik.values.endDate ? format(formik.values.endDate, "PPP") : "Select date"}
                    {formik.values.endDate && (
                      <X 
                        className="ml-auto h-4 w-4 hover:text-red-500" 
                        onClick={(e) => {
                          e.stopPropagation()
                          formik.setFieldValue('endDate', undefined)
                        }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formik.values.endDate}
                    onSelect={(date) => formik.setFieldValue('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {renderError('endDate')}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount" className="text-sm font-medium text-gray-700">
              Discount Percentage <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="discount"
                type="number"
                {...formik.getFieldProps('discount')}
                className="pl-7 pr-12 max-w-[200px]"
              />
              <Percent className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
            </div>
            {renderError('discount')}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Add to Flash Sale? <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formik.values.flashSale}
              onValueChange={(value) => formik.setFieldValue('flashSale', value)}
              className="flex items-center gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>
            {renderError('flashSale')}
          </div>

          <Button 
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            {offerId ? 'Update Offer' : 'Create Offer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

