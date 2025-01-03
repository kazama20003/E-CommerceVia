import { CheckCircle, Circle } from 'lucide-react'

interface CheckoutProgressProps {
  step: 'cart' | 'address' | 'payment'
}

export function CheckoutProgress({ step }: CheckoutProgressProps) {
  const steps = [
    { id: 'cart', name: 'Cart' },
    { id: 'address', name: 'Address' },
    { id: 'payment', name: 'Payment' },
  ]

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((s, stepIdx) => (
          <li key={s.name} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
            {s.id === step || steps.indexOf(s) <= steps.findIndex(item => item.id === step) ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <a
                  href="#"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary-dark"
                >
                  <CheckCircle className="h-5 w-5 text-white" aria-hidden="true" />
                  <span className="sr-only">{s.name}</span>
                </a>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a
                  href="#"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white"
                  aria-current="step"
                >
                  <Circle className="h-5 w-5 text-gray-500" aria-hidden="true" />
                  <span className="sr-only">{s.name}</span>
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

