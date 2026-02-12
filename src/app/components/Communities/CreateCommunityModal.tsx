"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CommunityService } from "@/services/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Info, Loader2 } from "lucide-react";

interface ICreateComminutyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCommunityModal({
  isOpen,
  onClose,
}: ICreateComminutyModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (val.length <= 21) setName(val);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Нужно войти в аккаунт");
    if (name.length < 3) return toast.error("Название слишком короткое");

    setLoading(true);
    try {
      const communityId = await CommunityService.createCommunity({
        name,
        title,
        creatorId: user.uid,
      });
      toast.success("Сообщество создано!");
      onClose();
      router.push(ROUTES.COMMUNITY(communityId));
    } catch (error: any) {
      toast.error(error.message || "Ошибка при создании");
    } finally {
      setLoading(false);
      setName("");
      setTitle("");
    }
  };

  const isInvalid = name.length < 3 || title.length < 3;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-120 w-[95vw] rounded-lg">
        <DialogHeader>
          <DialogTitle>Создать сообщество</DialogTitle>
          <DialogDescription>
            Придумайте уникальное имя и описание для вашей группы.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название (ID)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                r/
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
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" /> Только латиница и нижнее
              подчеркивание.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="О чем это сообщество?"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading || isInvalid}
              className="cursor-pointer"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
