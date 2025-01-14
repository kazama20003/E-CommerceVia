'use client'

import { FileClock, PackageMinus, UserCog, LockKeyhole, Mail, Power, LayoutDashboard } from 'lucide-react'
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { axiosInstance } from '@/lib/axiosInstance'

type MenuItem = {
  icon: JSX.Element
  label: string
  href: string
  onClick?: () => void
}

type User = {
  name: string
  mobile: string
  email: string
  role: string
}

export const Profile: React.FC = () => {
  const [role, setRole] = useState<string | undefined>(undefined)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = Cookies.get('token')
        if (!token) {
          throw new Error('No token found')
        }

        const decodedToken = jwtDecode(token) as { userId: string }
        const userId = decodedToken.userId

        const response = await axiosInstance.get(`/users/${userId}`)
        setUser(response.data.user)
        setRole(response.data.user.role)
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load user data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const menuItems: MenuItem[] = [
    {
      icon: <FileClock className="h-4 w-4" />,
      label: 'Historial Orden',
      href: '/accounts/overView'
    },
    {
      icon: <PackageMinus className="h-4 w-4" />,
      label: 'Regresar Orden',
      href: '/accounts/returnOrder'
    },
    {
      icon: <UserCog className="h-4 w-4" />,
      label: 'Informacion de cuenta',
      href: '/accounts/info'
    },
    {
      icon: <LockKeyhole className="h-4 w-4" />,
      label: 'Cambiar contraseña',
      href: '/accounts/changePassword'
    },
    {
      icon: <Mail className="h-4 w-4" />,
      label: 'Email',
      href: '/accounts/email'
    },
    // Conditional menu item for admin
    ...(role === 'admin' ? [{
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: 'Dashboard',
      href: '/dashboard'
    }] : []),
    {
      icon: <Power className="h-4 w-4" />,
      label: 'Cerrar sesion',
      href: '#',
      onClick: () => {
        Cookies.remove('token');
        Cookies.remove('role');
        // Add any additional logout logic here, such as redirecting to the home page
        window.location.href = '/';
      }
    },
  ]

  if (isLoading) {
    return <div className="w-full text-center py-4">Cargando...</div>
  }

  if (error) {
    return <div className="w-full text-center py-4 text-red-500">{error}</div>
  }

  if (!user) {
    return <div className="w-full text-center py-4">No se encontró información del usuario</div>
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center py-4 border-b">
        <Avatar className="h-16 w-16 mb-2">
          <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold">{user.name || 'Usuario'}</h2>
        <p className="text-sm text-muted-foreground">{user.mobile || 'No phone'}</p>
      </div>
      
      <div className="p-2">
        <div className="grid grid-cols-3 gap-1">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              href={item.href}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-accent"
              onClick={item.onClick}
            >
              <span className="p-2 rounded-full bg-accent/10 mb-1">
                {item.icon}
              </span>
              <span className="text-[10px] text-center">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

