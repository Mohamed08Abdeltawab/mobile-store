"use client";

import { useState, useEffect, useRef } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  wrapperClassName?: string;
  blurColor?: string;
}

/**
 * High-performance Lazy Image with:
 * 1. IntersectionObserver viewport-detection (won't trigger request until within 150px of viewport)
 * 2. Blur / Shimmer placeholder while loading
 * 3. Graceful fallback on broken image URLs
 * 4. GPU-accelerated smooth fade-in
 */
export default function LazyImage({
  src,
  alt = "",
  className = "",
  wrapperClassName = "",
  fallbackSrc = "/img/mobile-concept-01.png",
  blurColor = "bg-neutral-100",
  ...props
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "180px 0px 180px 0px", // Preload when 180px near viewport
        threshold: 0.01
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  const imageSrc = hasError || !src ? fallbackSrc : src;

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden ${blurColor} ${wrapperClassName}`}
    >
      {/* Shimmer / Skeleton Placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse pointer-events-none z-0" />
      )}

      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={`${className} transition-opacity duration-500 ease-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          {...props}
        />
      )}
    </div>
  );
}
