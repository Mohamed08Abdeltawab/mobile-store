"use client";

import { useState, useEffect, useRef } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  wrapperClassName?: string;
  blurColor?: string;
  priority?: boolean;
}

/**
 * High-performance Lazy Image with:
 * 1. Instant rendering if priority=true or already cached in browser
 * 2. IntersectionObserver viewport-detection for below-the-fold images
 * 3. Blur / Shimmer placeholder while loading
 * 4. Graceful fallback on broken image URLs
 * 5. GPU-accelerated smooth fade-in
 */
export default function LazyImage({
  src,
  alt = "",
  className = "",
  wrapperClassName = "",
  fallbackSrc = "/img/mobile-concept-01.png",
  blurColor = "bg-neutral-100",
  priority = false,
  ...props
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

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
        rootMargin: "250px 0px 250px 0px", // Preload when 250px near viewport
        threshold: 0.01
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  // Check if image is already cached in browser memory upon mounting
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src, isInView]);

  const imageSrc = hasError || !src ? fallbackSrc : src;

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden ${blurColor} ${wrapperClassName}`}
    >
      {/* Shimmer / Skeleton Placeholder while loading */}
      {!isLoaded && !priority && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse pointer-events-none z-0" />
      )}

      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={`${className} ${
            priority
              ? "" // No delay/fade-in for hero priority image
              : `transition-opacity duration-300 ease-out ${isLoaded ? "opacity-100" : "opacity-0"}`
          }`}
          {...props}
        />
      )}
    </div>
  );
}
