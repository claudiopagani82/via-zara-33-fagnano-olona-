import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import property from '@/config/property.json'

const { introduzione: intro } = property

export default function IntroduzionePage() {
  return (
    <PhotoLayout>
      <h2
        className="text-3xl text-[#CC1414] text-center mb-4"
        style={{ fontFamily: 'var(--font-dancing-script), Dancing Script, cursive' }}
      >
        {intro.heading}
      </h2>

      <div className="bg-white/85 rounded-xl shadow-md p-6 w-full text-[#333333] text-sm leading-relaxed space-y-4">
        <p>{intro.greeting}</p>

        <p>{intro.paragraph1}</p>

        <p>{intro.sectionsLabel}</p>

        <ul className="space-y-2">
          {intro.sections.map((section, index) => (
            <li key={index} className="flex items-start gap-2">
              <Image src="/images/cuore.png" alt="" width={16} height={14} className="flex-shrink-0 mt-0.5" />
              <span className="font-semibold uppercase text-xs tracking-wide text-[#333333]">
                {section}
              </span>
            </li>
          ))}
        </ul>

        <p>{intro.paragraph2}</p>
      </div>
    </PhotoLayout>
  )
}
