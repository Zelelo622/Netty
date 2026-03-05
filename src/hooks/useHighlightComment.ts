import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function useHighlightComment(
  highlightId: string | null,
  isLoading: boolean,
  commentsLength: number
) {
  const router = useRouter();
  const didHighlight = useRef(false);

  useEffect(() => {
    const id = highlightId || window.location.hash.replace("#", "");
    if (!id || isLoading || commentsLength === 0 || didHighlight.current) return;

    const timer = setTimeout(() => {
      const element = document.getElementById(id);
      if (!element) return;

      didHighlight.current = true;

      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("bg-primary/10", "ring-2", "ring-primary/20");

      setTimeout(() => {
        element.classList.remove("bg-primary/10", "ring-2", "ring-primary/20");
        router.replace(window.location.pathname + window.location.hash, { scroll: false });
      }, 2000);
    }, 100);

    return () => clearTimeout(timer);
  }, [highlightId, isLoading, commentsLength]);
}
