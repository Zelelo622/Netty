import { Button } from "@/components/ui/button";
import { Loader2, Plus, Settings } from "lucide-react";

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
    <>
      {isOwner && (
        <Button
          variant="outline"
          onClick={onEdit}
          className="cursor-pointer rounded-full font-bold h-10 px-4 bg-white/10 hover:bg-white text-white hover:text-black border-white/20 backdrop-blur-md"
        >
          <Settings className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">Настроить</span>
        </Button>
      )}

      {hasUser && (
        <Button
          onClick={onCreatePost}
          variant="secondary"
          className="cursor-pointer rounded-full font-bold gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md h-10"
        >
          <Plus className="h-5 w-5" />
          <span>Пост</span>
        </Button>
      )}

      <Button
        onClick={onJoinLeave}
        disabled={submitting}
        className={`cursor-pointer rounded-full font-bold px-6 sm:px-10 h-10 transition-all ${
          isSubscribed
            ? "bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white"
            : "bg-primary text-white hover:opacity-90"
        }`}
      >
        {submitting ? (
          <Loader2 className="h-5 w-4 animate-spin" />
        ) : isSubscribed ? (
          "Следите"
        ) : (
          "Вступить"
        )}
      </Button>
    </>
  );
}
