"use client";

import { Suspense } from "react";

export const ToggleMode = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <button
        onClick={() => {
          document.documentElement.classList.toggle("dark");
        }}
        className="fixed top-4 right-4 z-50 rounded bg-slate-200 dark:bg-stone-100 px-3 py-1 text-sm "
      >
        <span>Light</span> / <span>Dark</span>
      </button>
    </Suspense>
  );
};
