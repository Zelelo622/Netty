"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { FirebaseError } from "firebase/app";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";
import { toast } from "sonner";
import { UserCredential } from "firebase/auth";

interface IFormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "tel" | "url";
  placeholder?: string;
  required?: boolean;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  className?: string;
  autoComplete?: string;
}

const FormField: React.FC<IFormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  onFocus,
  onBlur,
  className,
  autoComplete,
}) => (
  <div className={`space-y-2 ${className}`}>
    <Label htmlFor={id} className="text-sm font-medium">
      {label}
    </Label>
    <Input
      id={id}
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      onFocus={onFocus}
      onBlur={onBlur}
      autoComplete={autoComplete}
      className="focus-visible:ring-primary transition-shadow"
    />
  </div>
);

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") || "login";

  const [activeTab, setActiveTab] = useState<string>(mode);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const modeFromUrl = searchParams.get("mode");
    if (modeFromUrl === "login" || modeFromUrl === "register") {
      setActiveTab(modeFromUrl);
    }
  }, [searchParams]);

  const resetState = () => {
    setIsPasswordFocused(false);
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "reset") return;

    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      let userCredential: UserCredential;

      if (activeTab === "register") {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          cleanPassword,
        );
        await updateProfile(userCredential.user, { displayName: name });
        toast.success("Аккаунт создан!");
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          cleanPassword,
        );
        toast.success("С возвращением!");
      }

      const token = await userCredential.user.getIdToken();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        router.refresh();
        setTimeout(() => {
          router.push("/");
        }, 100);
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        const message = getFirebaseErrorMessage(error);
        toast.error(message);
      } else {
        toast.error("Неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Сначала введи свой Email в поле выше");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast.success("Инструкции по сбросу отправлены на почту!");
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
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-background p-4">
      <div
        className={`fixed -bottom-12 -left-6 z-10 transition-all duration-500 sm:relative sm:inset-auto sm:mb-8 sm:block ${isPasswordFocused ? "scale-110 -translate-x-2 sm:-translate-y-2" : "scale-100"}
    `}
      >
        <div className="relative group">
          <div className="animate-peek">
            <MaskotIcon className="h-28 w-auto drop-shadow-2xl sm:h-24" />
          </div>

          <div
            className={`
          absolute bg-primary text-primary-foreground px-3 py-1.5 rounded-2xl rounded-bl-none text-[10px] font-bold shadow-lg transition-all whitespace-nowrap top-5 left-24 sm:-top-5 sm:left-20 sm:right-auto sm:text-xs
        `}
          >
            {loading
              ? "Минутку..."
              : isPasswordFocused
                ? "Тсс, я всё забуду!"
                : activeTab === "register"
                  ? "Стань частью Netty!"
                  : activeTab === "reset"
                    ? "Давай восстановим?"
                    : "С возвращением!"}
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          resetState();
        }}
        className="w-full max-w-100"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 shadow-sm">
          <TabsTrigger className="cursor-pointer" value="login">
            Вход
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="register">
            Регистрация
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleAuth}>
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
                      onClick={() => setActiveTab("reset")}
                      className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      Забыли пароль?
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  disabled={loading}
                  type="submit"
                  className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide transition-all active:scale-[0.98]"
                >
                  {loading ? "ВХОДИМ..." : "ВОЙТИ"}
                </Button>
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
                <Button
                  disabled={loading}
                  type="submit"
                  className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide transition-all active:scale-[0.98]"
                >
                  {loading ? "РЕГИСТРИРУЕМ..." : "ПОЕХАЛИ!"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="reset">
            <Card className="border-border/60 shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-primary">
                  Восстановление
                </CardTitle>
                <CardDescription>
                  Введи почту, и мы пришлем ссылку для сброса пароля
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <Button
                  disabled={loading}
                  onClick={handleForgotPassword}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all"
                >
                  {loading ? "ОТПРАВЛЯЕМ..." : "ОТПРАВИТЬ ССЫЛКУ"}
                </Button>
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Я вспомнил пароль, вернуться
                </button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
}
