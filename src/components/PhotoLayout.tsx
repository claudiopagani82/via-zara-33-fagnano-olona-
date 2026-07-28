import Image from 'next/image'
import { DomusTuaLogo } from '@/components/DomusTuaLogo'

interface PhotoLayoutProps {
  children: React.ReactNode
  logoSize?: number
  backgroundImage?: string
}

export function PhotoLayout({ children, logoSize = 100, backgroundImage = '/images/foto-principale.jpg' }: PhotoLayoutProps) {
  return (
    <div className="relative min-h-[calc(100vh-6rem)] flex flex-col items-center justify-start overflow-hidden">
      {/* Background property photo */}
      <Image
        src={backgroundImage}
        alt=""
        fill
        className="object-cover object-center"
        priority
        aria-hidden="true"
      />
      {/* White wash overlay */}
      <div className="absolute inset-0 bg-white/45" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-8">
        <DomusTuaLogo size={logoSize} className="mb-6" />
        {children}
      </div>
    </div>
  )
}
