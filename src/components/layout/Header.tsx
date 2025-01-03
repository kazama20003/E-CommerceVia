'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, CircleArrowUp, Search, Heart, User, Menu, ShoppingCart, Home, Tag, Globe } from 'lucide-react'
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
  category: any;
  images: ProductImage[];
  sellingPrice: number;
  description: string;
}

export const Header: React.FC = () => {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const router = useRouter()

  useEffect(() => {
    setIsLoggedIn(!!Cookies.get("token"))
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsSearchOpen(false)
    }
  }, [isMobileMenuOpen])

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.trim()) {
        try {
          const response = await axiosInstance.get(`/products?search=${encodeURIComponent(term)}`)
          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            setSearchResults(response.data.data)
            setSearchError(null)
          } else {
            setSearchResults([])
            setSearchError('No se encontraron productos')
          }
        } catch (error) {
          console.error('Error searching for product:', error)
          setSearchError('Error al buscar productos')
          setSearchResults([])
        }
      } else {
        setSearchResults([])
        setSearchError(null)
      }
    }, 300),
    []
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value
    setSearchTerm(newSearchTerm)
    debouncedSearch(newSearchTerm)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="flex items-center gap-2">
              <CircleArrowUp className="h-8 w-8 text-primary" aria-hidden="true" />
              <span className={cn(
                "font-heading text-xl font-bold tracking-tight transition-opacity duration-200",
                isSearchOpen ? "hidden" : "hidden sm:inline-block"
              )}>
                <span className="text-primary">Via</span>
                <span className="text-foreground">Provisiones</span>
              </span>
              <span className="sr-only">ViaProvisiones Home</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              <NavLink href="/" icon={<Home className="h-4 w-4" aria-hidden="true" />} label="Home" />
              <NavDropdown 
                icon={<ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" />} 
                label="Categories" 
                isOpen={isCategoriesOpen}
                setIsOpen={setIsCategoriesOpen}
              />
              <NavLink href="/offers" icon={<Tag className="h-4 w-4" aria-hidden="true" />} label="Offers" />
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <SearchBar 
              isSearchOpen={isSearchOpen} 
              setIsSearchOpen={setIsSearchOpen}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearchChange={handleSearchChange}
              searchResults={searchResults}
              searchError={searchError}
            />
            <ActionButtons isLoggedIn={isLoggedIn} />
            <MobileMenu 
              isMobileMenuOpen={isMobileMenuOpen} 
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              isCategoriesOpen={isCategoriesOpen}
              setIsCategoriesOpen={setIsCategoriesOpen}
            />
          </div>
        </div>
      </div>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 lg:hidden">
          <div className="container flex h-16 items-center px-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-9 pr-4 rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-orange-500"
                autoFocus
                aria-label="Search products"
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
              <span className="sr-only">Close search</span>
              ✕
            </Button>
          </div>
          <SearchResults searchResults={searchResults} searchError={searchError} />
        </div>
      )}
    </header>
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
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-orange-100 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        pathname === href && "bg-orange-100 text-orange-600"
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
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ icon, label, isOpen, setIsOpen }) => (
  <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
    <DropdownMenuTrigger asChild>
      <Button 
        variant="ghost" 
        className="text-sm font-medium px-3 py-1.5 hover:bg-orange-100 hover:text-orange-600"
        onClick={() => setIsOpen(true)}
      >
        {icon}
        {label}
        <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-[800px]">
      <MenuTabs />
    </DropdownMenuContent>
  </DropdownMenu>
)

interface SearchBarProps {
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchResults: Product[];
  searchError: string | null;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  isSearchOpen, 
  setIsSearchOpen, 
  searchTerm, 
  setSearchTerm, 
  handleSearchChange, 
  searchResults, 
  searchError 
}) => (
  <div className="relative">
    <div className="hidden lg:block relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
      <Input
        type="search"
        placeholder="Search products..."
        className="w-[200px] xl:w-[300px] pl-9 pr-4 rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-orange-500"
        aria-label="Search products"
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>

    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsSearchOpen(true)}
      className="lg:hidden hover:bg-orange-100 hover:text-orange-600"
      aria-label="Search"
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
                src={product.images[0].url}
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
        <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-orange-100 hover:text-orange-600">
          <Globe className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="flex items-center">
          <img src="/english.png" alt="" className="mr-2 h-4 w-4 rounded-sm object-cover" />
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center">
          <img src="/spanish.png" alt="" className="mr-2 h-4 w-4 rounded-sm object-cover" />
          <span>Español</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Link href="/wishList" className="hidden sm:block">
      <Button variant="ghost" size="icon" className="relative hover:bg-orange-100 hover:text-orange-600">
        <Heart className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Wishlist</span>
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-orange-500 text-[10px] font-medium text-white flex items-center justify-center">
          0
        </span>
      </Button>
    </Link>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-orange-100 hover:text-orange-600">
          <User className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isLoggedIn ? (
          <Profile user={{ name: "Kazama", phone: "12312421", avatarURL: '/user.jpg' }} />
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/register" className="w-full flex items-center">
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                Register your account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/login" className="w-full flex items-center">
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                Login to your account
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
  isCategoriesOpen: boolean;
  setIsCategoriesOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  isCategoriesOpen, 
  setIsCategoriesOpen 
}) => (
  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon" className="lg:hidden hover:bg-orange-100 hover:text-orange-600">
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Menu</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-full sm:w-[400px] p-0">
      <SheetHeader className="p-6 border-b">
        <SheetTitle className="text-2xl font-bold">Via Provisiones</SheetTitle>
        <p className="text-sm text-muted-foreground">Navega más rápido</p>
      </SheetHeader>
      <div className="px-6 py-4">
        <nav className="space-y-6">
          <div className="space-y-3">
            <SheetClose asChild>
              <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-orange-100 hover:text-orange-600">
                <Home className="h-4 w-4" aria-hidden="true" />
                Home
              </Link>
            </SheetClose>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground/80 px-3">Categorías</h3>
            <div className="-mx-6 px-6 py-3 bg-muted/40">
              <MenuTabs isMobile={true} />
            </div>
          </div>

          <div className="space-y-3">
            <SheetClose asChild>
              <Link href="/offers" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-orange-100 hover:text-orange-600">
                <Tag className="h-4 w-4" aria-hidden="true" />
                Offers
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href="/wishList" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-orange-100 hover:text-orange-600">
                <Heart className="h-4 w-4" aria-hidden="true" />
                WishList
              </Link>
            </SheetClose>
          </div>
        </nav>
      </div>
    </SheetContent>
  </Sheet>
)

