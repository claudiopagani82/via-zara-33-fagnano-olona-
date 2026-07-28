# Photo Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen, keyboard/swipe-navigable photo lightbox that opens when a visitor clicks a thumbnail on the "Come raggiungere 1", "Come raggiungere 2", or "Planimetrie" pages.

**Architecture:** One new presentational client component (`src/components/Lightbox.tsx`) that owns its own current-index state and all interaction handling (click, keyboard, touch swipe, body-scroll lock). Each of the 3 target pages becomes a client component, wraps its existing thumbnail `<Image>` in a `<button>`, keeps a local `lightboxIndex: number | null` state, and renders `<Lightbox>` conditionally. No global state, no new dependencies, no changes to any other page.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, `next/image`.

## Global Constraints

- No new npm dependencies — build the lightbox with plain React state and native DOM events (spec section "Architettura").
- Overlay z-index must be above the site navigation (`Navigation.tsx` uses `z-50`) — use `z-[60]` (spec section "Comportamento visivo e interazione").
- Image inside the lightbox is always `object-contain`, never cropped, regardless of how the thumbnail is displayed on the page (spec section "Comportamento visivo e interazione").
- Arrows and counter only render when `images.length > 1` (spec section "Comportamento visivo e interazione").
- Close on: click on the × button, click on the dark backdrop outside the photo, `Escape` key (spec section "Comportamento visivo e interazione").
- Navigate on: click arrows, `ArrowLeft`/`ArrowRight` keys, horizontal touch swipe past a distance threshold (spec section "Comportamento visivo e interazione").
- Body scroll must be locked while the lightbox is open and restored on close/unmount, same pattern as `Navigation.tsx:21-30` (spec section "Comportamento visivo e interazione").
- Only these 3 files change behavior: `src/app/come-raggiungerci-1/page.tsx`, `src/app/come-raggiungerci-2/page.tsx`, `src/app/planimetrie/page.tsx`. No other page is touched (spec section "Scope").
- This repo has no unit test runner — `npm run check` is lint + typecheck + build only. Verification for every task is `npm run typecheck` (or `npm run build` for the final task) plus manual browser verification where noted.

---

### Task 1: Create the `Lightbox` component

**Files:**
- Create: `src/components/Lightbox.tsx`

**Interfaces:**
- Produces: `Lightbox` React component, default export named `Lightbox`, props:
  ```ts
  interface LightboxProps {
    images: string[]
    initialIndex: number
    onClose: () => void
  }
  ```
  Later tasks import it as `import { Lightbox } from '@/components/Lightbox'`.

- [ ] **Step 1: Write the component**

Create `src/components/Lightbox.tsx` with this exact content:

```tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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

  return (
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
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: exits with no errors (the file is unused so far, but must still compile cleanly).

- [ ] **Step 3: Commit**

```bash
git add src/components/Lightbox.tsx
git commit -m "feat: add reusable Lightbox component for photo previews"
```

---

### Task 2: Wire the lightbox into "Come raggiungere 1"

**Files:**
- Modify: `src/app/come-raggiungerci-1/page.tsx` (full file, currently 35 lines)

**Interfaces:**
- Consumes: `Lightbox` from Task 1 (`import { Lightbox } from '@/components/Lightbox'`), props `{ images: string[], initialIndex: number, onClose: () => void }`.

- [ ] **Step 1: Replace the file contents**

Replace the full contents of `src/app/come-raggiungerci-1/page.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import { Lightbox } from '@/components/Lightbox'
import property from '@/config/property.json'

const p = property.dalCentroTradate

export default function ComeRaggiungereCentroPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <PhotoLayout>
      <h2 className="text-[#CC1414] font-bold italic text-xl text-center leading-snug mb-6">
        {p.heading}
      </h2>

      <div className="bg-white/85 rounded-xl shadow-md p-6 w-full text-[#333333] text-sm leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div><p>{p.leftText}</p></div>
          <div><p>{p.rightText}</p></div>
        </div>

        {p.images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {p.images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="relative rounded-lg overflow-hidden h-48 cursor-pointer"
              >
                <Image src={src} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}

        <p className="font-bold text-center text-[#333333]">{p.footer}</p>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={p.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </PhotoLayout>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: exits with no errors.

- [ ] **Step 3: Manual browser verification**

Run: `npm run dev`, open `http://localhost:3000/come-raggiungerci-1`.
Verify:
- Both thumbnails are still laid out exactly as before (2-col grid, same crop/size).
- Clicking either thumbnail opens a full-screen dark overlay showing that photo uncropped, with a "1/2" or "2/2" counter and left/right arrows.
- Left/right arrow buttons and `ArrowLeft`/`ArrowRight` keys switch photos and update the counter.
- Clicking the × button, clicking the dark area outside the photo, and pressing `Escape` all close the overlay.
- Page behind the overlay does not scroll while it's open.

- [ ] **Step 4: Commit**

```bash
git add src/app/come-raggiungerci-1/page.tsx
git commit -m "feat: open lightbox on photo click in come-raggiungerci-1"
```

---

### Task 3: Wire the lightbox into "Come raggiungere 2"

**Files:**
- Modify: `src/app/come-raggiungerci-2/page.tsx` (full file, currently 34 lines)

**Interfaces:**
- Consumes: `Lightbox` from Task 1, same props as Task 2.

- [ ] **Step 1: Replace the file contents**

Replace the full contents of `src/app/come-raggiungerci-2/page.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import { Lightbox } from '@/components/Lightbox'
import property from '@/config/property.json'

const p = property.daViaCrocifisso

export default function ComeRaggiungereViaCrocifissoPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <PhotoLayout>
      <h2 className="text-[#CC1414] font-bold italic text-xl text-center leading-snug mb-6">
        {p.heading}
      </h2>

      <div className="bg-white/85 rounded-xl shadow-md p-6 w-full text-[#333333] text-sm leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div><p>{p.leftText}</p></div>
          <div><p>{p.rightText}</p></div>
        </div>

        {p.images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {p.images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="relative rounded-lg overflow-hidden h-48 cursor-pointer"
              >
                <Image src={src} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}

        <p className="font-bold text-center text-[#333333]">{p.footer}</p>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={p.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </PhotoLayout>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: exits with no errors.

- [ ] **Step 3: Manual browser verification**

Run: `npm run dev` (if not already running), open `http://localhost:3000/come-raggiungerci-2`.
Verify the same 5 checks as Task 2 Step 3, on this page's 2 thumbnails.

- [ ] **Step 4: Commit**

```bash
git add src/app/come-raggiungerci-2/page.tsx
git commit -m "feat: open lightbox on photo click in come-raggiungerci-2"
```

---

### Task 4: Wire the lightbox into "Planimetrie"

**Files:**
- Modify: `src/app/planimetrie/page.tsx` (full file, currently 37 lines)

**Interfaces:**
- Consumes: `Lightbox` from Task 1, same props as Task 2.

- [ ] **Step 1: Replace the file contents**

Replace the full contents of `src/app/planimetrie/page.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import { Lightbox } from '@/components/Lightbox'
import { RedHeartIcon } from '@/components/RedHeartIcon'
import property from '@/config/property.json'

const p = property.planimetrie

export default function PlanimetriePage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <PhotoLayout>
      <div className="bg-white/85 rounded-xl shadow-md p-6 w-full space-y-4">
        <h1 className="text-[#CC1414] font-bold text-xl uppercase tracking-wide">
          {p.sectionTitle}
        </h1>

        <ul className="space-y-3">
          {p.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <RedHeartIcon size={16} className="mt-0.5" />
              <span className="text-[#333333] text-sm font-semibold">{item}</span>
            </li>
          ))}
        </ul>

        {p.images.length > 0 && (
          <div className="space-y-4">
            {p.images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="relative w-full rounded-xl overflow-hidden cursor-pointer"
                style={{ height: 280 }}
              >
                <Image src={src} alt={`Planimetria ${i + 1}`} fill className="object-contain object-center" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={p.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </PhotoLayout>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: exits with no errors.

- [ ] **Step 3: Manual browser verification**

Run: `npm run dev` (if not already running), open `http://localhost:3000/planimetrie`.
Verify the same 5 checks as Task 2 Step 3, on this page's 2 thumbnails (note: thumbnails here are stacked full-width, `object-contain`, not the 2-col `object-cover` grid used on the come-raggiungerci pages — the lightbox behavior itself should be identical).

- [ ] **Step 4: Commit**

```bash
git add src/app/planimetrie/page.tsx
git commit -m "feat: open lightbox on photo click in planimetrie"
```

---

### Task 5: Full production build check

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: build completes successfully, all routes (including `/come-raggiungerci-1`, `/come-raggiungerci-2`, `/planimetrie`) listed as prerendered with no errors.

- [ ] **Step 2: Regression check on an untouched page**

Run: `npm run dev` (if not already running), open `http://localhost:3000/caratteristiche-principali` (a page with images that was intentionally NOT modified by this plan).
Verify: thumbnails render as before and are NOT clickable/no lightbox opens — confirms the change didn't leak into other pages.

- [ ] **Step 3: Report completion**

No commit needed for this task (verification-only) — report back that all 3 pages have working lightboxes and the build is clean, ready for the user to decide when to push.
