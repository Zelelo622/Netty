import { Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ICommunity } from "@/types/types";

interface ICommunityHeaderProps {
  community: ICommunity;
  children?: React.ReactNode;
}

export function CommunityHeader({ community, children }: ICommunityHeaderProps) {
  return (
    <div className="relative w-full overflow-hidden border-b bg-muted shadow-sm">
      <div className="absolute inset-0 w-full h-full">
        {community.bannerUrl ? (
          <img src={community.bannerUrl} className="w-full h-full object-cover" alt="banner" />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-slate-800 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-8 sm:pt-32 sm:pb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-white text-center sm:text-left">
          <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-2xl rounded-full shrink-0">
            <AvatarImage src={community.avatarUrl} className="object-cover" />
            <AvatarFallback className="text-4xl font-black bg-primary">
              {community.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col sm:flex-row justify-between w-full gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter">
                n/{community.name}
              </h1>
              <p className="text-white/90 max-w-xl line-clamp-2 italic">
                {community.description || "У этого сообщества пока нет описания."}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-white/80 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Users className="h-5 w-5" />
                  <span>{community.membersCount.toLocaleString()} участников</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto pt-4 sm:pt-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
