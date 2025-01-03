import type { Metadata } from "next"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/Sidebar"

export const metadata: Metadata = {
  title: "Accounts - User",
  description: "User account management dashboard",
}

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 h-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

