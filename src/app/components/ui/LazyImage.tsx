import { useState, useEffect, useRef, type ImgHTMLAttributes } from "react";

/**
 * LazyImage - High-performance image component
 * Features:
 * - IntersectionObserver lazy loading (rootMargin: 200px pre-load)
 * - Responsive srcset via Unsplash width params (400/800/1200)
 * - Smooth fade-in transition on load
 * - Custom shimmer placeholder animation (synced with design system)
 * - Error fallback with retry capability
 * - fetchPriority support for LCP images
 * - Accessible alt text handling
 */

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Placeholder color classes */
  placeholderColor?: string;
  /** Additional wrapper className */
  wrapperClassName?: string;
  /** Margin before viewport trigger */
  rootMargin?: string;
  /** Enable responsive srcset for Unsplash images */
  responsive?: boolean;
  /** Custom responsive widths for srcset */
  responsiveWidths?: number[];
  /** Fetch priority for LCP images */
  fetchPriority?: "high" | "low" | "auto";
  /** Skip lazy loading (for above-the-fold / LCP images) */
  eager?: boolean;
  /** Dominant color for LQIP blur-up placeholder (hex, e.g. "#3b82f6") */
  dominantColor?: string;
}

/** Generate Unsplash srcset by replacing w= param */
function generateSrcSet(src: string, widths: number[]): string | undefined {
  if (!src || !src.includes("unsplash.com")) return undefined;
  return widths
    .map((w) => {
      const url = src.replace(/&w=\d+/, `&w=${w}`).replace(/\?w=\d+/, `?w=${w}`);
      // If no w= param exists, append it
      const finalUrl = url.includes(`w=${w}`) ? url : `${url}&w=${w}`;
      return `${finalUrl} ${w}w`;
    })
    .join(", ");
}

function generateSizes(): string {
  return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
}

export function LazyImage({
  src,
  alt,
  className = "",
  placeholderColor = "bg-gray-100 dark:bg-white/5",
  wrapperClassName = "",
  rootMargin = "200px",
  responsive = true,
  responsiveWidths = [400, 800, 1200],
  fetchPriority,
  eager = false,
  style,
  dominantColor,
  ...rest
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(eager);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eager) return;
    const el = imgRef.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, eager]);

  const handleRetry = () => {
    if (retryCount < 2) {
      setHasError(false);
      setIsLoaded(false);
      setRetryCount((c) => c + 1);
    }
  };

  const srcSet = responsive ? generateSrcSet(src || "", responsiveWidths) : undefined;
  const sizes = responsive && srcSet ? generateSizes() : undefined;

  const ERROR_SRC =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#999" stroke-width="2" opacity="0.3"><rect x="12" y="12" width="56" height="56" rx="6"/><path d="m12 56 16-18 32 32"/><circle cx="53" cy="31" r="7"/></svg>'
    );

  // Unique key forces re-mount of img on retry
  const imgKey = `${src}-${retryCount}`;

  // LQIP dominant color background style
  const dominantStyle = dominantColor
    ? { backgroundColor: dominantColor }
    : undefined;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${dominantColor ? "" : placeholderColor} ${wrapperClassName}`}
      style={{ ...style, ...dominantStyle }}
    >
      {isInView && !hasError && (
        <img
          key={imgKey}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading={eager ? "eager" : "lazy"}
          decoding={eager ? "sync" : "async"}
          {...(fetchPriority ? { fetchPriority } : {})}
          {...rest}
        />
      )}

      {/* Shimmer placeholder - shown before load completes */}
      {(!isInView || (!isLoaded && !hasError)) && (
        <div
          className={`absolute inset-0 ${dominantColor ? "" : placeholderColor}`}
          style={dominantStyle}
        >
          <div className="shimmer-sweep absolute inset-0" />
        </div>
      )}

      {/* Error fallback with retry */}
      {hasError && (
        <div className={`absolute inset-0 ${placeholderColor} flex flex-col items-center justify-center gap-2`}>
          <img src={ERROR_SRC} alt="" className="w-10 h-10 opacity-40" aria-hidden="true" />
          {retryCount < 2 && (
            <button
              onClick={handleRetry}
              className="text-[15px] text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-primary/5"
              style={{ fontWeight: 500 }}
              aria-label={`Thu tai lai hinh anh ${alt || ""}`}
            >
              Thu lai
            </button>
          )}
        </div>
      )}
    </div>
  );
}
