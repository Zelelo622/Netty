"use client";

import Link from "next/link";
import { ModeToggle } from "./ThemeToggle";
import { MaskotIcon } from "./icons/MaskotIcon";
import { LogoTextIcon } from "./icons/LogoTextIcon";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { SidebarTrigger } from "./ui/sidebar";

function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await fetch("/api/auth/logout", { method: "POST" });

      router.refresh();
      router.push(ROUTES.AUTH);
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  return (
    <nav className="h-16 w-full flex items-center border-b px-4 md:px-8 lg:px-14 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <SidebarTrigger className="-ml-1 md:hidden" />
      <div className="flex justify-between items-center w-full">
        <Link href={ROUTES.HOME} className="flex items-center gap-x-1 h-full">
          <MaskotIcon className="h-14 w-auto" />
          <LogoTextIcon className="h-14 w-fit hidden lg:block" />
        </Link>

        <div className="flex items-center gap-x-4">
          <ModeToggle />

          <div className="flex items-center justify-end">
            {loading ? (
              <Skeleton className="h-9 w-24 rounded-md" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <Avatar className="h-9 w-9 border border-primary/20 transition-transform hover:scale-105">
                      <AvatarImage
                        src={user.photoURL || ""}
                        alt={user.displayName || "User"}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.displayName?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || "Пользователь"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={ROUTES.SETTINGS}>Настройки</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10"
                    onClick={handleSignOut}
                  >
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-x-2">
                <Link href={`${ROUTES.AUTH}?mode=register`}>
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    Регистрация
                  </Button>
                </Link>
                <Link href={`${ROUTES.AUTH}?mode=login`}>
                  <Button size="sm" className="cursor-pointer">
                    Войти
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
