'use client'

import { useState } from 'react'
import { Truck, Package, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const shippingMethods = [
  {
    name: "Envío Estándar",
    description: "Entrega en 3-5 días hábiles",
    icon: Truck,
    price: "Gratis en compras superiores a $50",
  },
  {
    name: "Envío Express",
    description: "Entrega en 1-2 días hábiles",
    icon: Package,
    price: "$15",
  },
  {
    name: "Envío Mismo Día",
    description: "Entrega el mismo día para pedidos antes de las 2 PM",
    icon: Clock,
    price: "$25 (solo disponible en ciertas áreas)",
  },
]

const deliveryTimes = [
  { zone: "Zona Metropolitana", standard: "2-3 días", express: "1 día" },
  { zone: "Zona Centro", standard: "3-4 días", express: "1-2 días" },
  { zone: "Zona Norte", standard: "4-5 días", express: "2-3 días" },
  { zone: "Zona Sur", standard: "4-5 días", express: "2-3 días" },
]

const faqItems = [
  {
    question: "¿Cómo puedo rastrear mi pedido?",
    answer: "Una vez que tu pedido haya sido enviado, recibirás un correo electrónico con un número de seguimiento. Puedes usar este número en nuestra página de rastreo o en el sitio web de la empresa de transporte."
  },
  {
    question: "¿Qué hago si mi pedido llega dañado?",
    answer: "Si tu pedido llega dañado, por favor contáctanos dentro de las 48 horas siguientes a la recepción. Te ayudaremos a resolver el problema lo antes posible, ya sea con un reemplazo o un reembolso."
  },
  {
    question: "¿Realizan envíos internacionales?",
    answer: "Actualmente, solo realizamos envíos dentro del país. Estamos trabajando para expandir nuestros servicios de envío internacional en el futuro."
  },
  {
    question: "¿Puedo cambiar mi dirección de envío después de realizar el pedido?",
    answer: "Si tu pedido aún no ha sido procesado, podemos cambiar la dirección de envío. Por favor, contáctanos lo antes posible con tu número de pedido y la nueva dirección."
  },
]

export default function ShippingPage() {
  const [openMethodIndex, setOpenMethodIndex] = useState<number | null>(null)

  const toggleMethod = (index: number) => {
    setOpenMethodIndex(openMethodIndex === index ? null : index)
  }

  return (
   <>
   <Header/>
   <main className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Información de Envíos</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Nuestro Compromiso</CardTitle>
            <CardDescription>
              En Via Provisiones, nos comprometemos a entregar tus productos de manera rápida y segura. 
              Ofrecemos varias opciones de envío para adaptarnos a tus necesidades.
            </CardDescription>
          </CardHeader>
        </Card>

        <h2 className="text-2xl font-semibold mb-4">Métodos de Envío</h2>
        <div className="space-y-4 mb-8">
          {shippingMethods.map((method, index) => (
            <Card key={index} className="cursor-pointer" onClick={() => toggleMethod(index)}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary rounded-full p-2">
                    <method.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>{method.name}</CardTitle>
                </div>
                {openMethodIndex === index ? <ChevronUp /> : <ChevronDown />}
              </CardHeader>
              {openMethodIndex === index && (
                <CardContent>
                  <p>{method.description}</p>
                  <p className="font-semibold mt-2">Precio: {method.price}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4">Tiempos de Entrega Estimados</h2>
        <Card className="mb-8">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zona</TableHead>
                  <TableHead>Envío Estándar</TableHead>
                  <TableHead>Envío Express</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryTimes.map((time, index) => (
                  <TableRow key={index}>
                    <TableCell>{time.zone}</TableCell>
                    <TableCell>{time.standard}</TableCell>
                    <TableCell>{time.express}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-4">Preguntas frecuentes sobre envíos</h2>
        <Accordion type="single" collapsible className="mb-8">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center">
          <p className="text-gray-600 mb-4">¿Tienes más preguntas sobre nuestros envíos?</p>
          <Button>Contáctanos</Button>
        </div>
      </div>
    </main>
   <Footer/>
   </>
  )
}