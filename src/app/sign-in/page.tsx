"use client";

import { useState, useEffect, Suspense } from "react"; // Добавили Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { AuthMascot } from "@/features/auth/components/AuthMascot";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

const AuthContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(
    searchParams.get("mode") || "login",
  );
  const [loading, setLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "login" || mode === "register") setActiveTab(mode);
  }, [searchParams]);

  const handleAuthSuccess = () => {
    router.refresh();
    setTimeout(() => router.push("/"), 100);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-background p-4">
      <AuthMascot
        loading={loading}
        isPasswordFocused={isPasswordFocused}
        activeTab={activeTab}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full max-w-100"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger className="cursor-pointer" value="login">
            Вход
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="register">
            Регистрация
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <LoginForm
            setLoading={setLoading}
            setIsPasswordFocused={setIsPasswordFocused}
            onSuccess={handleAuthSuccess}
            onForgotPassword={() => setActiveTab("reset")}
          />
        </TabsContent>

        <TabsContent value="register">
          <RegisterForm
            setLoading={setLoading}
            setIsPasswordFocused={setIsPasswordFocused}
            onSuccess={handleAuthSuccess}
          />
        </TabsContent>

        <TabsContent value="reset">
          <ResetPasswordForm
            setLoading={setLoading}
            onBackToLogin={() => setActiveTab("login")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">Загрузка формы...</div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
