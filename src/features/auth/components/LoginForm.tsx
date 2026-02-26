"use client";

import { FirebaseError } from "firebase/app";
import { useState } from "react";
import { toast } from "sonner";

import { LogoTextIcon } from "@/components/icons/LogoTextIcon";
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

interface ILoginFormProps {
  setLoading: (loading: boolean) => void;
  setIsPasswordFocused: (focused: boolean) => void;
  onSuccess: () => void;
  onForgotPassword: () => void;
}

export const LoginForm = ({
  setLoading,
  setIsPasswordFocused,
  onSuccess,
  onForgotPassword,
}: ILoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.login(email, password);
      toast.success("С возвращением!");
      onSuccess();
    } catch (error) {
      if (error instanceof FirebaseError) {
        toast.error(getFirebaseErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl flex justify-center italic">
          <LogoTextIcon className="h-10 w-auto" />
        </CardTitle>
        <CardDescription>Введи свои данные для входа</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 mb-4">
          <FormField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          <div className="space-y-1">
            <FormField
              id="password"
              label="Пароль"
              type="password"
              value={password}
              onChange={setPassword}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              required
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Забыли пароль?
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="cursor-pointer w-full font-bold tracking-wide">
            ВОЙТИ
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
