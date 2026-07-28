import { DomusTuaLogo } from '@/components/DomusTuaLogo'

interface DocumentLayoutProps {
  children: React.ReactNode
  sectionNumber?: string
  sectionTitle?: string
  logoSize?: number
}

export function DocumentLayout({
  children,
  sectionNumber,
  sectionTitle,
  logoSize = 90,
}: DocumentLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-6rem)] bg-white flex flex-col items-center">
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        {/* Logo centered */}
        <div className="flex justify-center mb-6">
          <DomusTuaLogo size={logoSize} />
        </div>

        {/* Section header */}
        {(sectionNumber || sectionTitle) && (
          <div className="mb-6">
            <h1 className="text-[#CC1414] font-bold text-xl uppercase tracking-wide">
              {sectionNumber && <span className="mr-1">{sectionNumber}</span>}
              {sectionTitle}
            </h1>
          </div>
        )}

        {/* Page content */}
        {children}
      </div>
    </div>
  )
}
