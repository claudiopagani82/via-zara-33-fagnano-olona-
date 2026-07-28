import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import property from '@/config/property.json'

const p = property.matterport

export default function MatterportPage() {
  return (
    <PhotoLayout>
      <div className="text-center mb-6">
        <h1 className="text-[#CC1414] font-bold uppercase text-xl tracking-wide mb-2">
          {p.heading}
        </h1>
        <p className="text-[#555555] text-sm">{p.subtitle}</p>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden border border-gray-200" style={{ paddingBottom: '56.25%' }}>
        <Image
          src="/images/matterport-thumbnail.jpg"
          alt="Tour virtuale Matterport 3D"
          fill
          className="object-cover object-center"
        />
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-[#CC1414]/90 flex items-center justify-center shadow-lg hover:bg-[#CC1414] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div className="text-center text-white">
            <p className="font-semibold text-sm">{p.propertyName}</p>
            <p className="text-xs text-white/70 mt-1">{p.propertyLocation}</p>
          </div>
        </a>
      </div>
    </PhotoLayout>
  )
}
