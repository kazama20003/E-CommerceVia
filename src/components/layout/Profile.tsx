'use client'

import { FileClock, PackageMinus, UserCog, LockKeyhole, Mail, Power, LayoutDashboard } from 'lucide-react'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'

type MenuItem = {
  icon: JSX.Element
  label: string
  href: string
  onClick?: () => void
}

type User = {
  avatarURL: string
  name: string
  phone: string
}

type ProfileProps = {
  user: User
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [role, setRole] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Read the role from the cookie when the component mounts
    const userRole = Cookies.get('role')
    setRole(userRole)
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

  return (
    <div className="w-full">
      <div className="flex flex-col items-center py-4 border-b">
        <Avatar className="h-16 w-16 mb-2">
          <AvatarImage src={user.avatarURL} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold">{user.name}</h2>
        <p className="text-sm text-muted-foreground">{user.phone}</p>
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

