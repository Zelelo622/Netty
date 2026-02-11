import Link from "next/link";
import { ModeToggle } from "./ThemeToggle";
import { MaskotIcon } from "./Icons/MaskotIcon";
import { LogoTextIcon } from "./Icons/LogoTextIcon";
import { Button } from "@/components/ui/button";

function Navbar() {
  return (
    <nav className="h-[5vh] w-full flex items-center border-b px-5 lg:px-14 justify-between">
      <Link href="/" className="flex items-center gap-x-1 h-full">
        <MaskotIcon className="h-14 w-auto" />
        <LogoTextIcon className="h-14 w-fit hidden lg:block" />
      </Link>

      <div className="flex items-center gap-x-4">
        <ModeToggle />
        <Link href="/sing-in?mode=register">
          <Button variant="secondary" className="cursor-pointer">
            Присоединиться
          </Button>
        </Link>
        <Link href="/sing-in?mode=login">
          <Button className="cursor-pointer">Войти</Button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
