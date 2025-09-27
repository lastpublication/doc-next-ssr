"use client";

import { useEffect, useMemo, useRef } from "react";
import type { DocDocument } from "./types";
import { DEFAULT_SSR_ID, flattenSections } from "./utils";

export interface DocClientProps {
  doc: DocDocument;
  /**
   * Optional illustration displayed above the title.
   */
  img?: string;
  /**
   * Identifier of the SSR element rendered on the server. Kept for backward compatibility.
   */
  ssrId?: string;
  /**
   * Class names applied to the root container.
   */
  className?: string;
  /**
   * Class names applied to the summary column.
   */
  summaryClassName?: string;
  /**
   * Class names applied to the article column.
   */
  articleClassName?: string;
  /**
   * Class names applied to the section elements.
   */
  sectionClassName?: string;
  /**
   * Toggle smooth scroll behavior.
   */
  smoothScroll?: boolean;
}

const SUMMARY_NAV_OPEN_CLASSES = ["block", "space-y-4"];
const SUMMARY_NAV_CLOSED_CLASSES = ["hidden"];
const SUMMARY_NAV_BASE_SPACING_CLASS = "space-y-2";
const SUMMARY_LINK_INACTIVE_CLASSES = ["text-stone-600", "dark:text-stone-300"];
const SUMMARY_LINK_ACTIVE_CLASSES = [
  "font-bold",
  "text-stone-900",
  "dark:text-white",
];
const SECTION_HIDDEN_CLASSES = ["opacity-0", "translate-y-6"];
const SECTION_VISIBLE_CLASSES = ["opacity-100", "translate-y-0"];
const SECTION_TRANSITION_CLASSES = [
  "transition-all",
  "duration-500",
  "ease-out",
];
const TOOLTIP_HIDDEN_CLASSES = ["opacity-0", "translate-y-2"];
const TOOLTIP_VISIBLE_CLASSES = ["opacity-100", "translate-y-0"];

