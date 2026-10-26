import { useState } from 'react';
import { ImageOff } from 'lucide-react';

export function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  loading = 'lazy',
  ...props
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = failedSrc === src;

  if (!src || failed) {
    return (
      <div className={`image-fallback ${fallbackClassName}`.trim()} role="img" aria-label={alt}>
        <ImageOff size={22} strokeWidth={1.4} aria-hidden="true" />
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setFailedSrc(src)}
      {...props}
    />
  );
}
