export type EyeType = "default" | "anime" | "star";
export type HairType = "none" | "cap" | "bandage";
export type ClothingType = "none" | "raincoat" | "kimono";
export type AccessoryType = "none" | "antenna" | "anon";

export interface IMascotConfig {
  bodyColor: string;
  eyeType: EyeType;
  hairType: HairType;
  clothingType: ClothingType;
  accessoryType: AccessoryType;
}

export const DEFAULT_MASCOT_CONFIG: IMascotConfig = {
  bodyColor: "#F2F2F7",
  eyeType: "default",
  hairType: "none",
  clothingType: "none",
  accessoryType: "antenna",
};

export const encodeMascotConfig = (config: IMascotConfig): string => JSON.stringify(config);

export const decodeMascotConfig = (raw: string | null | undefined): IMascotConfig => {
  if (!raw) return DEFAULT_MASCOT_CONFIG;
  try {
    return { ...DEFAULT_MASCOT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_MASCOT_CONFIG;
  }
};

export const MASCOT_SCHEME = "mascot://";

export const isMascotURL = (url: string | null | undefined): boolean =>
  !!url?.startsWith(MASCOT_SCHEME);

export const mascotURLToConfig = (url: string | null | undefined): IMascotConfig =>
  decodeMascotConfig(url?.replace(MASCOT_SCHEME, "") ?? null);

export const configToMascotURL = (config: IMascotConfig): string =>
  `${MASCOT_SCHEME}${encodeMascotConfig(config)}`;
