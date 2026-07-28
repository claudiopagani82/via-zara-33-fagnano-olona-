'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

interface LightboxProps {
  images: string[]
  initialIndex: number
  onClose: () => void
}

const SWIPE_THRESHOLD_PX = 50

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex)
  const touchStartX = useRef<number | null>(null)

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goPrev, goNext])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (deltaX > SWIPE_THRESHOLD_PX) goPrev()
    else if (deltaX < -SWIPE_THRESHOLD_PX) goNext()
    touchStartX.current = null
  }

  // Portal to body: PhotoLayout wraps children in a `relative z-10` div, which
  // creates a stacking context that traps this overlay's z-index below the
  // site header (z-50) even though this is `position: fixed`. Don't remove.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Anteprima foto"
    >
      <button
        onClick={onClose}
        aria-label="Chiudi anteprima"
        className="absolute top-4 right-4 text-white text-3xl leading-none w-10 h-10 flex items-center justify-center hover:opacity-70 transition-opacity"
      >
        ×
      </button>

      {images.length > 1 && (
        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium">
          {index + 1}/{images.length}
        </span>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            aria-label="Foto precedente"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white text-4xl leading-none w-12 h-12 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            aria-label="Foto successiva"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white text-4xl leading-none w-12 h-12 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            ›
          </button>
        </>
      )}

      <div className="relative w-[90vw] h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <Image src={images[index]} alt="" fill className="object-contain" sizes="90vw" />
      </div>
    </div>,
    document.body
  )
}
