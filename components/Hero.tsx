export function Hero() {
  return (
    <section className="hero" aria-label="ONE hero">
      <div className="hero__media" aria-hidden="true">
        <div className="hero__glow hero__glow--one" />
        <div className="hero__glow hero__glow--two" />
        <div className="hero__grid" />
      </div>

      <header className="site-header">
        <a className="site-header__brand" href="/" aria-label="ONE">
          ONE
        </a>
        <nav className="site-header__nav" aria-label="Navegação principal">
          <a href="#solucao">Solução</a>
          <a href="#processo">Processo</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>

      <div className="hero__content">
        <p className="hero__eyebrow">Fiança locatícia inteligente</p>
        <h1>Proteção imobiliária com velocidade, critério e presença.</h1>
        <p className="hero__copy">
          Uma experiência digital para imobiliárias, corretores e locatários
          analisarem garantias com clareza e uma assinatura visual memorável.
        </p>
        <div className="hero__actions" id="contato">
          <a className="button button--primary" href="mailto:contato@one.com.br">
            Falar com a ONE
          </a>
          <a className="button button--ghost" href="#processo">
            Ver processo
          </a>
        </div>
      </div>

      <aside className="hero__panel" id="solucao" aria-label="Resumo da solução">
        <span>Análise</span>
        <strong>24h</strong>
        <p>Esteira digital para reduzir atrito e dar previsibilidade a cada etapa.</p>
      </aside>
    </section>
  )
}
