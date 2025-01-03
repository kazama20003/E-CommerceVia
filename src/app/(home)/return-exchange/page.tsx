'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Package, RefreshCw, Truck } from 'lucide-react'
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
import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const returnSteps = [
  {
    title: "Inicia tu solicitud",
    description: "Contacta a nuestro servicio al cliente dentro de los 30 días de la compra.",
    icon: Package,
  },
  {
    title: "Empaca el producto",
    description: "Asegúrate de que el producto esté en su empaque original y en perfectas condiciones.",
    icon: RefreshCw,
  },
  {
    title: "Envía el producto",
    description: "Utiliza la etiqueta de envío prepagada que te proporcionaremos.",
    icon: Truck,
  },
]

const faqItems = [
  {
    question: "¿Cuál es el plazo para realizar una devolución?",
    answer: "Tienes 30 días desde la fecha de recepción del producto para iniciar una solicitud de devolución o cambio."
  },
  {
    question: "¿Qué productos no son elegibles para devolución?",
    answer: "Productos personalizados, artículos de higiene personal, y productos con sellos de garantía rotos no son elegibles para devolución."
  },
  {
    question: "¿Cómo se procesa el reembolso?",
    answer: "El reembolso se procesará utilizando el mismo método de pago que usaste para la compra original. Puede tomar de 5 a 10 días hábiles en reflejarse en tu cuenta."
  },
  {
    question: "¿Puedo cambiar un producto por otro diferente?",
    answer: "Sí, puedes solicitar un cambio por otro producto. Si el nuevo producto tiene un precio diferente, se ajustará la diferencia en el momento del cambio."
  },
]

export default function ReturnsAndExchangesPage() {
  const [openStepIndex, setOpenStepIndex] = useState<number | null>(null)

  const toggleStep = (index: number) => {
    setOpenStepIndex(openStepIndex === index ? null : index)
  }

  return (
    <>
    <Header></Header>
    <main className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Devoluciones y Cambios</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Nuestra Política</CardTitle>
            <CardDescription>
              En Via Provisiones, nos esforzamos por garantizar tu satisfacción. Si no estás completamente satisfecho con tu compra, 
              ofrecemos devoluciones y cambios fáciles dentro de los 30 días posteriores a la recepción de tu pedido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Para ser elegible para una devolución, el artículo debe estar sin usar y en las mismas condiciones en que lo recibiste. 
              También debe estar en el embalaje original. Algunos artículos, como productos personalizados o de higiene personal, 
              no son elegibles para devolución.
            </p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-4">Cómo realizar una devolución</h2>
        <div className="space-y-4 mb-8">
          {returnSteps.map((step, index) => (
            <Card key={index} className="cursor-pointer" onClick={() => toggleStep(index)}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary rounded-full p-2">
                    <step.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                </div>
                {openStepIndex === index ? <ChevronUp /> : <ChevronDown />}
              </CardHeader>
              {openStepIndex === index && (
                <CardContent>
                  <p>{step.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4">Preguntas frecuentes sobre devoluciones</h2>
        <Accordion type="single" collapsible className="mb-8">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center">
          <p className="text-gray-600 mb-4">¿Tienes más preguntas sobre devoluciones o cambios?</p>
          <Button>Contáctanos</Button>
        </div>
      </div>
    </main>
    <Footer></Footer>
    </>
  )
}