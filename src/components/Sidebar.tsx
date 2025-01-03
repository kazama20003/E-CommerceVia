'use client'

import Image from 'next/image'
import Link from 'next/link'
import { User, List, Package, Lock, MapPin, Settings, LogOut, Menu } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { Fragment } from 'react'
import { Button } from "@/components/ui/button"

const menuItems = [
  { href: "/accounts/overView", icon: User, label: "Overview" },
  { href: "/accounts/orderHistory", icon: List, label: "Order History" },
  { href: "/accounts/returnOrders", icon: Package, label: "Return Orders" },
  { href: "/accounts/info", icon: Settings, label: "Account Info" },
  { href: "/accounts/changePassword", icon: Lock, label: "Change Password" },
  { href: "/accounts/address", icon: MapPin, label: "Address" },
  { href: "/", icon: LogOut, label: "Logout" },
]

export function DashboardSidebar() {
  const { isMobile } = useSidebar()

  return (
    <>
      {isMobile && (
        <div className="fixed top-0 left-0 z-40 w-full bg-background border-b p-2">
          <SidebarTrigger>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SidebarTrigger>
        </div>
      )}
      <Sidebar className="border-r pt-2">
        <SidebarContent>
          <SidebarGroup>
            <div className="flex flex-col items-center p-4 mb-4 bg-gradient-to-b from-primary/20 to-background rounded-lg">
              <Image
                src="/accesorios.jpg"
                alt="User Avatar"
                width={80}
                height={80}
                className="rounded-full mb-2 border-2 border-background shadow-md"
                priority
                style={{ width: '80px', height: '80px' }}
              />
              <h2 className="font-semibold text-base">Will Smith</h2>
              <p className="text-xs text-muted-foreground">+880125333344</p>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item, index) => (
                  <Fragment key={item.href}>
                    {index === menuItems.length - 1 && (
                      <SidebarMenuItem className="my-1">
                        <hr className="border-t border-primary/20" />
                      </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href={item.href} className="flex items-center py-1.5 px-3 w-full transition-colors hover:bg-primary/10 rounded-md">
                          <item.icon className="mr-2 h-4 w-4" />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Fragment>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  )
}

