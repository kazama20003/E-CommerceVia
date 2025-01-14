'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { ChevronDown, CircleArrowUp, Search, Heart, User, Menu, ShoppingCart, Home, Tag, Globe, Facebook, Instagram, Phone, Mail } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader, SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import MenuTabs from './MenuThabs'
import { Profile } from './Profile'
import { ShoppingCartSheet } from '../ShoppingCartSheet'
import Cookies from 'js-cookie'
import { axiosInstance } from '@/lib/axiosInstance'
import debounce from 'lodash.debounce'

interface ProductImage {
  id: string;
  url: string;
  _id: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: {
    _id: string;
    name: string;
  };
  images: ProductImage[];
  sellingPrice: number;
  description: string;
}

export const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  useEffect(() => {
    setIsLoggedIn(!!Cookies.get("token"))
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsSearchOpen(false)
    }
  }, [isMobileMenuOpen])

  const debouncedSearch = useCallback((term: string) => {
    const search = debounce(async (searchTerm: string) => {
      if (searchTerm.trim()) {
        try {
          const response = await axiosInstance.get(`/products?search=${encodeURIComponent(searchTerm)}`)
          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            setSearchResults(response.data.data)
            setSearchError(null)
          } else {
            setSearchResults([])
            setSearchError('No se encontraron productos')
          }
        } catch (error) {
          console.error('Error al buscar productos:', error)
          setSearchError('Error al buscar productos')
          setSearchResults([])
        }
      } else {
        setSearchResults([])
        setSearchError(null)
      }
    }, 300)
    
    search(term)
  }, [setSearchResults, setSearchError])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value
    setSearchTerm(newSearchTerm)
    debouncedSearch(newSearchTerm)
  }

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md transition-all duration-300"
      initial={{ height: "auto" }}
      animate={{ height: isScrolled ? "64px" : "auto" }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="flex flex-wrap justify-between items-center py-2 text-xs sm:text-sm border-b"
          initial={{ opacity: 1, height: "auto" }}
          animate={{ 
            opacity: isScrolled ? 0 : 1, 
            height: isScrolled ? 0 : "auto",
            marginBottom: isScrolled ? "-1px" : "0px"
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mb-2 sm:mb-0">
            <span className="flex items-center">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">+1 234 567 8900</span>
              <span className="sm:hidden">Llamar</span>
            </span>
            <span className="flex items-center">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">info@ferreteriaviaprovisiones.com</span>
              <span className="sm:hidden">Email</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook className="h-4 w-4 text-blue-600" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className="h-4 w-4 text-pink-600" />
            </a>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-green-500">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.35 5L2 22l5-1.35C8.47 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.5 0-2.93-.39-4.19-1.08l-.3-.18-3.1.82.82-3.1-.18-.3C4.39 14.93 4 13.5 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.19-5.91c-.24-.12-1.41-.69-1.63-.77-.22-.08-.38-.12-.53.12-.15.23-.59.77-.72.92-.13.15-.27.17-.5.06-.24-.12-1-.37-1.9-1.17-.7-.62-1.17-1.39-1.31-1.62-.14-.23-.01-.36.1-.47.11-.1.23-.27.35-.4.12-.13.16-.23.24-.38.08-.15.04-.29-.02-.41-.06-.12-.53-1.28-.73-1.75-.19-.46-.39-.39-.53-.4-.14 0-.3-.01-.45-.01-.16 0-.41.06-.63.29-.22.23-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.57.18 1.09.16 1.5.1.46-.07 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
              </svg>
            </a>
          </div>
        </motion.div>
        <motion.div 
          className="flex flex-wrap items-center justify-between py-2 sm:py-4"
          initial={{ y: 0 }}
          animate={{ y: isScrolled ? -16 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <Link href="/" className="flex items-center gap-2">
              <CircleArrowUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" aria-hidden="true" />
              <span className={cn(
                "font-heading text-lg sm:text-xl font-bold tracking-tight transition-opacity duration-200",
                isSearchOpen ? "hidden" : "hidden sm:inline-block"
              )}>
                <span className="text-orange-500">Ferretería</span>
                <span className="text-foreground">ViaProvisiones</span>
              </span>
              <span className="sr-only">Ferretería ViaProvisiones Inicio</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/" icon={<Home className="h-4 w-4" aria-hidden="true" />} label="Inicio" />
              <NavLink href="/products" icon={<ShoppingCart className="h-4 w-4" aria-hidden="true" />} label="Productos" />
              <NavDropdown 
                icon={<Tag className="h-4 w-4 mr-2" aria-hidden="true" />} 
                label="Categorías" 
              />
              <NavLink href="/offers" icon={<Tag className="h-4 w-4" aria-hidden="true" />} label="Ofertas" />
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <SearchBar 
              isSearchOpen={isSearchOpen} 
              setIsSearchOpen={setIsSearchOpen}
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange}
              searchResults={searchResults}
              searchError={searchError}
            />
            <ActionButtons isLoggedIn={isLoggedIn} />
            <MobileMenu 
              isMobileMenuOpen={isMobileMenuOpen} 
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
          </div>
        </motion.div>
      </div>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 lg:hidden">
          <div className="container flex h-16 items-center px-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="w-full pl-9 pr-4 rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-orange-500"
                autoFocus
                aria-label="Buscar productos"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => setIsSearchOpen(false)}
            >
              <span className="sr-only">Cerrar búsqueda</span>
              ✕
            </Button>
          </div>
          <SearchResults searchResults={searchResults} searchError={searchError} />
        </div>
      )}
    </motion.header>
  )
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, label }) => {
  const pathname = usePathname()
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-orange-100 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        pathname === href && "bg-orange-100 text-orange-800"
      )}
    >
      {icon}
      {label}
    </Link>
  )
}

