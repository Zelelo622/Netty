"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "./FormFieldAuth";
import { toast } from "sonner";
import { AuthService } from "@/services/auth.service";

interface IRegisterFormProps {
  setLoading: (loading: boolean) => void;
  setIsPasswordFocused: (focused: boolean) => void;
  onSuccess: () => void;
}

export const RegisterForm = ({
  setLoading,
  setIsPasswordFocused,
  onSuccess,
}: IRegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.register(email, password, name);
      toast.success("Аккаунт создан!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-xl shadow-primary/5">
      <CardHeader>
        <CardTitle className="text-2xl font-black text-primary">
          Регистрация
        </CardTitle>
        <CardDescription>Создай аккаунт, это займет минуту</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 mb-4">
          <FormField
            id="reg-name"
            label="Твоё имя"
            value={name}
            onChange={setName}
            placeholder="Никнейм"
            required
          />
          <FormField
            id="reg-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="boss@example.com"
            required
          />
          <FormField
            id="reg-password"
            label="Придумай пароль"
            type="password"
            value={password}
            onChange={setPassword}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            required
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="cursor-pointer w-full font-bold tracking-wide">
            ПОЕХАЛИ!
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
