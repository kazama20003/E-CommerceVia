'use client'

import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff, Chrome, Facebook, ArrowLeft } from 'lucide-react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { axiosInstance } from '@/lib/axiosInstance'
import { useRouter } from 'next/navigation'

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  mobile: Yup.string().matches(/^[0-9]+$/, "Must be only digits").min(10, 'Too Short!').max(15, 'Too Long!').required('Required'),
  password: Yup.string().min(6, 'Too Short!').required('Required')
})

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter();
  const { toast } = useToast();

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="flex min-h-screen bg-gradient-to-br from-[#f1974c] to-[#FF5E3A]"
    >
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#f1974c] to-[#FF5E3A] p-12 relative">
        <div className="text-white max-w-xl">
          <h1 className="text-5xl font-bold mb-4">
            ¡Bienvenido!
          </h1>
          <p className="text-lg opacity-90">
            Simplifica la gestión de tu comercio electrónico con nuestro panel de administración fácil de usar.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Image
            src="/login.png"
            alt="Dashboard illustration"
            width={900}
            height={500}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            priority
          />
        </motion.div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-[#FF7A50] text-white p-2 rounded-lg">
                  <span className="font-bold text-xl">Via</span>
                </div>
                <span className="font-bold text-2xl text-[#FF7A50]">Provisiones</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-[#FF7A50]"
              >
                <ArrowLeft size={24} />
              </Button>
            </div>
            <CardTitle className="text-3xl font-bold">Crear Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{ name: '', email: '', mobile: '', password: '' }}
              validationSchema={RegisterSchema}
              onSubmit={(values) => {
                axiosInstance.post("/register", values).then((data) => {
                  if (data?.data?.status) {
                    toast({
                      title: `${data?.data?.msg} success`
                    });
                    setTimeout(() => {
                      router.push("/login")
                    }, 3000);
                  }
                }).catch(err => {
                  console.log(err.response.data);
                  toast({
                    title: `${err?.response?.data} Error`
                  })
                })
              }}
            >
              {({ errors, touched, isSubmitting }) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <Form className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre completo</Label>
                        <Field
                          as={Input}
                          id="name"
                          type="text"
                          name="name"
                          placeholder="Tu nombre completo"
                          className={`w-full mt-1 ${errors.name && touched.name ? 'border-red-500' : ''}`}
                        />
                        {errors.name && touched.name ? (
                          <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                        ) : null}
                      </div>
                      <div>
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Field
                          as={Input}
                          id="email"
                          type="email"
                          name="email"
                          placeholder="tu@email.com"
                          className={`w-full mt-1 ${errors.email && touched.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && touched.email ? (
                          <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                        ) : null}
                      </div>
                      <div>
                        <Label htmlFor="mobile">Número de teléfono</Label>
                        <Field
                          as={Input}
                          id="mobile"
                          type="tel"
                          name="mobile"
                          placeholder="Tu número de teléfono"
                          className={`w-full mt-1 ${errors.mobile && touched.mobile ? 'border-red-500' : ''}`}
                        />
                        {errors.mobile && touched.mobile ? (
                          <div className="text-red-500 text-sm mt-1">{errors.mobile}</div>
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

                    <Button type="submit" className="w-full bg-[#FF7A50] hover:bg-[#FF5E3A] text-white" disabled={isSubmitting}>
                      {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">O regístrate con</span>
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
                </motion.div>
              )}
            </Formik>
          </CardContent>
          <CardFooter>
            <p className="text-center text-sm text-gray-500 w-full">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="font-medium text-[#FF7A50] hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  )
}

