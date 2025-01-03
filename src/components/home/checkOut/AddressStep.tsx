import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Edit2, Plus, MapPin } from 'lucide-react'
import { AddressForm } from './AddressForm'

interface ShippingAddress {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  streetAddress: string;
}

interface AddressStepProps {
  shippingAddress: ShippingAddress | null
  saveAsBilling: boolean
  onSaveAddress: (address: Omit<ShippingAddress, '_id'>) => void
  onDeleteShippingAddress: () => void
  onDeleteBillingAddress: () => void
  onSaveAsBillingChange: (checked: boolean) => void
  onBack: () => void
  onNext: () => void
}

export function AddressStep({
  shippingAddress,
  saveAsBilling,
  onSaveAddress,
  onDeleteShippingAddress,
  onDeleteBillingAddress,
  onSaveAsBillingChange,
  onBack,
  onNext
}: AddressStepProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>

      <RadioGroup defaultValue="home">
        <div className="grid gap-6">
          {shippingAddress ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <RadioGroupItem value="home" id="home" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="home" className="flex items-center text-base font-semibold text-gray-900">
                      <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                      Home
                    </Label>
                    <div className="mt-2 text-sm text-gray-500">
                      {shippingAddress.fullName}<br />
                      {shippingAddress.phone}<br />
                      {shippingAddress.email}<br />
                      {shippingAddress.streetAddress}<br />
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipcode}<br />
                      {shippingAddress.country}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No shipping address found</h3>
              <p className="mt-1 text-sm text-gray-500">Add a new address to proceed with your order.</p>
            </div>
          )}
        </div>
      </RadioGroup>

      {shippingAddress && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="saveAsBilling" 
            checked={saveAsBilling}
            onCheckedChange={onSaveAsBillingChange}
          />
          <label
            htmlFor="saveAsBilling"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Use shipping address as billing address
          </label>
        </div>
      )}

      <div className="flex justify-between">
        {shippingAddress && (
          <Button variant="outline" size="sm" onClick={onDeleteShippingAddress}>
            Delete Shipping Address
          </Button>
        )}
        {saveAsBilling && (
          <Button variant="outline" size="sm" onClick={onDeleteBillingAddress}>
            Delete Billing Address
          </Button>
        )}
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onBack}>
          Back to Cart
        </Button>
        <Button onClick={onNext} disabled={!shippingAddress}>
          Continue to Payment
        </Button>
      </div>

      <AddressForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={(address) => {
          onSaveAddress(address)
          setIsDialogOpen(false)
        }}
      />
    </div>
  )
}

