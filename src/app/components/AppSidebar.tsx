"use client";

import * as React from "react";
import { Home, TrendingUp, Globe, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="sticky top-16 h-[calc(100vh-64px)]">
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { title: "Лента", url: ROUTES.HOME, icon: Home },
                {
                  title: "Сообщества",
                  url: ROUTES.ALL_COMMUNITIES,
                  icon: Globe,
                },
              ].map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2 mb-2">
            <SidebarGroupLabel className="text-[10px] uppercase">
              Мои сообщества
            </SidebarGroupLabel>
            <Plus className="h-3 w-3 cursor-pointer" />
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { name: "programming", icon: "💻" },
                { name: "reactjs", icon: "⚛️" },
              ].map((sub) => (
                <SidebarMenuItem key={sub.name}>
                  <SidebarMenuButton asChild>
                    <Link href={ROUTES.COMMUNITY(sub.name)}>
                      <span>{sub.icon}</span>
                      <span>r/{sub.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
