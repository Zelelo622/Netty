import { MaskotIcon } from "@/components/MaskotIcon";

interface IAuthMascotProps {
  loading: boolean;
  isPasswordFocused: boolean;
  activeTab: string;
}

export const AuthMascot = ({
  loading,
  isPasswordFocused,
  activeTab,
}: IAuthMascotProps) => {
  const getMascotText = () => {
    if (loading) return "Минутку...";
    if (isPasswordFocused) return "Тсс, я всё забуду!";
    if (activeTab === "register") return "Стань частью Netty!";
    if (activeTab === "reset") return "Давай восстановим?";
    return "С возвращением!";
  };

  return (
    <div
      className={`fixed -bottom-12 -left-6 z-10 transition-all duration-500 sm:relative sm:inset-auto sm:mb-8 sm:block ${
        isPasswordFocused
          ? "scale-110 -translate-x-2 sm:-translate-y-2"
          : "scale-100"
      }`}
    >
      <div className="relative group">
        <div className="animate-peek">
          <MaskotIcon className="h-28 w-auto drop-shadow-2xl sm:h-24" />
        </div>
        <div className="absolute bg-primary text-primary-foreground px-3 py-1.5 rounded-2xl rounded-bl-none text-[10px] font-bold shadow-lg transition-all whitespace-nowrap top-5 left-24 sm:-top-5 sm:left-20 sm:text-xs">
          {getMascotText()}
        </div>
      </div>
    </div>
  );
};
