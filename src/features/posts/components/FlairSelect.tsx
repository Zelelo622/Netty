import { Badge } from "@/components/ui/badge";
import { POST_FLAIRS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FlairSelectProps {
  selectedFlairId: string | null;
  onSelect: (id: string | null) => void;
}

export function FlairSelect({ selectedFlairId, onSelect }: FlairSelectProps) {
  return (
    <div className="flex flex-wrap gap-2 py-2">
      {POST_FLAIRS.map((flair) => {
        const isSelected = selectedFlairId === flair.id;
        return (
          <Badge
            key={flair.id}
            variant="outline"
            className={cn(
              "cursor-pointer px-3 py-1 transition-all border-2",
              isSelected
                ? `${flair.color} ${flair.textColor} border-transparent shadow-md scale-105`
                : "bg-muted/50 hover:bg-muted border-transparent"
            )}
            onClick={() => onSelect(isSelected ? null : flair.id)}
          >
            {flair.label}
          </Badge>
        );
      })}
    </div>
  );
}
