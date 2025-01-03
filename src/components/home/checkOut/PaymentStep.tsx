import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from 'next/image'

interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
}

interface PaymentStepProps {
  onBack: () => void
  onConfirmOrder: (paymentMethod: string) => void
}

export function PaymentStep({ onBack, onConfirmOrder }: PaymentStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const paymentMethods: PaymentMethod[] = [
    { id: 'creditCard', name: 'Credit Card', logo: '/credicard.png' },
    { id: 'yape', name: 'Yape', logo: '/yape.png' },
    { id: 'whatsapp', name: 'WhatsApp', logo: '/whatsap.png' },
    { id: 'paypal', name: 'PayPal', logo: '/paypal.png' },
  ]

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-gray-900">Select Payment Method</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all ${
              selectedMethod === method.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <Image
                src={method.logo}
                alt={method.name}
                width={80}
                height={40}
                className="mb-2"
              />
              <p className="text-sm font-medium text-center">{method.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onBack}>
          Back to Address
        </Button>
        <Button 
          onClick={() => selectedMethod && onConfirmOrder(selectedMethod)}
          disabled={!selectedMethod}
        >
          Place Order
        </Button>
      </div>
    </div>
  )
}

