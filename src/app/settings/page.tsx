"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MaskotIcon } from "../components/Icons/MaskotIcon";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import {
  updateEmail,
  updatePassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [photoURL, setPhotoURL] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Состояния модалок
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user]);

  const handleSignOutAndRedirect = async () => {
    try {
      await signOut(auth);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push(`${ROUTES.AUTH}?mode=login`);
    } catch (e) {
      toast.error("Ошибка при выходе");
    }
  };

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL,
      });
      toast.success("Профиль обновлен!");
    } catch (error) {
      const message =
        error instanceof FirebaseError
          ? getFirebaseErrorMessage(error)
          : "Ошибка";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSecurity = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setShowConfirmModal(false);

    try {
      if (email !== user?.email) {
        await updateEmail(auth.currentUser, email);
      }
      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
      }
      toast.success("Данные безопасности обновлены!");
      setNewPassword("");
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        error.code === "auth/requires-recent-login"
      ) {
        setShowReauthModal(true);
      } else {
        const message =
          error instanceof FirebaseError
            ? getFirebaseErrorMessage(error)
            : "Ошибка";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 px-4 mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <MaskotIcon className="h-12 w-auto animate-bounce duration-3000" />
        <h1 className="text-3xl font-black tracking-tight text-primary uppercase">
          Настройки
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_250px]">
        <div className="space-y-6">
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
                <Label htmlFor="photo">Ссылка на аватар</Label>
                <Input
                  id="photo"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={loading}
                onClick={handleUpdateProfile}
                className="cursor-pointer"
              >
                {loading ? "Минутку..." : "Сохранить профиль"}
              </Button>
            </CardFooter>
          </Card>

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
                className="cursor-pointer"
                onClick={() => setShowConfirmModal(true)}
                disabled={loading}
              >
                Применить изменения
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="hidden md:flex flex-col items-center gap-6 p-6 rounded-2xl bg-muted/30 border border-dashed h-fit">
          <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
            Превью
          </Label>
          <Avatar className="h-40 w-40 border-4 border-background shadow-2xl transition-transform hover:scale-105">
            <AvatarImage src={photoURL} className="object-cover" />
            <AvatarFallback className="text-4xl bg-primary/10 text-primary font-black">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <p className="font-bold text-sm truncate max-w-50">
              {name || "Без имени"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate max-w-50">
              {email}
            </p>
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы собираетесь изменить важные данные аккаунта (Email или Пароль).
              Убедитесь, что у вас есть доступ к новой почте.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateSecurity}
              className="cursor-pointer bg-primary"
            >
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReauthModal} onOpenChange={setShowReauthModal}>
        <AlertDialogContent className="border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              Нужно подтвердить личность
            </AlertDialogTitle>
            <AlertDialogDescription>
              Для изменения почты или пароля требуется недавняя авторизация. Нам
              нужно, чтобы вы перезашли в аккаунт. Это мера безопасности Netty.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowReauthModal(false)}
              className="cursor-pointer"
            >
              Позже
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOutAndRedirect}
              className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer font-bold"
            >
              ВЫЙТИ И ПЕРЕЗАЙТИ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
