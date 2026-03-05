import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, content, targetLang = "en" } = await req.json();

    async function translateText(text: string, target: string) {
      if (!text) return "";

      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Google API error");

      const data = await response.json();

      return data[0].map((item: any) => item[0]).join("");
    }

    const [translatedTitle, translatedContent] = await Promise.all([
      title ? translateText(title, targetLang) : Promise.resolve(""),
      content ? translateText(content, targetLang) : Promise.resolve(""),
    ]);

    return NextResponse.json({
      title: translatedTitle,
      content: translatedContent,
    });
  } catch (error: any) {
    console.error("Translation Error:", error);
    return NextResponse.json({ error: "Ошибка перевода" }, { status: 500 });
  }
}
