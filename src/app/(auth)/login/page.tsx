'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff, Facebook, Chrome } from 'lucide-react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { axiosInstance } from '@/lib/axiosInstance'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Cookies from "js-cookie"

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Correo electrónico inválido').required('Requerido'),
  password: Yup.string().required('Requerido'),
})

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast();
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f1974c] to-[#FF5E3A]">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#f1974c] to-[#FF5E3A] p-12 relative">
        <div className="text-white max-w-xl">
          <h1 className="text-6xl font-bold mb-6">
            ¡Bienvenido de nuevo!
          </h1>
          <p className="text-xl opacity-90">
            Inicie sesión para administrar su panel de comercio electrónico con facilidad.
          </p>
          <Image
            src="/login.png"
            alt="Dashboard illustration"
            width={900}
            height={500}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            priority
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-[#FF7A50] text-white p-2 rounded-lg">
                <span className="font-bold text-xl">Via</span>
              </div>
              <span className="font-bold text-2xl text-[#FF7A50]">Provisiones</span>
            </div>
            <CardTitle className="text-3xl font-bold">Inicie sesión en su cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={(values, { setSubmitting }) => {
                axiosInstance.post("/login", values)
                  .then((response) => {
                    const data = response.data;
                    if (data?.status) {
                      toast({
                        title: "Inicio de sesión exitoso",
                        description: data?.msg,
                        variant: "success",
                      })
                      Cookies.set('token', data?.token, { expires: 1 });
                      Cookies.set('role', data?.role, { expires: 1 })
                      setTimeout(() => {
                        if (data?.role === "customer") {
                          router.push("/")
                        } else {
                          router.push("/dashboard")
                        }
                      }, 3000);
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                    const errorMessage = error.response?.data?.msg || "Ha ocurrido un error. Por favor, inténtelo de nuevo.";
                    toast({
                      title: "Error de inicio de sesión",
                      description: errorMessage,
                      variant: "destructive",
                    })
                  })
                  .finally(() => {
                    setSubmitting(false)
                  })
              }}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Field
                        as={Input}
                        id="email"
                        type="email"
                        name="email"
                        placeholder="nombre@ejemplo.com"
                        className={`w-full mt-1 ${errors.email && touched.email ? 'border-red-500' : ''}`}
                      />
                      {errors.email && touched.email ? (
                        <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                      ) : null}
                    </div>
                    <div>
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative mt-1">
                        <Field
                          as={Input}
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="••••••••"
                          className={`w-full pr-10 ${errors.password && touched.password ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.password && touched.password ? (
                        <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember-me" />
                      <Label htmlFor="remember-me" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Recordar Contraseña
                      </Label>
                    </div>

                    <Link href="/forgot-password" className="text-sm font-medium text-[#FF7A50] hover:text-[#FF5E3A]">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full bg-[#FF7A50] hover:bg-[#FF5E3A] text-white" disabled={isSubmitting}>
                    {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">O continuar con</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button type="button" variant="outline" className="w-full">
                      <Chrome className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                    <Button type="button" variant="outline" className="w-full">
                      <Facebook className="mr-2 h-4 w-4" />
                      Facebook
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
          <CardFooter>
            <p className="text-center text-sm text-gray-500 w-full">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="font-medium text-[#FF7A50] hover:underline">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

