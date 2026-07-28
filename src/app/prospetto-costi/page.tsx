'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import { Lightbox } from '@/components/Lightbox'
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
              <Image src="/images/cuore.png" alt="" width={16} height={14} className="flex-shrink-0 mt-0.5" />
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
