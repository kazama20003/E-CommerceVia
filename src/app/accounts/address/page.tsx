'use client'

import { useState, useEffect } from "react"
import { MapPin, Plus, X, Edit } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { axiosInstance } from "@/lib/axiosInstance"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"

interface Address {
  fullName: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  country: string
  zipcode: string
  streetAddress?: string
}

interface DecodedToken {
  userId: string
  role: string
  iat: number
}

interface User {
  _id: string
  name: string
  email: string
  mobile: string
  role: string
  shippingAddress: Address
  billingAddress: Address
  createdAt: string
  updatedAt: string
}

type AddressType = 'shipping' | 'billing'

export default function Addresses() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(null)
  const [addressForm, setAddressForm] = useState<Address>({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    streetAddress: '',
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get('token')
        if (!token) {
          throw new Error('Token not found in cookies')
        }

        let decodedToken: DecodedToken
        try {
          decodedToken = jwtDecode<DecodedToken>(token)
        } catch {
          throw new Error('Failed to decode token')
        }

        const userId = decodedToken.userId
        if (!userId) {
          throw new Error('User ID not found in decoded token')
        }

        const response = await axiosInstance.get(`/users/${userId}`)
        if (response.data.status && response.data.user) {
          setUser(response.data.user)
        } else {
          throw new Error('User data not found in response')
        }
        
        setIsLoading(false)
      } catch (error) {
        setError(`Failed to load user data: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleDelete = async (addressType: AddressType) => {
    try {
      if (!user) throw new Error('User data not available')

      const updatedUser = {
        ...user,
        [addressType === 'shipping' ? 'shippingAddress' : 'billingAddress']: {}
      }

      await axiosInstance.put(`/users/${user._id}`, updatedUser)
      setUser(updatedUser)
    } catch (error) {
      setError(`Failed to delete address: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEdit = (addressType: AddressType) => {
    if (user) {
      const currentAddress = addressType === 'shipping' ? user.shippingAddress : user.billingAddress
      setAddressForm(currentAddress)
      setEditingAddress(addressType)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const updatedUser = {
        ...user,
        [editingAddress === 'shipping' ? 'shippingAddress' : 'billingAddress']: addressForm
      }

      const response = await axiosInstance.put(`/users/${user._id}`, updatedUser)
      if (response.data.status) {
        setUser(response.data.user)
        setEditingAddress(null)
      } else {
        throw new Error('Failed to update address')
      }
    } catch (error) {
      setError(`Failed to update address: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl">Loading user data...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl text-red-500">{error}</div>
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl">No user data available</div>
  }

  const renderAddress = (address: Address, type: AddressType) => (
    <Card className="border border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div className="space-y-1 mb-4 sm:mb-0">
            <h3 className="font-semibold">{type.charAt(0).toUpperCase() + type.slice(1)} Address</h3>
            <p className="text-sm">{address.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {address.email} • {address.phone}
            </p>
            <p className="text-sm">{address.street}, {address.city}, {address.state}</p>
            <p className="text-sm">{address.country}, {address.zipcode}</p>
          </div>
          <div className="space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(type)}
              className="text-muted-foreground hover:text-primary"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(type)}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderAddressForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" value={addressForm.fullName} onChange={handleFormChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={addressForm.email} onChange={handleFormChange} required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={addressForm.phone} onChange={handleFormChange} required />
        </div>
        <div>
          <Label htmlFor="street">Street</Label>
          <Input id="street" name="street" value={addressForm.street} onChange={handleFormChange} required />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={addressForm.city} onChange={handleFormChange} required />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" value={addressForm.state} onChange={handleFormChange} required />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" value={addressForm.country} onChange={handleFormChange} required />
        </div>
        <div>
          <Label htmlFor="zipcode">Zipcode</Label>
          <Input id="zipcode" name="zipcode" value={addressForm.zipcode} onChange={handleFormChange} required />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => setEditingAddress(null)}>Cancel</Button>
        <Button type="submit">Save Address</Button>
      </div>
    </form>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <MapPin className="mr-3 h-8 w-8" />
          Addresses
        </h1>
      </div>

      {editingAddress ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingAddress === 'shipping' ? 'Shipping' : 'Billing'} Address
            </h2>
            {renderAddressForm()}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {user.shippingAddress && Object.keys(user.shippingAddress).length > 0 && 
            renderAddress(user.shippingAddress, 'shipping')}
          
          {user.billingAddress && Object.keys(user.billingAddress).length > 0 && 
            renderAddress(user.billingAddress, 'billing')}

          {(!user.shippingAddress || Object.keys(user.shippingAddress).length === 0) && (
            <Card 
              className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() => {
                setAddressForm({
                  fullName: '',
                  email: '',
                  phone: '',
                  street: '',
                  city: '',
                  state: '',
                  country: '',
                  zipcode: '',
                  streetAddress: '',
                })
                setEditingAddress('shipping')
              }}
            >
              <CardContent className="p-6">
                <Button 
                  variant="ghost" 
                  className="w-full h-full flex flex-col items-center gap-2 text-primary/60 hover:text-primary"
                >
                  <Plus className="h-8 w-8" />
                  <span>Add Shipping Address</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {(!user.billingAddress || Object.keys(user.billingAddress).length === 0) && (
            <Card 
              className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() => {
                setAddressForm({
                  fullName: '',
                  email: '',
                  phone: '',
                  street: '',
                  city: '',
                  state: '',
                  country: '',
                  zipcode: '',
                  streetAddress: '',
                })
                setEditingAddress('billing')
              }}
            >
              <CardContent className="p-6">
                <Button 
                  variant="ghost" 
                  className="w-full h-full flex flex-col items-center gap-2 text-primary/60 hover:text-primary"
                >
                  <Plus className="h-8 w-8" />
                  <span>Add Billing Address</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