export function DocClient({
  doc,
  ssrId = DEFAULT_SSR_ID,
  smoothScroll = true,
}: DocClientProps) {
  const sections = useMemo(() => flattenSections(doc), [doc]);
  const closeMenuRef = useRef<(() => void) | null>(null);
  const headerOffsetRef = useRef<number>(96);

  const detectHeaderOffset = () => {
    if (typeof document === "undefined") return 96;

    // allow CSS to define a custom offset via a root variable
    try {
      const cssVar = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--doc-header-offset");
      const parsed = Number(cssVar);
      if (!Number.isNaN(parsed) && parsed > 0) return Math.ceil(parsed);
    } catch (e) {
      /* ignore */
    }

    const selectors = [
      "[data-doc-header]",
      'header[role="banner"]',
      "header",
      ".site-header",
      ".topbar",
      ".navbar",
      ".header",
    ];

    for (const sel of selectors) {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.height > 0) return Math.ceil(r.height);
      }
    }

    // Fallback: scan for visible fixed/sticky elements pinned to the top
    const all = Array.from(document.body.querySelectorAll<HTMLElement>("*"));
    for (const el of all) {
      try {
        const style = getComputedStyle(el);
        if (style.position === "fixed" || style.position === "sticky") {
          const rect = el.getBoundingClientRect();
          if (rect.height > 0 && rect.top <= 1) return Math.ceil(rect.height);
        }
      } catch (e) {
        // skip elements that throw
      }
    }

    return 96;
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.querySelector<HTMLElement>(
      `[data-doc-root="${ssrId}"]`
    );
    if (!root) return;

    const toggle = root.querySelector<HTMLButtonElement>(
      `[data-doc-summary-toggle="${ssrId}"]`
    );
    const nav = root.querySelector<HTMLElement>(
      `[data-doc-summary="${ssrId}"]`
    );

    if (!nav) return;

    let isOpen = false;

    const applyOpenState = (open: boolean) => {
      isOpen = open;
      toggle?.setAttribute("aria-expanded", open ? "true" : "false");

      SUMMARY_NAV_CLOSED_CLASSES.forEach((cls) => {
        if (open) {
          nav.classList.remove(cls);
        } else {
          nav.classList.add(cls);
        }
      });

      SUMMARY_NAV_OPEN_CLASSES.forEach((cls) => {
        if (open) {
          nav.classList.add(cls);
        } else {
          nav.classList.remove(cls);
        }
      });

      if (open) {
        nav.classList.remove(SUMMARY_NAV_BASE_SPACING_CLASS);
      } else {
        nav.classList.add(SUMMARY_NAV_BASE_SPACING_CLASS);
      }
    };

    const handleClick = () => {
      applyOpenState(!isOpen);
    };

    toggle?.addEventListener("click", handleClick);
    applyOpenState(false);

    const closeMenu = () => applyOpenState(false);
    closeMenuRef.current = closeMenu;

    return () => {
      toggle?.removeEventListener("click", handleClick);
      if (closeMenuRef.current === closeMenu) {
        closeMenuRef.current = null;
      }
    };
  }, [ssrId]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.querySelector<HTMLElement>(
      `[data-doc-root="${ssrId}"]`
    );
    if (!root) return;

    const nav = root.querySelector<HTMLElement>(
      `[data-doc-summary="${ssrId}"]`
    );

    if (!nav) return;

    const anchors = new Map<string, HTMLAnchorElement>();
    sections.forEach((section) => {
      const anchor = nav.querySelector<HTMLAnchorElement>(
        `[data-doc-summary-link="${section.id}"]`
      );
      if (anchor) {
        anchors.set(section.id, anchor);
        SUMMARY_LINK_INACTIVE_CLASSES.forEach((cls) =>
          anchor.classList.add(cls)
        );
      }
    });

    const setActive = (id: string | null) => {
      anchors.forEach((anchor, key) => {
        const isActive = key === id;
        anchor.setAttribute("aria-current", isActive ? "true" : "false");
        SUMMARY_LINK_ACTIVE_CLASSES.forEach((cls) =>
          anchor.classList.toggle(cls, isActive)
        );
        SUMMARY_LINK_INACTIVE_CLASSES.forEach((cls) =>
          anchor.classList.toggle(cls, !isActive)
        );
        const marker = anchor.querySelector<HTMLElement>(
          "[data-doc-summary-marker]"
        );
        if (marker) {
          marker.classList.toggle("opacity-100", isActive);
          marker.classList.toggle("opacity-0", !isActive);
        }
      });
    };

    const handleAnchorClick = (event: MouseEvent) => {
      event.preventDefault();
      const anchor = event.currentTarget as HTMLAnchorElement;
      const targetId = anchor.dataset.docSummaryLink;
      if (!targetId) return;
      const target = root.querySelector<HTMLElement>(
        `[data-doc-section="${targetId}"]`
      );
      if (!target) return;

      // compute header offset (detected on mount/resize and cached)
      const headerOffset = headerOffsetRef.current ?? 96;
      const targetRect = target.getBoundingClientRect();
      const absoluteTop = targetRect.top + window.scrollY;

      // Deterministic simple scroll: compute absolute top minus headerOffset
      const scrollTop = Math.max(0, absoluteTop - headerOffset);
      if (smoothScroll && typeof window.scrollTo === "function") {
        window.scrollTo({ top: scrollTop, behavior: "smooth" });
      } else {
        window.scrollTo(0, scrollTop);
      }

      setActive(targetId);
      closeMenuRef.current?.();
    };

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", handleAnchorClick);
    });

    // detect header offset initially and on resize/orientation change
    const computeAndStore = () => {
      try {
        let offset = detectHeaderOffset();
        // enforce a minimum offset on mobile viewports to ensure anchors are visible
        const isMobile =
          typeof window !== "undefined" && window.innerWidth <= 640;
        const minMobileOffset = 300;
        if (isMobile) {
          offset = Math.max(offset, minMobileOffset);
        }

        headerOffsetRef.current = offset;

        // expose as CSS variable for consumers and ensure each section uses it via scroll-margin-top
        try {
          document.documentElement.style.setProperty(
            "--doc-header-offset",
            `${offset}px`
          );
        } catch (e) {
          /* ignore */
        }

        // apply scroll-margin-top to sections inside this root so scrollIntoView aligns correctly
        try {
          const sectionEls = Array.from(
            root.querySelectorAll<HTMLElement>("[data-doc-section]")
          );
          sectionEls.forEach((el) => {
            el.style.scrollMarginTop = `${offset}px`;
          });
        } catch (e) {
          /* ignore */
        }
      } catch (e) {
        headerOffsetRef.current =
          typeof window !== "undefined" && window.innerWidth <= 640 ? 200 : 96;
      }
    };
    computeAndStore();
    window.addEventListener("resize", computeAndStore, { passive: true });
    window.addEventListener("orientationchange", computeAndStore, {
      passive: true,
    });

    const sectionElements = sections
      .map((section) =>
        root.querySelector<HTMLElement>(`[data-doc-section="${section.id}"]`)
      )
      .filter((element): element is HTMLElement => Boolean(element));

    sectionElements.forEach((element) => {
      SECTION_TRANSITION_CLASSES.forEach((cls) => element.classList.add(cls));
      SECTION_HIDDEN_CLASSES.forEach((cls) => element.classList.add(cls));
    });

    const activeIdRef: { current: string | null } = {
      current: sections[0]?.id ?? null,
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const id = element.dataset.docSection;
          if (!id) return;

          if (entry.isIntersecting) {
            SECTION_VISIBLE_CLASSES.forEach((cls) =>
              element.classList.add(cls)
            );
            SECTION_HIDDEN_CLASSES.forEach((cls) =>
              element.classList.remove(cls)
            );

            if (entry.intersectionRatio >= 0.35) {
              if (activeIdRef.current !== id) {
                activeIdRef.current = id;
                setActive(id);
              }
            }
          }
        });
      },
      { threshold: [0.1, 0.35, 0.6], rootMargin: "-40% 0px -40% 0px" }
    );

    sectionElements.forEach((element) => intersectionObserver.observe(element));

    const initialHash = window.location.hash?.replace(/^#/, "");
    if (initialHash && anchors.has(initialHash)) {
      setActive(initialHash);
    } else {
      setActive(activeIdRef.current);
    }

    return () => {
      anchors.forEach((anchor) =>
        anchor.removeEventListener("click", handleAnchorClick)
      );
      intersectionObserver.disconnect();
      window.removeEventListener("resize", computeAndStore as any);
      window.removeEventListener("orientationchange", computeAndStore as any);
    };
  }, [sections, smoothScroll, ssrId]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.querySelector<HTMLElement>(
      `[data-doc-root="${ssrId}"]`
    );
    if (!root) return;

    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-doc-copy-button]")
    );
    if (!buttons.length) return;

    const timeouts = new Map<string, number>();

    const handleClick = (event: MouseEvent) => {
      const button = event.currentTarget as HTMLButtonElement;
      const code = button.dataset.docCopyCode;
      const key = button.dataset.docCopyButton;
      if (!code || !key) return;

      if (!navigator?.clipboard?.writeText) return;

      void navigator.clipboard.writeText(code).then(() => {
        const tooltip = root.querySelector<HTMLElement>(
          `[data-doc-copy-tooltip="${key}"]`
        );
        if (!tooltip) return;

        TOOLTIP_HIDDEN_CLASSES.forEach((cls) => tooltip.classList.remove(cls));
        TOOLTIP_VISIBLE_CLASSES.forEach((cls) => tooltip.classList.add(cls));

        const previous = timeouts.get(key);
        if (typeof previous === "number") {
          window.clearTimeout(previous);
        }

        const timeoutId = window.setTimeout(() => {
          TOOLTIP_VISIBLE_CLASSES.forEach((cls) =>
            tooltip.classList.remove(cls)
          );
          TOOLTIP_HIDDEN_CLASSES.forEach((cls) => tooltip.classList.add(cls));
        }, 2000);

        timeouts.set(key, timeoutId);
      });
    };

    buttons.forEach((button) => {
      button.addEventListener("click", handleClick);
    });

    return () => {
      buttons.forEach((button) =>
        button.removeEventListener("click", handleClick)
      );
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeouts.clear();
    };
  }, [ssrId]);

  return null;
}

export default DocClient;
