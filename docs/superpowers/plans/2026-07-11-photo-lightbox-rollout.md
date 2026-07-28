# Photo Lightbox Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the already-implemented, already-approved photo lightbox (`src/components/Lightbox.tsx`) to the 6 remaining pages that render a photo/document gallery, using the exact same wiring pattern already shipped on `come-raggiungerci-1`, `come-raggiungerci-2`, and `planimetrie`.

**Architecture:** No new components. `Lightbox` already exists, is portaled to `document.body` (fixes a stacking-context bug found and fixed in the prior rollout), and takes `{ images: string[], initialIndex: number, onClose: () => void }`. Each target page becomes a client component, wraps its existing thumbnail `<Image>` in a `<button>`, keeps a local `lightboxIndex: number | null` state, and renders `<Lightbox>` conditionally — identical pattern to the prior plan (`docs/superpowers/plans/2026-07-11-photo-lightbox.md`), just applied to 6 more files.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, `next/image`.

## Global Constraints

- No new npm dependencies, no changes to `src/components/Lightbox.tsx` itself — it already handles arbitrary thumbnail styling correctly (always renders `object-contain` internally regardless of how the calling page displays its thumbnail).
- Only these 6 files change behavior: `src/app/ape/page.tsx`, `src/app/bollette-e-impianti/page.tsx`, `src/app/documenti-catastali/page.tsx`, `src/app/prospetto-costi/page.tsx`, `src/app/relazione-tecnica/page.tsx`, `src/app/bozza-proposta/page.tsx`.
- **Explicitly excluded, do not touch:** `src/app/documenti-condominiali/page.tsx` (will be converted to a downloadable-PDF list in a future task, not photos), `src/app/matterport/page.tsx` and `src/app/video-social/page.tsx` (single thumbnail that click-through to an external URL, not a photo gallery — confirmed with the user this should stay as-is), `src/app/caratteristiche-principali/page.tsx`, `src/app/introduzione/page.tsx`, `src/app/open-domus/page.tsx`, `src/app/per-te-venditore/page.tsx` (no image gallery on these pages at all).
- 5 of the 6 pages (`ape`, `bollette-e-impianti`, `documenti-catastali`, `prospetto-costi`, `relazione-tecnica`) share the exact same thumbnail pattern: `<Image fill className="object-contain object-center" />` inside a `<div style={{ height: N }}>` — only the `height` value, `alt` text prefix, and `property.json` key differ per page (and `ape` has an extra caption paragraph after the loop, which must be preserved).
- `bozza-proposta` uses a **different** thumbnail pattern: no `fill`, intrinsic `width={800} height={1100}` with `className="w-full h-auto"`, wrapped in a div with `border border-gray-200 shadow-sm` (no fixed height). The button wrapper must preserve this exact styling — do not convert it to the `fill`/height-based pattern used elsewhere.
- This repo has no unit test runner — verification for every task is `npm run typecheck` plus manual browser verification.

---

### Task 1: Wire the lightbox into "APE"

**Files:**
- Modify: `src/app/ape/page.tsx` (full file, currently 38 lines)

**Interfaces:**
- Consumes: `Lightbox` from `@/components/Lightbox`, props `{ images: string[], initialIndex: number, onClose: () => void }` (already implemented, do not modify).

- [ ] **Step 1: Replace the file contents**

Replace the full contents of `src/app/ape/page.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import { Lightbox } from '@/components/Lightbox'
import { RedHeartIcon } from '@/components/RedHeartIcon'
import property from '@/config/property.json'

const p = property.ape

export default function ApePage() {
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
                style={{ height: 360 }}
              >
                <Image src={src} alt={`APE ${i + 1}`} fill className="object-contain object-center" />
              </button>
            ))}
            <p className="text-[#555555] text-xs text-center italic">{p.caption}</p>
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

Run: `npm run dev` (skip if already running), open `http://localhost:3000/ape`.
Verify:
- Thumbnail(s) and the caption paragraph below them are laid out exactly as before.
- Clicking a thumbnail opens the full-screen lightbox showing that photo uncropped.
- Arrow keys/buttons navigate if there's more than one image; X, backdrop click, and Escape all close it.
- Page behind the overlay does not scroll while it's open.

- [ ] **Step 4: Commit**

```bash
git add src/app/ape/page.tsx
git commit -m "feat: open lightbox on photo click in ape"
```

---

### Task 2: Wire the lightbox into "Bollette e impianti"

**Files:**
- Modify: `src/app/bollette-e-impianti/page.tsx` (full file, currently 37 lines)

**Interfaces:**
- Consumes: `Lightbox` from `@/components/Lightbox`, same props as Task 1.

- [ ] **Step 1: Replace the file contents**

Replace the full contents of `src/app/bollette-e-impianti/page.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import { Lightbox } from '@/components/Lightbox'
import { RedHeartIcon } from '@/components/RedHeartIcon'
import property from '@/config/property.json'

const p = property.bolletteImpianti

export default function BolletteImpiantiPage() {
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
                <Image src={src} alt={`Bollette e impianti ${i + 1}`} fill className="object-contain object-center" />
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

Run: `npm run dev` (skip if already running), open `http://localhost:3000/bollette-e-impianti`.
Verify the same 4 checks as Task 1 Step 3, on this page's thumbnails.

- [ ] **Step 4: Commit**

```bash
git add src/app/bollette-e-impianti/page.tsx
git commit -m "feat: open lightbox on photo click in bollette-e-impianti"
```

---

### Task 3: Wire the lightbox into "Documenti catastali"

**Files:**
- Modify: `src/app/documenti-catastali/page.tsx` (full file, currently 37 lines)

**Interfaces:**
- Consumes: `Lightbox` from `@/components/Lightbox`, same props as Task 1.

