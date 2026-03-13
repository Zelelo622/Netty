import React from "react";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const COMBINED_REGEX = /(https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

export const ParseMessageText = (text: string) => {
  const parts = text.split(COMBINED_REGEX);

  return parts.map((part, i) => {
    if (URL_REGEX.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 opacity-90 hover:opacity-100 break-all"
        >
          {part}
        </a>
      );
    }
    if (EMAIL_REGEX.test(part)) {
      return (
        <a
          key={i}
          href={`mailto:${part}`}
          className="underline underline-offset-2 opacity-90 hover:opacity-100"
        >
          {part}
        </a>
      );
    }

    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};
