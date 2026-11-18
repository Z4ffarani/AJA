import Link from 'next/link'

// Trilha de navegação do computador, no mesmo padrão do Dossiê (no celular, o cabeçalho já tem o Voltar).
export function Crumbs({ items }: { items: [string, string?][] }) {
  return (
    <nav className="crumbs only-d" aria-label="Você está em">
      <ol>
        {items.map(([label, href], i) => (
          <li key={i}>
            {i > 0 && <span aria-hidden="true">›</span>}
            {href ? <Link href={href}>{label}</Link> : <span aria-current={i === items.length - 1 ? 'page' : undefined}>{label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
