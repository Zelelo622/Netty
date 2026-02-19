"use client";

import { useAuth } from "@/context/AuthContext";
import { ProfileSettings } from "@/features/settings/components/ProfileSettings";
import { SecuritySettings } from "@/features/settings/components/SecuritySettings";
import { ProfilePreview } from "@/features/settings/components/ProfilePreview";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MaskotIcon } from "@/components/icons/MaskotIcon";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) {
    return <LoadingSpinner />;
  }
  if (!user) {
    return router.push(`${ROUTES.AUTH}?mode=login`);
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
          <ProfileSettings
            initialData={{
              name: user.displayName || "",
              photoURL: user.photoURL || "",
            }}
          />

          <SecuritySettings initialEmail={user.email || ""} />
        </div>

        <aside className="hidden md:block">
          <ProfilePreview user={user} />
        </aside>
      </div>
    </div>
  );
}
