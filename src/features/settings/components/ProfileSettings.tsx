"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SettingsService } from "@/services/settings.service";
import { ImageUploader } from "@/components/ImageUploader";

interface IProfileSettingsProps {
  initialData: { name: string; photoURL: string };
}

export const ProfileSettings = ({ initialData }: IProfileSettingsProps) => {
  const [name, setName] = useState(initialData.name);
  const [photoURL, setPhotoURL] = useState(initialData.photoURL);
  const [loading, setLoading] = useState(false);

  const isUnchanged =
    name === initialData.name && photoURL === initialData.photoURL;

  const handleSave = async () => {
    setLoading(true);
    try {
      await SettingsService.updatePublicProfile(name, photoURL);
      toast.success("Профиль обновлен!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-lg shadow-primary/5">
      <CardHeader>
        <CardTitle>Публичный профиль</CardTitle>
        <CardDescription>Обнови своё имя и фото</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Твоё имя</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Аватар профиля</Label>
          <ImageUploader url={photoURL} onChange={setPhotoURL} />
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={loading || isUnchanged} onClick={handleSave}>
          {loading ? "Минутку..." : "Сохранить профиль"}
        </Button>
      </CardFooter>
    </Card>
  );
};
