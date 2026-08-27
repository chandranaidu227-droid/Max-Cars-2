"use client";

import { useEffect, useRef, useState } from "react";

type VehicleImageProps = {
  src?: string;
  alternates?: string[];
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  sizes?: string;
  draggable?: boolean;
  style?: React.CSSProperties;
  onDoubleClick?: () => void;
};

export default function VehicleImage({
  src,
  alternates = [],
  alt,
  className = "",
  loading = "lazy",
  sizes = "100vw",
  draggable = false,
  style,
  onDoubleClick,
}: VehicleImageProps) {
  const candidates = [src, ...alternates].filter(Boolean) as string[];
  const imageRef = useRef<HTMLImageElement>(null);
  const [candidate, setCandidate] = useState(0),
    [retry, setRetry] = useState(0),
    [loaded, setLoaded] = useState(false),
    [failed, setFailed] = useState(!candidates.length);
  useEffect(() => {
    setCandidate(0);
    setRetry(0);
    setLoaded(false);
    setFailed(!candidates.length);
  }, [src, alternates.join("|")]);
  const current = candidates[candidate];
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setLoaded(true);
  }, [current, retry]);
  const fail = () => {
    if (retry < 1) {
      setRetry(1);
      setLoaded(false);
      return;
    }
    if (candidate < candidates.length - 1) {
      setCandidate((x) => x + 1);
      setRetry(0);
      setLoaded(false);
      return;
    }
    setFailed(true);
    console.warn(`[MAX CARS media] Unable to load verified image for: ${alt}`);
  };
  if (failed || !current)
    return (
      <div
        className={`vehicle-image-fallback ${className}`}
        role="img"
        aria-label={`${alt}. Exact image unavailable.`}
      >
        <strong aria-hidden="true">MAX CARS</strong>
        <strong>MAX CARS</strong>
        <span>Exact media verification in progress</span>
      </div>
    );
  return (
    <span
      className={`vehicle-image-shell ${loaded ? "is-loaded" : "is-loading"} ${className}`}
    >
      {!loaded && <i className="vehicle-image-skeleton" aria-hidden="true" />}
      <img
        ref={imageRef}
        key={`${current}-${retry}`}
        src={`${current}${retry ? `${current.includes("?") ? "&" : "?"}retry=1` : ""}`}
        alt={alt}
        loading={loading}
        fetchPriority={loading === "eager" ? "high" : "auto"}
        sizes={sizes}
        decoding="async"
        draggable={draggable}
        style={style}
        onLoad={() => setLoaded(true)}
        onError={fail}
        onDoubleClick={onDoubleClick}
      />
    </span>
  );
}
