'use client'

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { axiosInstance } from "@/lib/axiosInstance"
import { useToast } from "@/hooks/use-toast"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"

const validationSchema = Yup.object({
  oldPassword: Yup.string()
    .min(8, "Old password must be at least 8 characters")
    .required("Old password is required"),
  newPassword: Yup.string()
    .min(8, "New password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], "Passwords must match")
    .required("Please confirm your password"),
})

const initialValues = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
}

export default function ChangePassword() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (values: typeof initialValues, { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void, resetForm: () => void }) => {
    setIsLoading(true)
    try {
      const token = Cookies.get('token')
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in again.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      const decodedToken = jwtDecode<{ userId: string }>(token)
      const userId = decodedToken.userId

      const response = await axiosInstance.put("/users/change-password", {
        userId,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message || "Your password has been successfully changed.",
          variant: "default",
        })
        resetForm()
      } else {
        throw new Error(response.data.error || "Failed to change password")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message || "An error occurred while changing your password.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Lock className="mr-3 h-8 w-8 text-primary" />
          Change Password
        </h1>
      </div>

      <Card className="border border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Update Your Password</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="oldPassword" className="text-sm font-medium">
                    Current Password
                  </label>
                  <Field name="oldPassword">
                    {({ field }: any) => (
                      <Input
                        type="password"
                        placeholder="Enter your current password"
                        {...field}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="oldPassword">
                    {msg => <p className="text-sm text-destructive">{msg}</p>}
                  </ErrorMessage>
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </label>
                  <Field name="newPassword">
                    {({ field }: any) => (
                      <Input
                        type="password"
                        placeholder="Enter your new password"
                        {...field}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="newPassword">
                    {msg => <p className="text-sm text-destructive">{msg}</p>}
                  </ErrorMessage>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Field name="confirmPassword">
                    {({ field }: any) => (
                      <Input
                        type="password"
                        placeholder="Confirm your new password"
                        {...field}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="confirmPassword">
                    {msg => <p className="text-sm text-destructive">{msg}</p>}
                  </ErrorMessage>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || isSubmitting}
                >
                  {isLoading ? "Changing Password..." : "Change Password"}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}

