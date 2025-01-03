import Link from 'next/link'
import { CircleArrowUp, Instagram, Twitter, Facebook } from 'lucide-react'

const FooterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col space-y-3">
    <h3 className="font-semibold text-lg mb-2 text-gray-800">{title}</h3>
    {children}
  </div>
)

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link 
    href={href} 
    className="text-gray-600 hover:text-orange-500 transition-colors text-sm"
  >
    {children}
  </Link>
)

const SocialIcon = ({ href, icon: Icon }: { href: string; icon: React.ElementType }) => (
  <Link 
    href={href} 
    className="text-gray-600 hover:text-orange-500 transition-colors p-2 rounded-full hover:bg-orange-100"
  >
    <Icon className="w-5 h-5" />
    <span className="sr-only">Síguenos en {href.split('.com/')[1]}</span>
  </Link>
)

export default function Footer() {
  return (
    <footer className="bg-gray-50 pt-16 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <CircleArrowUp className="text-orange-500 text-3xl" />
              <div className="font-bold">
                <span className="text-3xl font-bold text-orange-500">Via</span>
                <span className="text-3xl font-bold text-gray-700">Provisiones</span>
              </div>
            </Link>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Tu destino para herramientas y suministros de calidad. Equipando profesionales y entusiastas desde 2023.
            </p>
            <div className="flex space-x-4">
              <SocialIcon href="https://facebook.com/viaprovisiones" icon={Facebook} />
              <SocialIcon href="https://instagram.com/viaprovisiones" icon={Instagram} />
              <SocialIcon href="https://twitter.com/viaprovisiones" icon={Twitter} />
            </div>
          </div>

          <FooterSection title="Soporte y Mantenimiento">
            <FooterLink href="/faq">FAQ</FooterLink>
            <FooterLink href="/return-exchange">Devoluciones y cambios</FooterLink>
            <FooterLink href="/shipping">Envíos</FooterLink>
          </FooterSection>

          <FooterSection title="Servicio al Cliente">
            <FooterLink href="/contacto">Contacto</FooterLink>
            <FooterLink href="/faq">Preguntas Frecuentes</FooterLink>
            <FooterLink href="/envios">Información de Envíos</FooterLink>
            <FooterLink href="/devoluciones">Política de Devoluciones</FooterLink>
          </FooterSection>

          <FooterSection title="Información">
            <FooterLink href="/sobre-nosotros">Sobre Nosotros</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/trabaja-con-nosotros">Trabaja con Nosotros</FooterLink>
            <FooterLink href="/privacidad">Política de Privacidad</FooterLink>
          </FooterSection>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500">
          <p className="text-sm mb-2">Desarrollado por kazamadev</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} Via Provisiones. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

