"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CommunityService } from "@/services/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ICommunity } from "@/types/types";

interface ICreateComminutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ICommunity | null;
}

export function CreateCommunityModal({
  isOpen,
  onClose,
  initialData,
}: ICreateComminutyModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const isEditMode = !!initialData;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setAvatarUrl(initialData.avatarUrl || "");
      setBannerUrl(initialData.bannerUrl || "");
    }
  }, [initialData]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (val.length <= 21) setName(val);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Нужно войти в аккаунт");
    if (name.length < 3) return toast.error("Название слишком короткое");

    setLoading(true);
    try {
      let finalSlug: string;

      if (isEditMode && initialData?.id) {
        finalSlug = await CommunityService.updateCommunity(initialData.id, {
          name,
          description,
          avatarUrl,
          bannerUrl,
        });
        toast.success("Сообщество обновлено");
      } else {
        finalSlug = await CommunityService.createCommunity({
          name,
          description,
          creatorId: user.uid,
          avatarUrl,
          bannerUrl,
        });
        toast.success(`Сообщество n/${finalSlug} создано!`);
      }

      onClose();
      router.push(ROUTES.COMMUNITY(finalSlug));

      if (!isEditMode) {
        setName("");
        setDescription("");
        setAvatarUrl("");
        setBannerUrl("");
      }
    } catch (error: any) {
      toast.error(error.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] rounded-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Настройки сообщества" : "Создать сообщество"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Измените данные вашего сообщества"
              : "Заполните данные для вашего нового дома."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название (обязательно)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                n/
              </span>
              <Input
                id="name"
                className="pl-8"
                value={name}
                onChange={handleNameChange}
                placeholder="my_community"
                required
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              От 3 до 21 символа. Без пробелов.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="avatar">URL Аватарки</Label>
              <Input
                id="avatar"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner">URL Баннера</Label>
              <Input
                id="banner"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="О чем это сообщество?"
              className="resize-none h-20"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading || name.length < 3}
              className="bg-primary rounded-full px-8"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                `Создать n/${name || "..."}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
