import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import property from '@/config/property.json'

const p = property.caratteristichePrincipali

export default function CaratteristichePage() {
  return (
    <PhotoLayout>
      <div className="bg-white/85 rounded-xl shadow-md p-6 w-full space-y-4">
        <h1 className="text-[#CC1414] font-bold text-xl uppercase tracking-wide">
          {p.sectionTitle}
        </h1>

        <ul className="space-y-3">
          {p.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Image src="/images/cuore.png" alt="" width={16} height={14} className="flex-shrink-0 mt-0.5" />
              <span className="text-[#333333] text-sm leading-relaxed">
                {'label' in feature && feature.label ? (
                  <><strong>{feature.label}:</strong> {feature.text}</>
                ) : (
                  feature.text
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-[#CC1414] font-bold uppercase text-base mb-3">
            {p.condominioTitle}
          </h2>
          <ul className="space-y-3">
            {p.condominioItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <Image src="/images/cuore.png" alt="" width={16} height={14} className="flex-shrink-0 mt-0.5" />
                <span className="text-[#333333] text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PhotoLayout>
  )
}
