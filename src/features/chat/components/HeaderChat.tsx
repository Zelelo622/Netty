import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";

export const HeaderChat = () => {
  const { closeChat } = useChat();

  return (
    <div className="flex items-center justify-between w-[70%] border-b">
      <>
        <h4>Сообщения</h4>
      </>
      <div>
        <Button onClick={closeChat} className="cursor-pointer" variant="ghost" size="icon-sm">
          <XIcon />
        </Button>
      </div>
    </div>
  );
};
