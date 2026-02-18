"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";

interface ModalOverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const focusFirstElement = (container: HTMLElement) => {
  const first = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
  first?.focus();
};

export default function ModalOverlay({
  open,
  onClose,
  children,
  className,
}: ModalOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, [open]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !overlayRef.current || !contentRef.current) {
      return;
    }

    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (open) {
      gsap.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power1.out" },
      );
      gsap.fromTo(
        content,
        { opacity: 0, y: 12, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power2.out" },
      );
      focusFirstElement(content);
      return;
    }

    const closeTimeline = gsap.timeline({
      defaults: { ease: "power1.out" },
      onComplete: () => setVisible(false),
    });

    closeTimeline.to(overlay, { opacity: 0, duration: 0.2 }, 0);
    closeTimeline.to(
      content,
      { opacity: 0, y: 12, scale: 0.95, duration: 0.2, ease: "power2.in" },
      0,
    );

    return () => {
      closeTimeline.kill();
    };
  }, [open, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, visible]);

  const onOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!visible || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={overlayRef}
      aria-modal
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={onOverlayClick}
    >
      <div ref={contentRef} className={cn("w-full", className)}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
