"use client";

import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";
import { ROUTES } from "@/lib/routes";
import { SettingsService } from "@/services/settings.service";

interface ISecuritySettingsProps {
  initialEmail: string;
}

export const SecuritySettings = ({ initialEmail }: ISecuritySettingsProps) => {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);

  const isUnchanged = email === initialEmail && newPassword === "";

  const handleUpdate = async () => {
    setLoading(true);
    setShowConfirmModal(false);

    try {
      await SettingsService.updateSecurity(email, newPassword);
      toast.success("Данные безопасности обновлены!");
      setNewPassword("");
    } catch (error) {
      if (error instanceof FirebaseError && error.code === "auth/requires-recent-login") {
        setShowReauthModal(true);
      } else {
        toast.error(error instanceof FirebaseError ? getFirebaseErrorMessage(error) : "Ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReauthRedirect = async () => {
    await SettingsService.logout();
    router.push(`${ROUTES.AUTH}?mode=login`);
  };

  return (
    <>
      <Card className="border-border/60 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle>Безопасность</CardTitle>
          <CardDescription>Управление почтой и паролем</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email адрес</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass">Новый пароль</Label>
            <Input
              id="pass"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Оставьте пустым, если не меняете"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(true)}
            disabled={loading || isUnchanged}
            className="cursor-pointer"
          >
            Применить изменения
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Изменение Email или пароля — серьезный шаг. Убедитесь в доступе к новой почте.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdate} className="cursor-pointer bg-primary">
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReauthModal} onOpenChange={setShowReauthModal}>
        <AlertDialogContent className="border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Нужно подтвердить личность
            </AlertDialogTitle>
            <AlertDialogDescription>
              Это мера безопасности Netty. Вам нужно перезайти в аккаунт, чтобы изменить критические
              данные.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" onClick={() => setShowReauthModal(false)}>
              Позже
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReauthRedirect}
              className="cursor-pointer bg-destructive text-white"
            >
              ВЫЙТИ И ПЕРЕЗАЙТИ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
