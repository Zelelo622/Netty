import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateSlug = (text: string): string => {
  const rus =
    "а-б-в-г-д-е-ё-ж-з-и-й-к-л-м-н-о-п-р-с-т-у-ф-х-ц-ч-ш-щ-ъ-ы-ь-э-ю-я".split(
      "-",
    );
  const lat =
    "a-b-v-g-d-e-e-zh-z-i-y-k-l-m-n-o-p-r-s-t-u-f-h-ts-ch-sh-shch--y--e-yu-ya".split(
      "-",
    );

  let res = text.toLowerCase();

  // Транслитерация
  for (let i = 0; i < rus.length; i++) {
    res = res.split(rus[i]).join(lat[i]);
  }

  return res
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};
