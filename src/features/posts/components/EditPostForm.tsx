"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ImageUploader";

interface EditPostFormProps {
  initialContent: string;
  initialImageUrl?: string;
  isUpdating: boolean;
  onSave: (content: string, imageUrl: string) => void;
  onCancel: () => void;
}

export function EditPostForm({
  initialContent,
  initialImageUrl = "",
  isUpdating,
  onSave,
  onCancel,
}: EditPostFormProps) {
  const [content, setContent] = useState(initialContent);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);

  return (
    <div className="space-y-4 bg-muted/20 p-4 md:p-6 rounded-2xl border border-primary/20">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
          Картинка (необязательно)
        </label>
        <ImageUploader
          url={imageUrl}
          onChange={setImageUrl}
          variant="compact"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
          Текст поста
        </label>
        <Textarea
          placeholder="Введите текст..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[150px] bg-background resize-none focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          className="rounded-full cursor-pointer"
          onClick={onCancel}
          disabled={isUpdating}
        >
          Отмена
        </Button>
        <Button
          type="button"
          className="rounded-full px-6 cursor-pointer font-bold"
          onClick={() => onSave(content, imageUrl)}
          disabled={isUpdating || (!content.trim() && !imageUrl.trim())}
        >
          {isUpdating ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
    </div>
  );
}
