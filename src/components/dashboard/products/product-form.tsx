'use client'

import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { axiosInstance } from '@/lib/axiosInstance'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface Product {
  _id?: string;
  name: string;
  sku: string;
  category: string | { _id: string; name: string };
  subCategory: string;
  barcode: string;
  buyingPrice: number;
  sellingPrice: number;
  tax: number;
  brand: string;
  status: string;
  canPurchasable: boolean;
  showStockOut: boolean;
  refundable: boolean;
  maximunPurchaseQuantity: number;
  lowStockQuantityWarning: number;
  unit: string;
  weight: number;
  tags: string[];
  description: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  image: {
    url: string;
    id: string;
  };
  status: string;
  subCategory: Array<{
    _id: string;
    name: string;
    category: string[];
  }>;
}

interface SubCategory {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

const ProductSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  sku: Yup.string().required('SKU is required'),
  category: Yup.string().required('Category is required'),
  subCategory: Yup.string().required('Subcategory is required'),
  barcode: Yup.string().required('Barcode is required'),
  buyingPrice: Yup.number().required('Buying price is required').positive('Must be a positive number'),
  sellingPrice: Yup.number().required('Selling price is required').positive('Must be a positive number'),
  tax: Yup.number().typeError('Tax must be a number'),
  brand: Yup.string(),
  status: Yup.string().required('Status is required'),
  canPurchasable: Yup.boolean().required('Can purchasable is required'),
  showStockOut: Yup.boolean().required('Show stock out is required'),
  refundable: Yup.boolean().required('Refundable is required'),
  maximunPurchaseQuantity: Yup.number().positive('Must be a positive number'),
  lowStockQuantityWarning: Yup.number().positive('Must be a positive number'),
  unit: Yup.string().required('Unit is required'),
  weight: Yup.number().positive('Must be a positive number'),
  tags: Yup.array().of(Yup.string()),
  description: Yup.string(),
})

