import { Info } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PostRules() {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-2 shadow-none md:shadow-sm">
        <CardHeader className="pb-3 flex-row items-center gap-2 space-y-0 font-bold px-0 md:px-6">
          <div className="h-6 w-1 bg-primary rounded-full" />
          Правила Netty
        </CardHeader>
        <CardContent className="text-sm space-y-4 text-muted-foreground px-0 md:px-6">
          <div className="flex gap-3">
            <span className="font-bold text-foreground">1.</span>
            <p>Уважайте других участников сообщества.</p>
          </div>
          <div className="flex gap-3 border-t pt-3">
            <span className="font-bold text-foreground">2.</span>
            <p>Используйте понятные и честные заголовки.</p>
          </div>
        </CardContent>
      </Card>
      <div className="p-4 bg-muted/30 rounded-2xl flex gap-3 text-xs text-muted-foreground border">
        <Info className="h-4 w-4 shrink-0" />
        <p>Пост будет опубликован моментально после нажатия кнопки.</p>
      </div>
    </div>
  );
}