interface NavDropdownProps {
  icon: React.ReactNode;
  label: string;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ icon, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-sm font-medium px-3 py-1.5 hover:bg-orange-100 hover:text-orange-800"
          onClick={() => setIsOpen(true)}
        >
          {icon}
          {label}
          <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[90vw] max-w-[800px] p-0">
        <MenuTabs />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface SearchBarProps {
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchResults: Product[];
  searchError: string | null;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  setIsSearchOpen, 
  searchTerm, 
  handleSearchChange, 
  searchResults, 
  searchError 
}) => (
  <div className="relative">
    <div className="hidden lg:block relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
      <Input
        type="search"
        placeholder="Buscar productos..."
        className="w-[200px] xl:w-[300px] pl-9 pr-4 rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-orange-500"
        aria-label="Buscar productos"
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>

    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsSearchOpen(true)}
      className="lg:hidden hover:bg-orange-100 hover:text-orange-800"
      aria-label="Buscar"
    >
      <Search className="h-5 w-5" aria-hidden="true" />
    </Button>

    <SearchResults searchResults={searchResults} searchError={searchError} />
  </div>
)

interface SearchResultsProps {
  searchResults: Product[];
  searchError: string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchResults, searchError }) => (
  <>
    {(searchResults.length > 0 || searchError) && (
      <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-lg max-h-[60vh] overflow-y-auto z-50">
        {searchError && <p className="p-4 text-red-500">{searchError}</p>}
        {searchResults.map((product) => (
          <Link key={product._id} href={`/products/${product.slug}`} className="flex items-center p-4 hover:bg-gray-100">
            {product.images && product.images.length > 0 && (
              <Image
                src={product.images[0].url || "/placeholder.svg"}
                alt={product.name}
                width={50}
                height={50}
                className="object-cover rounded-md mr-4"
              />
            )}
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.description.substring(0, 50)}...</p>
              <p className="text-sm font-medium text-orange-600">${product.sellingPrice.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    )}
  </>
)

interface ActionButtonsProps {
  isLoggedIn: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ isLoggedIn }) => (
  <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-orange-100 hover:text-orange-800 transition-colors duration-200">
          <Globe className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Cambiar idioma</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="flex items-center">
          <Image src="/english.png" alt="" width={16} height={16} className="mr-2 rounded-sm object-cover" />
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center">
          <Image src="/spanish.png" alt="" width={16} height={16} className="mr-2 rounded-sm object-cover" />
          <span>Español</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Link href="/wishList" className="hidden sm:block">
      <Button variant="ghost" size="icon" className="relative hover:bg-orange-100 hover:text-orange-800 transition-colors duration-200">
        <Heart className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Lista de deseos</span>
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-orange-500 text-[10px] font-medium text-white flex items-center justify-center">
          0
        </span>
      </Button>
    </Link>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-orange-100 hover:text-orange-800 transition-colors duration-200">
          <User className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Menú de usuario</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isLoggedIn ? (
          <Profile/>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/register" className="w-full flex items-center">
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                Registrar cuenta
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/login" className="w-full flex items-center">
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                Iniciar sesión
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>

    <ShoppingCartSheet />
  </>
)

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen
}) => (
  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon" className="lg:hidden hover:bg-orange-100 hover:text-orange-800 transition-colors duration-200">
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Menú</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-full sm:w-[400px] p-0">
      <SheetHeader className="p-6 border-b">
        <SheetTitle className="text-2xl font-bold">Ferretería Via Provisiones</SheetTitle>
        <p className="text-sm text-muted-foreground">Navega más rápido</p>
      </SheetHeader>
      <div className="px-6 py-4">
        <nav className="space-y-6">
          <div className="space-y-3">
            <SheetClose asChild>
              <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-orange-100 hover:text-orange-800">
                <Home className="h-4 w-4" aria-hidden="true" />
                Inicio
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href="/products" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-orange-100 hover:text-orange-800">
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                Productos
              </Link>
            </SheetClose>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground/80 px-3">Categorías</h3>
            <div className="-mx-6 px-0 py-3 bg-white">
              <MenuTabs isMobile={true} />
            </div>
          </div>

          <div className="space-y-3">
            <SheetClose asChild>
              <Link href="/offers" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-orange-100 hover:text-orange-800">
                <Tag className="h-4 w-4" aria-hidden="true" />
                Ofertas
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href="/wishList" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-orange-100 hover:text-orange-800">
                <Heart className="h-4 w-4" aria-hidden="true" />
                Lista de deseos
              </Link>
            </SheetClose>
          </div>
        </nav>
      </div>
    </SheetContent>
  </Sheet>
)

