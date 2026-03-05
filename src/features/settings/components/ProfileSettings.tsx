"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MascotAvatar } from "@/components/MascotAvatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsService } from "@/services/settings.service";
import {
  configToMascotURL,
  DEFAULT_MASCOT_CONFIG,
  isMascotURL,
  mascotURLToConfig,
  IMascotConfig,
} from "@/types/mascot";

import { MascotEditor } from "./MascotEditor";

interface IProfileSettingsProps {
  initialData: { name: string; photoURL: string };
}

export const ProfileSettings = ({ initialData }: IProfileSettingsProps) => {
  const [name, setName] = useState(initialData.name);

  const isMascot = isMascotURL(initialData.photoURL);
  const [mascotConfig, setMascotConfig] = useState<IMascotConfig>(
    isMascot ? mascotURLToConfig(initialData.photoURL) : DEFAULT_MASCOT_CONFIG
  );

  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const effectivePhotoURL = configToMascotURL(mascotConfig);

  const isUnchanged = name === initialData.name && effectivePhotoURL === initialData.photoURL;

  const handleSave = async () => {
    setLoading(true);
    try {
      await SettingsService.updatePublicProfile(name, effectivePhotoURL);
      toast.success("Профиль обновлён!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleEditorApply = (newConfig: IMascotConfig, _png: string) => {
    setMascotConfig(newConfig);
    setEditorOpen(false);
    toast.info("Аватар обновлён — не забудь сохранить профиль!");
  };

  return (
    <>
      <Card className="border-border/60 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle>Публичный профиль</CardTitle>
          <CardDescription>Обнови своё имя и аватар</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Твоё имя</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-3">
            <Label>Аватар профиля</Label>

            <div className="flex items-center gap-5 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex-col md:flex-row">
              <div className="rounded-2xl bg-white dark:bg-[#2C2C2E] p-2 shadow">
                <MascotAvatar config={mascotConfig} size={72} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Твой уникальный маскот
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Нажми «Редактировать», чтобы изменить внешний вид
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditorOpen(true)}
                className="shrink-0 gap-1.5 cursor-pointer"
              >
                <Pencil size={14} /> Редактировать
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button disabled={loading || isUnchanged} onClick={handleSave}>
            {loading ? "Минутку…" : "Сохранить профиль"}
          </Button>
        </CardFooter>
      </Card>

      <MascotEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialConfig={mascotConfig}
        onApply={handleEditorApply}
      />
    </>
  );
};
