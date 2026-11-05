"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  direction?: "up" | "down" | "fade";
}

/**
 * High-performance, GPU-accelerated scroll reveal wrapper
 * Uses native IntersectionObserver and pure transform/opacity transitions
 * Disconnects automatically once animated for zero runtime overhead.
 */
export default function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
  direction = "up"
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
            observer.disconnect();
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -60px 0px", // Trigger slightly before reaching the bottom
        threshold: 0.08
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const getHiddenTransform = () => {
    if (direction === "up") return "translate3d(0, 24px, 0)";
    if (direction === "down") return "translate3d(0, -24px, 0)";
    return "translate3d(0, 0, 0)";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate3d(0, 0, 0)" : getHiddenTransform(),
        transitionProperty: "opacity, transform",
        transitionDuration: "700ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", // Smooth ease-out
        transitionDelay: `${delayMs}ms`,
        willChange: isVisible ? "auto" : "opacity, transform"
      }}
    >
      {children}
    </div>
  );
}
