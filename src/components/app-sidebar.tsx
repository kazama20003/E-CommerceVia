"use client"

import * as React from "react"
import { BookOpen, Bot, Command, Frame, LifeBuoy, Map, PieChart, Send, SquareTerminal, Tag, ShoppingCart } from 'lucide-react'

import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Cuentas",
      url: "/accounts",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Historial",
      url: "/accounts/orderHistory",
      icon: SquareTerminal,
      isActive: false,
    },
    {
      title: "Retornadas",
      url: "/accounts/returnOrders",
      icon: Bot,
    },
    {
      title: "Información",
      url: "/accounts/info",
      icon: BookOpen,
    },
    {
      title: "Contraseñas",
      url: "/accounts/changePassword",
      icon: Tag,
    },
  ],
  navOrders: [
    {
      title: "Correos",
      url: "/accounts/address",
      icon: ShoppingCart,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "https://phoenix-solutions-it.vercel.app/",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "https://phoenix-solutions-it.vercel.app/",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Via Provisiones</span>
                  <span className="truncate text-xs">E-commerce</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

