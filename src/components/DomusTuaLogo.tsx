import Image from 'next/image'

interface DomusTuaLogoProps {
  size?: number
  className?: string
}

export function DomusTuaLogo({ size = 100, className = '' }: DomusTuaLogoProps) {
  return (
    <Image
      src="/images/logo-domustua-componente.png"
      alt="DomusTua Immobiliare"
      width={size}
      height={size}
      className={`rounded-full mix-blend-multiply ${className}`}
      priority
    />
  )
}
