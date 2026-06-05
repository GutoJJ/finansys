"use client"

import * as React from "react"
import { 
  Wallet,
  LayoutDashboard,
  ArrowRightLeft,
  Repeat,
  Tag,
  Target,
  BarChart3,
  TrendingUp,
  Download,
  User,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"


const data = {
  navMain: [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
        {
          title: "Transactions",
          url: "/transactions",
          icon: ArrowRightLeft,
        },
        {
          title: "Recurring",
          url: "/recurring",
          icon: Repeat,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Accounts",
          url: "/accounts",
          icon: Wallet,
        },
        {
          title: "Categories",
          url: "/categories",
          icon: Tag,
        },
        {
          title: "Goals",
          url: "/goals",
          icon: Target,
        },
      ],
    },
    {
      title: "Reports",
      items: [
        {
          title: "Reports",
          url: "/reports",
          icon: BarChart3,
        },
        {
          title: "Analytics",
          url: "/analytics",
          icon: TrendingUp,
        },
        {
          title: "Export",
          url: "/export",
          icon: Download,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Profile",
          url: "/profile",
          icon: User,
        },
        {
          title: "Preferences",
          url: "/settings",
          icon: Settings,
        },
        {
          title: "Help",
          url: "/help",
          icon: HelpCircle,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    router.replace("/login")
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Wallet className="h-8 w-8 rounded-md bg-primary p-2 text-primary-foreground" />
          <span className="text-lg font-bold text-foreground">finansys</span>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold uppercase text-muted-foreground">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-2 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
