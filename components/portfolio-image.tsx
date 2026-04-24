'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface PortfolioImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

/**
 * PortfolioImage component that handles dual-source image loading
 * Supports loading from both Vercel Blob (blob URLs) and public directory
 */
export default function PortfolioImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'h-40 sm:h-48 overflow-hidden',
}: PortfolioImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.warn(`[v0] Failed to load image from: ${imageSrc}`);
    
    // If it's a blob URL and fails, try the public directory version
    if (imageSrc.includes('blob.vercel') || imageSrc.includes('vercel-storage')) {
      // Try to extract a fallback from the filename
      const filenameMatch = imageSrc.match(/portfolio\/([^/]+)$/);
      if (filenameMatch) {
        const fallbackPath = `/images/portfolio/${filenameMatch[1]}`;
        console.log('[v0] Trying fallback path:', fallbackPath);
        setImageSrc(fallbackPath);
        setHasError(false);
        return;
      }
    }
    
    // If all else fails, show error
    setHasError(true);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <div className={containerClassName}>
      {hasError ? (
        <div className={`${className} bg-gray-200 flex items-center justify-center`}>
          <span className="text-gray-500 text-sm">Image unavailable</span>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} group-hover:scale-105 transition-transform duration-300`}
          onError={handleError}
          onLoad={handleLoadingComplete}
        />
      )}
    </div>
  );
}
