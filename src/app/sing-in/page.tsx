"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaskotIcon } from "../components/Icons/MaskotIcon";
import { LogoTextIcon } from "../components/Icons/LogoTextIcon";

const FormField = ({
  id,
  label,
  type = "text",
  placeholder,
  onFocus,
  onBlur,
}: any) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      onFocus={onFocus}
      onBlur={onBlur}
      className="focus-visible:ring-primary"
    />
  </div>
);

const AuthSubmitButton = ({ children }: { children: React.ReactNode }) => (
  <Button className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide transition-all active:scale-[0.98]">
    {children}
  </Button>
);

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "login";

  const [activeTab, setActiveTab] = useState(mode);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handlePassFocus = () => setIsPasswordFocused(true);
  const handlePassBlur = () => setIsPasswordFocused(false);

  return (
    <div className="min-h-[95vh] flex flex-col items-center justify-center bg-background p-4">
      <div className="relative mb-8 group">
        <div
          className={`transition-all duration-500 transform ${isPasswordFocused ? "scale-110 -translate-y-2" : "scale-100"}`}
        >
          <MaskotIcon className="h-24 w-auto drop-shadow-2xl" />
        </div>
        <div className="absolute -top-5 -right-32 bg-primary text-primary-foreground px-4 py-1.5 rounded-2xl rounded-bl-none text-xs font-bold shadow-lg shadow-primary/20 transition-all">
          {isPasswordFocused
            ? "Тсс, я всё забуду!"
            : activeTab === "register"
              ? "Стань частью Netty!"
              : "С возвращением!"}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setIsPasswordFocused(false);
        }}
        className="w-full max-w-[400px]"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 shadow-sm">
          <TabsTrigger className="cursor-pointer" value="login">
            Вход
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="register">
            Регистрация
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card className="border-border/60 shadow-xl shadow-primary/5">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl flex justify-center italic">
                <LogoTextIcon className="h-10 w-auto" />
              </CardTitle>
              <CardDescription>Введи свои данные для входа</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
              />
              <FormField
                id="password"
                label="Пароль"
                type="password"
                onFocus={handlePassFocus}
                onBlur={handlePassBlur}
              />
            </CardContent>
            <CardFooter>
              <AuthSubmitButton>ВОЙТИ</AuthSubmitButton>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card className="border-border/60 shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-primary">
                Регистрация
              </CardTitle>
              <CardDescription>
                Создай аккаунт, это займет минуту
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField id="reg-name" label="Твоё имя" placeholder="Никнейм" />
              <FormField
                id="reg-email"
                label="Email"
                type="email"
                placeholder="boss@example.com"
              />
              <FormField
                id="reg-password"
                label="Придумай пароль"
                type="password"
                onFocus={handlePassFocus}
                onBlur={handlePassBlur}
              />
            </CardContent>
            <CardFooter>
              <AuthSubmitButton>ПОЕХАЛИ!</AuthSubmitButton>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
