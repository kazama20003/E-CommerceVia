'use client'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff, Chrome, Facebook } from 'lucide-react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { axiosInstance } from '@/lib/axiosInstance'
import { error } from 'console'
import { useRouter } from 'next/navigation'

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  mobile: Yup.string().matches(/^[0-9]+$/, "Must be only digits").min(10, 'Too Short!').max(15, 'Too Long!').required('Required'),
  password: Yup.string().min(6, 'Too Short!').required('Required')
})

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useRouter();
  const { toast } = useToast();
  return (
    <div className="flex justify-center min-h-screen py-12">
      {/* Left Section */}
      <div className="hidden shadow-md lg:flex lg:w-1/2 bg-gradient-to-br from-[#f1974c] to-[#FF5E3A] p-12 relative">
        <div className="text-white max-w-xl">
          <h1 className="text-5xl font-bold mb-4">
            Bienvenido!
          </h1>
          <p className="text-lg opacity-90">
            Simplify your e-commerce management with our user-friendly admin dashboard.
          </p>
        </div>
        <Image
          src="/login.png"
          alt="Dashboard illustration"
          width={900}
          height={500}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
        />
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#FF7A50] text-white p-2 rounded-lg">
              <span className="font-bold text-xl">V</span>
            </div>
            <span className="font-bold text-xl">Provisiones</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="text-gray-500">Please fill in the details below</p>
          </div>

          <Formik
            initialValues={{ name: '', email: '', mobile: '', password: '' }}
            validationSchema={RegisterSchema}
            onSubmit={(values) => {
              axiosInstance.post("/register",values).then((data)=>{
                if (data?.data?.status) {
                  toast({
                    title:`${data?.data?.msg} succes`
                  });
                  setTimeout(() => {
                    navigate.push("/login")
                  }, 3000);
                }
                
              }).catch(err=>{
                console.log(err.response.data);
                toast({
                  title:`${err?.response?.data} Error`
                })
              })
              
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Field
                      as={Input}
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      className="w-full px-4 py-2"
                    />
                    {errors.name && touched.name ? (
                      <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                    ) : null}
                  </div>
                  <div>
                    <Field
                      as={Input}
                      type="email"
                      name="email"
                      placeholder="Email address"
                      className="w-full px-4 py-2"
                    />
                    {errors.email && touched.email ? (
                      <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                    ) : null}
                  </div>
                  <div>
                    <Field
                      as={Input}
                      type="tel"
                      name="mobile"
                      placeholder="Mobile number"
                      className="w-full px-4 py-2"
                    />
                    {errors.mobile && touched.mobile ? (
                      <div className="text-red-500 text-sm mt-1">{errors.mobile}</div>
                    ) : null}
                  </div>
                  <div className="relative">
                    <Field
                      as={Input}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      className="w-full px-4 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {errors.password && touched.password ? (
                      <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                    ) : null}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#FF7A50] hover:bg-[#FF5E3A]" disabled={isSubmitting}>
                  Create Account
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or Sign up with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button type="button" variant="outline" className="w-full">
                    <Chrome width={20} height={20} />
                    Google
                  </Button>
                  <Button type="button" variant="outline" className="w-full">
                    <Facebook width={20} height={20} />
                    Facebook
                  </Button>
                </div>
              </Form>
            )}
          </Formik>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#FF7A50] hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

