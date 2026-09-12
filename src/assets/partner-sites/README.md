# Sites institucionais dos parceiros

Cada arquivo `.html` nesta pasta é o site institucional (mini-site) de UM
parceiro do Qualificando. Todos foram gerados a partir do mesmo template
(ver `/mnt` do repo de geração, ou simplesmente duplique um `.html`
existente), mas cada arquivo é 100% independente: dá pra editar o site de
um parceiro específico sem afetar os outros.

## Estrutura de cada site

Página única (single page) com navegação por âncoras:

- **Home** (`#home`) - hero com nome do parceiro, tagline e CTA
- **Serviços** (`#servicos`) - 3 cards de atuação
- **Sobre** (`#sobre`) - descrição do parceiro + ficha rápida
- **Contato** (`#contato`) - informações de contato + formulário (visual,
  não envia dados de verdade)

## Como customizar o site de um parceiro específico

Abra o arquivo `<slug>.html` correspondente (o slug é o mesmo usado em
`partners.mock.ts`) e edite livremente: cores (variáveis `--copper` /
`--copper-ink` no `<style>`), textos, serviços, etc. Não é necessário
mexer em nenhum outro arquivo do projeto.

## Como estão ligados ao app

`partners.mock.ts` expõe `partnerSiteUrl(partner)`, que devolve o caminho
`assets/partner-sites/<slug>.html`. Os componentes `partners-splash`,
`partners-top-bar` e `partners-list` usam essa função para montar o
`href` de cada card/logo, sempre com `target="_blank"` - o site do
parceiro abre em uma nova aba, sem tirar a pessoa do Qualificando.

## Como gerar/regenerar os sites em lote

Se precisar recriar todos de uma vez (por exemplo, depois de mudar o
template base), use o script Python de geração que acompanha este
trabalho (`gen/generate.py` no pacote entregue) - ele lê os dados de
`partners.mock.ts` (nome, tier, descrição) e escreve um `.html` por
parceiro nesta pasta. Como cada arquivo já editado manualmente será
sobrescrito, prefira editar apenas os parceiros que ainda estão no
template padrão.
