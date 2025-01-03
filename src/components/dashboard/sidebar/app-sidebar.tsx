"use client"

import * as React from "react"
import { BookOpen, Bot, Command, Frame, LifeBuoy, Map, PieChart, Send, Settings2, SquareTerminal, Tag, ShoppingCart } from 'lucide-react'

import { NavMain } from "./nav-main"
import { NavOrders } from "./nav-orders"
import { NavProjects } from "./nav-projects"
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

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Categorias",
      url: "/dashboard/categories",
      icon: Bot,
    },
    {
      title: "Productos",
      url: "/dashboard/products",
      icon: BookOpen,
    },
    {
      title: "Marcas",
      url: "/dashboard/brands",
      icon: Tag,
    },
  ],
  navOrders: [
    {
      title: "Ver pedidos",
      url: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      title: "Ordenes de devolución",
      url: "/dashboard/returnOrders",
      icon: ShoppingCart,
    },
    {
      title: "Devoluciones y reembolsos",
      url: "/dashboard/returnRefunds",
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
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Via Provisiones</span>
                  <span className="truncate text-xs">E-commerce</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavOrders items={data.navOrders} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