interface ProductFormProps {
  onSubmit: (values: Product) => void | Promise<void>;
  initialData?: Partial<Product>;
}

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  useEffect(() => {
    if (initialData?.category) {
      const selectedCategory = categories.find(cat => 
        cat._id === (typeof initialData.category === 'string' ? initialData.category : initialData.category?._id)
      )
      if (selectedCategory) {
        setSubCategories(selectedCategory.subCategory)
      }
    }
  }, [initialData, categories])

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await axiosInstance.get('/brands')
      setBrands(response.data)
    } catch (error) {
      console.error("Error fetching brands:", error)
    }
  }

  const formik = useFormik<Product>({
    initialValues: {
      _id: initialData?._id || undefined,
      name: initialData?.name || '',
      sku: initialData?.sku || '',
      category: initialData?.category || '',
      subCategory: initialData?.subCategory || '',
      barcode: initialData?.barcode || '',
      buyingPrice: initialData?.buyingPrice || 0,
      sellingPrice: initialData?.sellingPrice || 0,
      tax: initialData?.tax || 0,
      brand: initialData?.brand || '',
      status: initialData?.status || 'Active',
      canPurchasable: initialData?.canPurchasable ?? true,
      showStockOut: initialData?.showStockOut ?? true,
      refundable: initialData?.refundable ?? true,
      maximunPurchaseQuantity: initialData?.maximunPurchaseQuantity || 0,
      lowStockQuantityWarning: initialData?.lowStockQuantityWarning || 0,
      unit: initialData?.unit || '',
      weight: initialData?.weight || 0,
      tags: initialData?.tags || [],
      description: initialData?.description || '',
    },
    validationSchema: ProductSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true)
      setSubmitStatus('idle')
      try {
        await onSubmit(values);
        setSubmitStatus('success')
      } catch (error) {
        console.error("Error submitting product:", error)
        setSubmitStatus('error')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const renderError = (fieldName: keyof Product) => {
    if (formik.touched[fieldName] && formik.errors[fieldName]) {
      return <div className="text-red-500 text-sm" role="alert">{formik.errors[fieldName]?.toString()}</div>
    }
    return null
  }

  const handleCategoryChange = (value: string) => {
    formik.setFieldValue('category', value)
    formik.setFieldValue('subCategory', '') // Reset subcategory when category changes
    const selectedCategory = categories.find(cat => cat._id === value)
    if (selectedCategory) {
      setSubCategories(selectedCategory.subCategory)
    } else {
      setSubCategories([])
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">{initialData?._id ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {submitStatus === 'success' && (
              <Alert variant="default">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Product {initialData ? 'updated' : 'added'} successfully.
                </AlertDescription>
              </Alert>
            )}
            {submitStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was an error submitting the product. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...formik.getFieldProps('name')}
                  aria-describedby="name-error"
                />
                {renderError('name')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  {...formik.getFieldProps('sku')}
                  aria-describedby="sku-error"
                />
                {renderError('sku')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={handleCategoryChange}
                  value={typeof formik.values.category === 'string' ? formik.values.category : formik.values.category?._id}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderError('category')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subCategory">Subcategory</Label>
                <Select
                  onValueChange={(value) => formik.setFieldValue('subCategory', value)}
                  value={formik.values.subCategory}
                  disabled={!formik.values.category}
                >
                  <SelectTrigger id="subCategory">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((subCategory) => (
                      <SelectItem key={subCategory._id} value={subCategory._id}>
                        {subCategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderError('subCategory')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  {...formik.getFieldProps('barcode')}
                  aria-describedby="barcode-error"
                />
                {renderError('barcode')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyingPrice">Buying Price</Label>
                <Input
                  id="buyingPrice"
                  type="number"
                  {...formik.getFieldProps('buyingPrice')}
                  aria-describedby="buyingPrice-error"
                />
                {renderError('buyingPrice')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  {...formik.getFieldProps('sellingPrice')}
                  aria-describedby="sellingPrice-error"
                />
                {renderError('sellingPrice')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax">Tax</Label>
                <Input
                  id="tax"
                  type="number"
                  {...formik.getFieldProps('tax')}
                  aria-describedby="tax-error"
                />
                {renderError('tax')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select
                  onValueChange={(value) => formik.setFieldValue('brand', value)}
                  value={formik.values.brand}
                >
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderError('brand')}
              </div>

              <div className="space-y-2">
                <Label id="status-label">Status</Label>
                <RadioGroup
                  onValueChange={(value) => formik.setFieldValue('status', value)}
                  value={formik.values.status}
                  className="flex flex-col sm:flex-row gap-4"
                  aria-labelledby="status-label"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Active" id="active" />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="InActive" id="inactive" />
                    <Label htmlFor="inactive">Inactive</Label>
                  </div>
                </RadioGroup>
                {renderError('status')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="canPurchasable">Can Purchasable</Label>
                <RadioGroup
                  onValueChange={(value) => formik.setFieldValue('canPurchasable', value === 'true')}
                  value={formik.values.canPurchasable.toString()}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="purchasable-yes" />
                    <Label htmlFor="purchasable-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="purchasable-no" />
                    <Label htmlFor="purchasable-no">No</Label>
                  </div>
                </RadioGroup>
                {renderError('canPurchasable')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="showStockOut">Show Stock Out</Label>
                <RadioGroup
                  onValueChange={(value) => formik.setFieldValue('showStockOut', value === 'true')}
                  value={formik.values.showStockOut.toString()}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="stock-out-yes" />
                    <Label htmlFor="stock-out-yes">Enable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="stock-out-no" />
                    <Label htmlFor="stock-out-no">Disable</Label>
                  </div>
                </RadioGroup>
                {renderError('showStockOut')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="refundable">Refundable</Label>
                <RadioGroup
                  onValueChange={(value) => formik.setFieldValue('refundable', value === 'true')}
                  value={formik.values.refundable.toString()}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="refundable-yes" />
                    <Label htmlFor="refundable-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="refundable-no" />
                    <Label htmlFor="refundable-no">No</Label>
                  </div>
                </RadioGroup>
                {renderError('refundable')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximunPurchaseQuantity">Maximum Purchase Quantity</Label>
                <Input
                  id="maximunPurchaseQuantity"
                  type="number"
                  {...formik.getFieldProps('maximunPurchaseQuantity')}
                  aria-describedby="maximunPurchaseQuantity-error"
                />
                {renderError('maximunPurchaseQuantity')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStockQuantityWarning">Low Stock Quantity Warning</Label>
                <Input
                  id="lowStockQuantityWarning"
                  type="number"
                  {...formik.getFieldProps('lowStockQuantityWarning')}
                  aria-describedby="lowStockQuantityWarning-error"
                />
                {renderError('lowStockQuantityWarning')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  onValueChange={(value) => formik.setFieldValue('unit', value)}
                  value={formik.values.unit}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unid">Unidad</SelectItem>
                    <SelectItem value="kg">Kilogramo</SelectItem>
                    <SelectItem value="caja">Caja</SelectItem>
                    <SelectItem value="paquete">Paquete</SelectItem>
                    <SelectItem value="t">Toneladas</SelectItem>
                    <SelectItem value="balde">Balde</SelectItem>
                    <SelectItem value="barril">Barriles</SelectItem>
                    <SelectItem value="bobina">Bobinas</SelectItem>
                    <SelectItem value="bolsa">Bolsa</SelectItem>
                    <SelectItem value="botella">Botellas</SelectItem>
                    <SelectItem value="cartón">Cartones</SelectItem>
                    <SelectItem value="cm²">Centímetro cuadrado</SelectItem>
                    <SelectItem value="cm³">Centímetro cúbico</SelectItem>
                    <SelectItem value="cm">Centímetro lineal</SelectItem>
                    <SelectItem value="cent">Ciento de unidades</SelectItem>
                    <SelectItem value="cilindro">Cilindro</SelectItem>
                    <SelectItem value="cono">Conos</SelectItem>
                    <SelectItem value="docena">Docena</SelectItem>
                    <SelectItem value="doc por 10⁶">Docena por 10⁶</SelectItem>
                    <SelectItem value="fardo">Fardo</SelectItem>
                    <SelectItem value="UK gal">Galón inglés</SelectItem>
                    <SelectItem value="hL">Hectolitro</SelectItem>
                    <SelectItem value="hoja">Hoja</SelectItem>
                    <SelectItem value="juego">Juego</SelectItem>
                    <SelectItem value="km">Kilómetro</SelectItem>
                    <SelectItem value="kWh">Kilovatio-hora</SelectItem>
                    <SelectItem value="kit">Kit</SelectItem>
                    <SelectItem value="lata">Latas</SelectItem>
                    <SelectItem value="lb">Libras</SelectItem>
                    <SelectItem value="L">Litros</SelectItem>
                    <SelectItem value="MWh">Megavatio-hora</SelectItem>
                    <SelectItem value="m">Metro</SelectItem>
                    <SelectItem value="m²">Metro cuadrado</SelectItem>
                    <SelectItem value="m³">Metro cúbico</SelectItem>
                    <SelectItem value="mg">Miligramos</SelectItem>
                    <SelectItem value="mm">Milímetro</SelectItem>
                    <SelectItem value="mm²">Milímetro cuadrado</SelectItem>
                    <SelectItem value="mm³">Milímetro cúbico</SelectItem>
                    <SelectItem value="millar">Millares</SelectItem>
                    <SelectItem value="millón">Millón de unidades</SelectItem>
                    <SelectItem value="oz">Onzas</SelectItem>
                    <SelectItem value="paleta">Paletas</SelectItem>
                    <SelectItem value="par">Par</SelectItem>
                    <SelectItem value="ft">Pies</SelectItem>
                    <SelectItem value="ft²">Pies cuadrados</SelectItem>
                    <SelectItem value="ft³">Pies cúbicos</SelectItem>
                    <SelectItem value="pieza">Piezas</SelectItem>
                    <SelectItem value="placa">Placas</SelectItem>
                    <SelectItem value="pliego">Pliegos</SelectItem>
                    <SelectItem value="in">Pulgadas</SelectItem>
                    <SelectItem value="resma">Resma</SelectItem>
                    <SelectItem value="tambo">Tambos</SelectItem>
                    <SelectItem value="short ton (ST)">Tonelada corta</SelectItem>
                    <SelectItem value="long ton (LT)">Tonelada larga</SelectItem>
                    <SelectItem value="tubo">Tubos</SelectItem>
                    <SelectItem value="US gal">UsGalón</SelectItem>
                    <SelectItem value="yd">Yarda</SelectItem>
                    <SelectItem value="yd²">Yarda cuadrada</SelectItem>
                    <SelectItem value="rollo">Rollo</SelectItem>
                  </SelectContent>
                </Select>
                {renderError('unit')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  {...formik.getFieldProps('weight')}
                  aria-describedby="weight-error"
                />
                {renderError('weight')}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {formik.values.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newTags = [...formik.values.tags];
                        newTags.splice(index, 1);
                        formik.setFieldValue('tags', newTags);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="newTag"
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTag.trim() !== '') {
                        formik.setFieldValue('tags', [...formik.values.tags, newTag.trim()]);
                        setNewTag('');
                      }
                    }
                  }}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newTag.trim() !== '') {
                      formik.setFieldValue('tags', [...formik.values.tags, newTag.trim()]);
                      setNewTag('');
                    }
                  }}
                  className="whitespace-nowrap"
                >
                  Add Tag
                </Button>
              </div>
              {renderError('tags')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...formik.getFieldProps('description')}
                rows={5}
                aria-describedby="description-error"
              />
              {renderError('description')}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : (initialData?._id ? 'Update Product' : 'Add Product')}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

