'use client'

import { useState, useEffect } from "react"
import { Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { axiosInstance } from "@/lib/axiosInstance"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  mobile: Yup.string()
    .matches(/^9\d{8}$/, 'Must be a valid Peruvian mobile number (9 digits starting with 9)')
    .required('Mobile number is required'),
})

interface UserData {
  name: string;
  email: string;
  mobile: string;
}

export default function AccountInfo() {
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [updateMessage, setUpdateMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get('token')
        if (!token) {
          throw new Error('No token found')
        }
        const decodedToken = jwtDecode(token) as { userId: string }
        const userId = decodedToken.userId

        const response = await axiosInstance.get(`/users/${userId}`)
        const user = response.data.user
        setUserData({
          name: user.name,
          email: user.email,
          mobile: user.mobile.startsWith('9') ? user.mobile : user.mobile.slice(-9)
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  const handleSubmit = async (values: UserData, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    setIsLoading(true)
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('No token found')
      }
      const decodedToken = jwtDecode(token) as { userId: string }
      const userId = decodedToken.userId

      const changedValues = Object.keys(values).reduce((acc, key) => {
        if (values[key as keyof UserData] !== userData?.[key as keyof UserData]) {
          acc[key as keyof UserData] = values[key as keyof UserData];
        }
        return acc;
      }, {} as Partial<UserData>);

      if (Object.keys(changedValues).length > 0) {
        await axiosInstance.put(`/users/${userId}`, changedValues)
        setUserData(prev => prev ? { ...prev, ...changedValues } : null)
        setUpdateMessage('Profile updated successfully');
        setTimeout(() => setUpdateMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error updating user data:', error)
    } finally {
      setIsLoading(false)
      setSubmitting(false)
    }
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading user data...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Settings className="mr-3 h-8 w-8" />
          Account Information
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Info</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Formik
            initialValues={userData}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Field name="name">
                    {({ field }: any) => (
                      <Input {...field} />
                    )}
                  </Field>
                  <ErrorMessage name="name">
                    {msg => <p className="text-sm text-destructive">{msg}</p>}
                  </ErrorMessage>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Field name="email">
                    {({ field }: any) => (
                      <Input type="email" {...field} />
                    )}
                  </Field>
                  <ErrorMessage name="email">
                    {msg => <p className="text-sm text-destructive">{msg}</p>}
                  </ErrorMessage>
                </div>

                <div className="space-y-2">
                  <label htmlFor="mobile" className="text-sm font-medium">
                    Mobile (Peruvian number)
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      className="w-[60px]" 
                      value="+51" 
                      disabled 
                    />
                    <Field name="mobile">
                      {({ field }: any) => (
                        <Input 
                          {...field} 
                          placeholder="912345678"
                          maxLength={9}
                        />
                      )}
                    </Field>
                  </div>
                  <ErrorMessage name="mobile">
                    {msg => <p className="text-sm text-destructive">{msg}</p>}
                  </ErrorMessage>
                </div>

                {updateMessage && (
                  <p className="text-green-600 text-sm">{updateMessage}</p>
                )}

                <Button 
                  type="submit" 
                  className="w-full sm:w-auto"
                  disabled={isLoading || isSubmitting}
                >
                  {isLoading ? "Saving Changes..." : "Save Changes"}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}

