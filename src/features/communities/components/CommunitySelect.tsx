import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ICommunity } from "@/types/types";
import { Loader2 } from "lucide-react";

interface CommunitySelectProps {
  communities: ICommunity[];
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export function CommunitySelect({
  communities,
  selectedId,
  onSelect,
  isLoading,
}: CommunitySelectProps) {
  return (
    <Select value={selectedId} onValueChange={onSelect} disabled={isLoading}>
      <SelectTrigger className="w-full md:w-[300px]">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Загрузка...</span>
          </div>
        ) : (
          <SelectValue placeholder="Выберите сообщество" />
        )}
      </SelectTrigger>
      <SelectContent position="popper">
        {communities.map((c) => (
          <SelectItem key={c.id} value={c.id!}>
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5 border">
                <AvatarImage src={c.avatarUrl} />
                <AvatarFallback className="text-[10px] uppercase">
                  {c.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">n/{c.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
