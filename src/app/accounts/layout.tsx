import type { Metadata } from "next";
import "@/app/globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Accounts",
  description: "Cuentas dashboard for Via Provisiones",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 items-center gap-2 border-b">
              <div className="flex items-center px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/accounts">
                      <BreadcrumbPage>Cuentas</BreadcrumbPage>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
    
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <main className="p-4">{children}</main>
          </SidebarInset>
        </SidebarProvider>
  
  );
}
