import { Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { ICommunity } from "@/types/types";

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
  const selectedCommunity = communities.find((c) => c.id === selectedId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 w-full md:w-[300px] rounded-md border px-3 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Загрузка...</span>
      </div>
    );
  }

  return (
    <Select key={selectedId} value={selectedId} onValueChange={onSelect}>
      <SelectTrigger className="w-full md:w-[300px]">
        {selectedCommunity ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5 border">
              <AvatarImage src={selectedCommunity.avatarUrl} />
              <AvatarFallback className="text-[10px] uppercase">
                {selectedCommunity.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">n/{selectedCommunity.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Выберите сообщество</span>
        )}
      </SelectTrigger>
      <SelectContent position="popper">
        {communities.map((c) => (
          <SelectItem key={c.id} value={c.id!}>
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5 border">
                <AvatarImage src={c.avatarUrl} />
                <AvatarFallback className="text-[10px] uppercase">{c.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">n/{c.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
