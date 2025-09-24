"use client";

import React from "react";

interface ClientCodeBlockProps {
  code: string;
  language?: string;
}

const ClientCodeBlock: React.FC<ClientCodeBlockProps> = ({
  code,
  language,
}) => {
  return (
    <div className="relative">
      <pre className="black/10 dark:bg-black/20 border border-stone-200 dark:border-stone-950 text-black dark:text-white p-4 shadow-sm rounded-lg">
        <code className={language ? `language-${language}` : undefined}>
          {code}
        </code>
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          alert("Code copié dans le presse-papier !");
        }}
        className="absolute top-2 right-2 bg-gray-200 dark:bg-stone-700 p-1 rounded text-sm hover:bg-gray-300 dark:hover:bg-stone-600"
        aria-label="Copier le code"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-copy-icon lucide-copy"
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      </button>
    </div>
  );
};

export default ClientCodeBlock;
