// Remonta a cada navegação para animar a entrada do conteúdo da página
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>
}
