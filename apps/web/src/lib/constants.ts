export const POST_FLAIRS = [
  {
    id: "serious",
    label: "Только серьезные ответы",
    color: "bg-red-500",
    textColor: "text-white",
  },
  {
    id: "question",
    label: "Вопрос",
    color: "bg-blue-500",
    textColor: "text-white",
  },
  { id: "meme", label: "Мем", color: "bg-purple-500", textColor: "text-white" },
  {
    id: "oc",
    label: "Авторский контент",
    color: "bg-yellow-500",
    textColor: "text-black",
  },
] as const;

export type FlairId = (typeof POST_FLAIRS)[number]["id"];
