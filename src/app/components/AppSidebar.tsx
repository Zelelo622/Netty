"use client";

import { useEffect, useState } from "react";
import { Home, Globe, Plus, Loader2 } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import { ICommunity } from "@/types/types";
import { CommunityService } from "@/services/community";
import { CreateCommunityModal } from "./Communities/CreateCommunityModal";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const [communities, setCommunities] = useState<ICommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setCommunities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = CommunityService.subscribeToUserCommunities(
      user.uid,
      (data) => {
        setCommunities(data);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <>
      <Sidebar className="sticky top-16 h-[calc(100vh-64px)] border-r">
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
              <Plus
                className="h-4 w-4 cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsModalOpen(true)}
              />
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {loading ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : communities.length > 0 ? (
                  communities.map((sub) => (
                    <SidebarMenuItem key={sub.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === ROUTES.COMMUNITY(sub.name)}
                      >
                        <Link
                          href={ROUTES.COMMUNITY(sub.name)}
                          className="flex items-center gap-2"
                        >
                          {sub.imgUrl ? (
                            <img
                              src={sub.imgUrl}
                              className="h-4 w-4 rounded-full object-cover"
                              alt=""
                            />
                          ) : (
                            <span className="text-xs">🏠</span>
                          )}
                          <span className="truncate">r/{sub.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <p className="px-4 py-2 text-[10px] text-muted-foreground italic">
                    Вы пока ни на что не подписаны
                  </p>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <CreateCommunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
