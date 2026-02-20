import { Loader2, Plus, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CommunityActionsProps {
  isOwner: boolean;
  isSubscribed: boolean;
  submitting: boolean;
  hasUser: boolean;
  onEdit: () => void;
  onCreatePost: () => void;
  onJoinLeave: () => void;
}

export function CommunityActions({
  isOwner,
  isSubscribed,
  submitting,
  hasUser,
  onEdit,
  onCreatePost,
  onJoinLeave,
}: CommunityActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onJoinLeave}
        disabled={submitting || (isOwner && isSubscribed)}
        className={`cursor-pointer rounded-full font-bold px-8 h-10 transition-all shadow-lg ${
          isSubscribed
            ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md"
            : "bg-primary text-white hover:opacity-90"
        } ${isOwner && isSubscribed ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSubscribed ? (
          "Следите"
        ) : (
          "Вступить"
        )}
      </Button>

      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/10">
          {hasUser && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onCreatePost}
                  className="h-8 w-8 rounded-full text-white hover:bg-white/20 cursor-pointer"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black text-white border-white/10">
                <p className="text-xs font-bold">Создать публикацию</p>
              </TooltipContent>
            </Tooltip>
          )}

          {isOwner && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onEdit}
                  className="h-8 w-8 rounded-full text-white hover:bg-white/20 cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black text-white border-white/10">
                <p className="text-xs font-bold">Настройки сообщества</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
