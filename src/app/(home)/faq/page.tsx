'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

type FAQ = {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: '¿Cuáles son los métodos de envío disponibles?',
    answer:
      'Ofrecemos envíos a nivel nacional mediante transportadoras confiables. El tiempo de entrega depende de tu ubicación y varía entre 2 a 5 días hábiles.',
  },
  {
    question: '¿Los productos tienen garantía?',
    answer:
      'Sí, todos nuestros productos cuentan con garantía de fábrica que varía entre 6 meses y 1 año, dependiendo del tipo de herramienta. Para más información, consulta la sección de garantías en el sitio.',
  },
  {
    question: '¿Cómo puedo realizar una devolución?',
    answer:
      'Para realizar una devolución, debes comunicarte con nuestro equipo de soporte al correo devoluciones@ferreteria.com dentro de los primeros 30 días desde la recepción del producto. El artículo debe estar en perfectas condiciones y en su empaque original.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos pagos con tarjetas de crédito, débito, transferencias bancarias y plataformas como PayPal. Todas las transacciones son 100% seguras.',
  },
  {
    question: '¿Cómo puedo contactarlos?',
    answer:
      'Puedes contactarnos a través de nuestro correo electrónico info@ferreteria.com o llamándonos al +1 234 567 89. Nuestro horario de atención es de lunes a sábado, de 8:00 am a 6:00 pm.',
  },
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFAQs = useMemo(() => {
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  return (
    <>
    <Header></Header>
    <main className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Preguntas Frecuentes</h1>
        
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar preguntas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {filteredFAQs.length === 0 ? (
          <p className="text-center text-gray-600">No se encontraron resultados para tu búsqueda.</p>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">¿No encontraste lo que buscabas?</p>
          <Button>Contáctanos</Button>
        </div>
      </div>
    </main>
    <Footer></Footer>
    </>
  )
}