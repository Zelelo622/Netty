"use client";

import { Crown, Settings, Shirt, Sparkles, User, Wand2 } from "lucide-react";
import { RefObject, useCallback, useRef, useState } from "react";

import { MascotAvatar } from "@/components/MascotAvatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AccessoryType, ClothingType, EyeType, HairType, IMascotConfig } from "@/types/mascot";

interface IMascotEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConfig: IMascotConfig;
  onApply: (config: IMascotConfig, pngDataURL: string) => void;
}

const SKIN_COLORS = [
  "#F2F2F7",
  "#FFD60A",
  "#32D74B",
  "#FF375F",
  "#5856D6",
  "#007AFF",
  "#FF9F0A",
  "#AC8E68",
];

async function svgToPngDataURL(svgEl: SVGSVGElement): Promise<string> {
  const SIZE = 256;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export const MascotEditor: React.FC<IMascotEditorProps> = ({
  open,
  onOpenChange,
  initialConfig,
  onApply,
}) => {
  const [config, setConfig] = useState<IMascotConfig>(initialConfig);
  const svgRef = useRef<SVGSVGElement>(null);
  const [exporting, setExporting] = useState(false);

  const update = useCallback(
    <K extends keyof IMascotConfig>(key: K, value: IMascotConfig[K]) =>
      setConfig((prev) => ({ ...prev, [key]: value })),
    []
  );

  const handleApply = async () => {
    if (!svgRef.current) return;
    setExporting(true);
    try {
      const png = await svgToPngDataURL(svgRef.current);
      onApply(config, png);
      onOpenChange(false);
    } finally {
      setExporting(false);
    }
  };

  const groups: {
    label: string;
    key: keyof IMascotConfig;
    icon: React.ReactNode;
    items: string[];
  }[] = [
    {
      label: "Глаза",
      key: "eyeType",
      icon: <User size={13} />,
      items: ["default", "anime", "star"] satisfies EyeType[],
    },
    {
      label: "Причёска",
      key: "hairType",
      icon: <Crown size={13} />,
      items: ["none", "cap", "bandage"] satisfies HairType[],
    },
    {
      label: "Одежда",
      key: "clothingType",
      icon: <Shirt size={13} />,
      items: ["none", "raincoat", "kimono"] satisfies ClothingType[],
    },
    {
      label: "Доп.",
      key: "accessoryType",
      icon: <Settings size={13} />,
      items: ["none", "antenna", "anon"] satisfies AccessoryType[],
    },
  ];

  const LABEL_MAP: Record<string, string> = {
    none: "Без",
    default: "Классика",
    anime: "Аниме",
    star: "Звезда",
    cap: "Кепка",
    bandage: "Повязка",
    raincoat: "Плащ",
    kimono: "Кимоно",
    antenna: "Антенна",
    anon: "Анон",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl! p-0 gap-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row max-h-[90dvh]">
          <div className="flex flex-row sm:flex-col items-center gap-4 p-5 sm:p-8 sm:w-60 shrink-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-widest uppercase">
              <Wand2 size={12} /> Результат
            </div>

            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xl shrink-0">
              <MascotAvatar
                config={config}
                size={undefined}
                className="w-16 h-16 sm:w-36 sm:h-36"
                svgRef={svgRef as RefObject<SVGSVGElement>}
              />
            </div>

            <div className="flex flex-col gap-1.5 flex-1 sm:w-full min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 sm:hidden flex items-center gap-1">
                <Wand2 size={10} /> Превью
              </p>
              <Button
                onClick={handleApply}
                disabled={exporting}
                className="cursor-pointer w-full bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-2xl font-bold shadow-md shadow-blue-500/30 h-10"
              >
                {exporting ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="animate-spin" />
                    <span className="hidden sm:inline">Применяем…</span>
                    <span className="sm:hidden">…</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span className="hidden sm:inline">Применить аватар</span>
                    <span className="sm:hidden">Применить</span>
                  </span>
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Settings size={16} className="text-blue-500" />
                Лаборатория аватаров
              </DialogTitle>
            </DialogHeader>

            <section>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                Цвет тела
              </p>
              <div className="flex flex-wrap gap-2">
                {SKIN_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => update("bodyColor", c)}
                    title={c}
                    className={`w-7 h-7 rounded-full border-4 transition-all duration-200 ${
                      config.bodyColor === c
                        ? "border-blue-500 scale-125 shadow-lg"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <label
                  title="Свой цвет"
                  className="w-7 h-7 rounded-full border-4 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-blue-400 transition overflow-hidden"
                >
                  <input
                    type="color"
                    className="opacity-0 absolute w-0 h-0"
                    value={config.bodyColor}
                    onChange={(e) => update("bodyColor", e.target.value)}
                  />
                  <span className="text-[10px] text-muted-foreground">+</span>
                </label>
              </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groups.map((group) => (
                <section key={group.key} className="bg-muted/50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                    {group.icon} {group.label}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => update(group.key as keyof IMascotConfig, item as never)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold border-2 transition-all duration-200 text-center leading-tight ${
                          config[group.key] === item
                            ? "bg-background border-blue-500 text-blue-600 dark:text-blue-400 shadow"
                            : "bg-transparent border-border text-muted-foreground hover:border-muted-foreground/50"
                        }`}
                      >
                        {LABEL_MAP[item] ?? item}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="h-1" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