- [ ] **Step 1: Replace the file contents**

Replace the full contents of `src/app/documenti-catastali/page.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import { Lightbox } from '@/components/Lightbox'
import { RedHeartIcon } from '@/components/RedHeartIcon'
import property from '@/config/property.json'

const p = property.documentiCatastali

export default function DocumentiCatastaliPage() {
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
                <Image src={src} alt={`Documento catastale ${i + 1}`} fill className="object-contain object-center" />
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

Run: `npm run dev` (skip if already running), open `http://localhost:3000/documenti-catastali`.
Verify the same 4 checks as Task 1 Step 3, on this page's thumbnails.

- [ ] **Step 4: Commit**

```bash
git add src/app/documenti-catastali/page.tsx
git commit -m "feat: open lightbox on photo click in documenti-catastali"
```

---

### Task 4: Wire the lightbox into "Prospetto costi"

**Files:**
- Modify: `src/app/prospetto-costi/page.tsx` (full file, currently 37 lines)

**Interfaces:**
- Consumes: `Lightbox` from `@/components/Lightbox`, same props as Task 1.

- [ ] **Step 1: Replace the file contents**

Replace the full contents of `src/app/prospetto-costi/page.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import { Lightbox } from '@/components/Lightbox'
import { RedHeartIcon } from '@/components/RedHeartIcon'
import property from '@/config/property.json'

const p = property.prospettoCosti

export default function ProspettoCostiPage() {
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
                style={{ height: 360 }}
              >
                <Image src={src} alt={`Prospetto costi ${i + 1}`} fill className="object-contain object-center" />
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

Run: `npm run dev` (skip if already running), open `http://localhost:3000/prospetto-costi`.
Verify the same 4 checks as Task 1 Step 3, on this page's thumbnails.

- [ ] **Step 4: Commit**

```bash
git add src/app/prospetto-costi/page.tsx
git commit -m "feat: open lightbox on photo click in prospetto-costi"
```

---

### Task 5: Wire the lightbox into "Relazione tecnica"

**Files:**
- Modify: `src/app/relazione-tecnica/page.tsx` (full file, currently 37 lines)

**Interfaces:**
- Consumes: `Lightbox` from `@/components/Lightbox`, same props as Task 1.

- [ ] **Step 1: Replace the file contents**

Replace the full contents of `src/app/relazione-tecnica/page.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import { Lightbox } from '@/components/Lightbox'
import { RedHeartIcon } from '@/components/RedHeartIcon'
import property from '@/config/property.json'

const p = property.relazioneTecnica

export default function RelazioneTecnicaPage() {
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
                style={{ height: 360 }}
              >
                <Image src={src} alt={`Relazione tecnica ${i + 1}`} fill className="object-contain object-center" />
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

Run: `npm run dev` (skip if already running), open `http://localhost:3000/relazione-tecnica`.
Verify the same 4 checks as Task 1 Step 3, on this page's thumbnails.

- [ ] **Step 4: Commit**

```bash
git add src/app/relazione-tecnica/page.tsx
git commit -m "feat: open lightbox on photo click in relazione-tecnica"
```

---

### Task 6: Wire the lightbox into "Bozza proposta" (variant thumbnail pattern)

**Files:**
- Modify: `src/app/bozza-proposta/page.tsx` (full file, currently 37 lines)

**Interfaces:**
- Consumes: `Lightbox` from `@/components/Lightbox`, same props as Task 1.

**Note:** this page's thumbnail does NOT use `fill`/fixed height like the other 5 pages — it uses intrinsic `width={800} height={1100}` with `className="w-full h-auto"` and a `border border-gray-200 shadow-sm` wrapper. Preserve this exactly; do not convert it to the `fill` pattern used elsewhere. `Lightbox` itself is unaffected by this difference — it always displays the photo at `object-contain` inside its own fixed-size box regardless of how the calling page's thumbnail is styled.

- [ ] **Step 1: Replace the file contents**

Replace the full contents of `src/app/bozza-proposta/page.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import { Lightbox } from '@/components/Lightbox'
import { RedHeartIcon } from '@/components/RedHeartIcon'
import property from '@/config/property.json'

const p = property.bozzaProposta

export default function BozzaPropostaPage() {
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
                className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer"
              >
                <Image src={src} alt={`Proposta ${i + 1}`} width={800} height={1100} className="w-full h-auto" />
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

Run: `npm run dev` (skip if already running), open `http://localhost:3000/bozza-proposta`.
Verify:
- Thumbnails still render at their natural (800:1100) aspect ratio, full container width, with the border/shadow — no fixed-height cropping introduced.
- Clicking a thumbnail opens the full-screen lightbox showing that photo uncropped.
- Navigation and all 3 close methods work as on the other pages.

- [ ] **Step 4: Commit**

```bash
git add src/app/bozza-proposta/page.tsx
git commit -m "feat: open lightbox on photo click in bozza-proposta"
```

---

### Task 7: Full production build check and regression check on excluded pages

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: build completes successfully, all routes listed as prerendered with no errors.

- [ ] **Step 2: Regression check on excluded pages**

Run: `npm run dev` (if not already running).
- Open `http://localhost:3000/documenti-condominiali` — confirm its images are NOT clickable (no lightbox opens), since this page was explicitly excluded.
- Open `http://localhost:3000/matterport` — confirm the thumbnail still works as a click-through link to the external Matterport URL (not a lightbox).
- Open `http://localhost:3000/video-social` — confirm the card still works as a click-through link to the external Instagram URL (not a lightbox).

- [ ] **Step 3: Report completion**

No commit needed for this task (verification-only) — report back that all 6 pages have working lightboxes, the excluded pages are confirmed untouched, and the build is clean, ready for the user to decide when to push.
