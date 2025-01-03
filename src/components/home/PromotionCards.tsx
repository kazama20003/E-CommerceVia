import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const promotions = [
  {
    title: "Oferta de Verano",
    description: "20% de descuento en todas las herramientas eléctricas",
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    buttonText: "Ver oferta"
  },
  {
    title: "Kit de Jardinería",
    description: "Compra el kit completo y llévate gratis una podadora",
    image: "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    buttonText: "Comprar ahora"
  },
  {
    title: "Herramientas Manuales",
    description: "Lleva 3 y paga 2 en toda nuestra selección de herramientas manuales",
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    buttonText: "Ver selección"
  }
]

export default function PromotionCards() {
  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Promociones Especiales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo, index) => (
            <Card key={index} className="overflow-hidden">
              <img src={promo.image} alt={promo.title} className="w-full h-48 object-cover" />
              <CardHeader>
                <CardTitle>{promo.title}</CardTitle>
                <CardDescription>{promo.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  {promo.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}