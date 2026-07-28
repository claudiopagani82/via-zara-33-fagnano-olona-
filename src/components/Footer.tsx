export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#555555] gap-1">
      <div className="flex items-center gap-1">
        <a href="#" className="hover:text-[#CC1414] transition-colors">
          Termini e assistenza
        </a>
        <span>|</span>
        <a href="#" className="hover:text-[#CC1414] transition-colors">
          Normativa sulla privacy
        </a>
      </div>
      <div className="text-gray-400">Realizzato con Next.js</div>
    </footer>
  )
}
