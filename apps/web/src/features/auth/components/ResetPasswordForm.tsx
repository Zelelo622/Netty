"use client";

import { FirebaseError } from "firebase/app";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";
import { AuthService } from "@/services/auth.service";

import { FormField } from "./FormFieldAuth";

interface IResetPasswordFormProps {
  setLoading: (loading: boolean) => void;
  onBackToLogin: () => void;
}

export const ResetPasswordForm = ({ setLoading, onBackToLogin }: IResetPasswordFormProps) => {
  const [email, setEmail] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Сначала введи свой Email");
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword(email);
      toast.success("Инструкции по сбросу отправлены на почту!");
      onBackToLogin();
    } catch (error) {
      if (error instanceof FirebaseError) {
        toast.error(getFirebaseErrorMessage(error));
      } else {
        toast.error("Произошла ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-xl shadow-primary/5">
      <CardHeader>
        <CardTitle className="text-2xl font-black text-primary">Восстановление</CardTitle>
        <CardDescription>Введи почту, и мы пришлем ссылку для сброса пароля</CardDescription>
      </CardHeader>
      <form onSubmit={handleReset}>
        <CardContent className="space-y-4 mb-4">
          <FormField
            id="reset-email"
            label="Твой Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="example@mail.com"
            required
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="cursor-pointer w-full font-bold transition-all">
            ОТПРАВИТЬ ССЫЛКУ
          </Button>
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Я вспомнил пароль, вернуться
          </button>
        </CardFooter>
      </form>
    </Card>
  );
};
