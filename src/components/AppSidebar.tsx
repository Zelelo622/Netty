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
  useSidebar,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ICommunity } from "@/types/types";
import { CommunityService } from "@/services/community.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateCommunityModal } from "@/features/communities/components/CreateCommunityModal";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const { setOpenMobile, isMobile } = useSidebar();

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

  const handleItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <Sidebar className="sticky top-16 h-[calc(100vh-64px)] border-r">
        <SidebarContent className="bg-background pt-4">
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
                      <Link href={item.url} onClick={handleItemClick}>
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
                onClick={() => {
                  handleItemClick();
                  setIsModalOpen(true);
                }}
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
                          onClick={handleItemClick}
                          className="flex items-center gap-2"
                        >
                          <Avatar className="h-4 w-4 border shadow-sm">
                            <AvatarImage
                              src={sub.avatarUrl}
                              alt={sub.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-muted text-muted-foreground font-bold uppercase text-xs">
                              {sub.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">n/{sub.name}</span>
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
