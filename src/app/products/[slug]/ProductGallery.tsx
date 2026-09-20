'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const safeImages = Array.isArray(images) && images.length > 0 ? images : ['/assets/prod_ganesha_hq.webp'];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'visible' | 'fading'>('visible');

  // Reset selected index if product images change
  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  const switchImage = useCallback(
    (newIndex: number) => {
      if (newIndex === selectedIndex) return;
      setFadeState('fading');
      setTimeout(() => {
        setSelectedIndex(newIndex);
        setFadeState('visible');
      }, 120);
    },
    [selectedIndex]
  );

  const handleNext = useCallback(() => {
    const nextIdx = (selectedIndex + 1) % safeImages.length;
    switchImage(nextIdx);
  }, [selectedIndex, safeImages.length, switchImage]);

  const handlePrev = useCallback(() => {
    const prevIdx = (selectedIndex - 1 + safeImages.length) % safeImages.length;
    switchImage(prevIdx);
  }, [selectedIndex, safeImages.length, switchImage]);

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (safeImages.length <= 1) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, safeImages.length]);

  return (
    <div className="pdp-gallery" aria-label={`${productName} photo gallery`}>
      {/* Main Image Container */}
      <div className="pdp-main-image" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={safeImages[selectedIndex]}
          alt={`${productName} view ${selectedIndex + 1}`}
          loading="eager"
          style={{
            opacity: fadeState === 'visible' ? 1 : 0.4,
            transform: fadeState === 'visible' ? 'scale(1)' : 'scale(0.98)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/prod_ganesha_hq.webp';
          }}
        />

        {/* Next & Previous Arrow Buttons */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="pdp-gallery-arrow pdp-gallery-arrow-prev"
              aria-label="Previous photo"
              title="Previous photo"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="pdp-gallery-arrow pdp-gallery-arrow-next"
              aria-label="Next photo"
              title="Next photo"
            >
              <ChevronRight size={20} />
            </button>

            {/* Photo Counter Badge */}
            <div className="pdp-gallery-counter">
              <span>{selectedIndex + 1}</span> / <span>{safeImages.length}</span>
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {safeImages.length > 1 && (
        <div className="pdp-thumbnails" role="tablist" aria-label="Photo thumbnails">
          {safeImages.map((img, i) => {
            const isActive = selectedIndex === i;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`View angle ${i + 1} for ${productName}`}
                className={`pdp-thumb-item ${isActive ? 'pdp-thumb-active' : ''}`}
                onClick={() => switchImage(i)}
                style={{
                  outline: 'none',
                  position: 'relative',
                  border: isActive
                    ? '2px solid #f5d77f'
                    : '1px solid rgba(212, 175, 55, 0.35)',
                  boxShadow: isActive
                    ? '0 0 14px rgba(245, 215, 127, 0.45)'
                    : 'none',
                  transform: isActive ? 'scale(1.04)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <img
                  src={img}
                  alt={`${productName} angle ${i + 1}`}
                  className="pdp-thumb-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/prod_ganesha_hq.webp';
                  }}
                />
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: '#f5d77f',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
