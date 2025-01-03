import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

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

interface AddressFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (address: Omit<ShippingAddress, '_id'>) => void;
}

const AddressSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  street: Yup.string().required('Street is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zipcode: Yup.string().required('Zipcode is required'),
  country: Yup.string().required('Country is required'),
  streetAddress: Yup.string().required('Street address is required'),
})

export function AddressForm({ isOpen, onClose, onSubmit }: AddressFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Shipping Address</DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            fullName: '',
            email: '',
            phone: '',
            street: '',
            city: '',
            state: '',
            zipcode: '',
            country: '',
            streetAddress: '',
          }}
          validationSchema={AddressSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            onSubmit(values);
            setSubmitting(false);
            resetForm();
            onClose();
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Field name="fullName" as={Input} />
                {errors.fullName && touched.fullName && <div className="text-red-500 text-sm">{errors.fullName}</div>}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Field name="email" type="email" as={Input} />
                {errors.email && touched.email && <div className="text-red-500 text-sm">{errors.email}</div>}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Field name="phone" as={Input} />
                {errors.phone && touched.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}
              </div>

              <div>
                <Label htmlFor="street">Street</Label>
                <Field name="street" as={Input} />
                {errors.street && touched.street && <div className="text-red-500 text-sm">{errors.street}</div>}
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Field name="city" as={Input} />
                {errors.city && touched.city && <div className="text-red-500 text-sm">{errors.city}</div>}
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Field name="state" as={Input} />
                {errors.state && touched.state && <div className="text-red-500 text-sm">{errors.state}</div>}
              </div>

              <div>
                <Label htmlFor="zipcode">Zipcode</Label>
                <Field name="zipcode" as={Input} />
                {errors.zipcode && touched.zipcode && <div className="text-red-500 text-sm">{errors.zipcode}</div>}
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Field name="country" as={Input} />
                {errors.country && touched.country && <div className="text-red-500 text-sm">{errors.country}</div>}
              </div>

              <div>
                <Label htmlFor="streetAddress">Street Address</Label>
                <Field name="streetAddress" as={Input} />
                {errors.streetAddress && touched.streetAddress && <div className="text-red-500 text-sm">{errors.streetAddress}</div>}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Address'}
              </Button>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

