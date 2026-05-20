export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="site-header__brand" href="/" aria-label="ONE Fiança Locatícia">
        <img src="/logos/logo-one-wide.svg" alt="ONE Fiança Locatícia" />
      </a>

      <nav className="site-header__nav" aria-label="Navegação principal">
        <a href="#sobre">Sobre nós</a>
        <a href="#como-funciona">Como Funciona</a>
        <a href="#produtos">Produtos</a>
        <a href="#faq">FAQ</a>
      </nav>
    </header>
  )
}
