export type PartnerTier = 'platinum' | 'gold' | 'silver';

export interface Partner {
  name: string;
  tier: PartnerTier;
  /** Optional logo URL. When absent, the UI falls back to an initials badge. */
  logoUrl?: string;
  /** Only used for platinum partners (top bar hover + splash text). */
  description?: string;
  /**
   * Real external website - kept for reference/future use. NOT what the UI
   * links to today (see `slug` + `partnerSiteUrl()` below): every partner
   * currently ships with a generated institutional mini-site instead, built
   * from the shared template in `src/assets/partner-sites/`.
   */
  websiteUrl?: string;
  /** URL-safe identifier; also the filename (without extension) of this partner's site under `src/assets/partner-sites/`. */
  slug: string;
}

/**
 * Path to this partner's institutional mini-site (same template for every
 * partner today, one static HTML file per partner so each can be
 * customized independently later - see `src/assets/partner-sites/README.md`).
 * Always opened in a new tab (target="_blank") so the person never loses
 * their place in Qualificando.
 */
export function partnerSiteUrl(partner: Partner): string {
  return `assets/partner-sites/${partner.slug}.html`;
}

/** Turns a partner name into a URL-safe slug, e.g. "Tech Partner" -> "tech-partner". */
function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

/**
 * PLACEHOLDER CONTENT.
 * Real partner names/logos/descriptions/links still need to be supplied
 * (marketing/business team) - swap this array (or wire it to a
 * backend/CMS endpoint) once that list exists. Kept isolated in its own
 * file so it's a one-line change later, without touching the components
 * that consume it (partners-splash, partners-top-bar).
 */
const RAW_PARTNERS: Omit<Partner, 'slug'>[] = [
  // Platinum — 4 parceiros, aparecem também no topo (logo + link + hover)
  {
    name: 'Prefeitura Parceira',
    tier: 'platinum',
    description: 'Parceira institucional responsável pela viabilização do programa no município.',
    websiteUrl: 'https://exemplo-prefeitura.gov.br'
  },
  {
    name: 'Instituto de Ensino Parceiro',
    tier: 'platinum',
    description: 'Instituição de ensino que apoia o conteúdo pedagógico dos cursos.',
    websiteUrl: 'https://exemplo-instituto.org.br'
  },
  {
    name: 'Tech Partner',
    tier: 'platinum',
    description: 'Patrocinadora master, apoia bolsas e infraestrutura da plataforma.',
    websiteUrl: 'https://exemplo-empresa-a.com.br'
  },
  {
    name: 'Federação das Indústrias',
    tier: 'platinum',
    description: 'Conecta os formandos às vagas oferecidas pelas indústrias associadas.',
    websiteUrl: 'https://exemplo-federacao.org.br'
  },

  // Gold — 10 parceiros, logo menor + nome embaixo
  { name: 'Associação Comercial Local', tier: 'gold', websiteUrl: 'https://exemplo-acl.org.br' },
  { name: 'Câmara de Dirigentes Lojistas', tier: 'gold', websiteUrl: 'https://exemplo-cdl.org.br' },
  { name: 'Edu Parceira', tier: 'gold', websiteUrl: 'https://exemplo-varejo.com.br' },
  { name: 'Empresa Parceira C', tier: 'gold', websiteUrl: 'https://exemplo-empresa-c.com.br' },
  { name: 'Varejo Parceiro', tier: 'gold', websiteUrl: 'https://exemplo-cooperativa.com.br' },
  { name: 'Sindicato Patronal', tier: 'gold', websiteUrl: 'https://exemplo-sindicato.org.br' },
  { name: 'Fundação de Apoio ao Ensino', tier: 'gold', websiteUrl: 'https://exemplo-fundacao.org.br' },
  { name: 'Instituto Tecnológico Regional', tier: 'gold', websiteUrl: 'https://exemplo-instituto-tec.org.br' },
  { name: 'Grupo Industrial Parceiro', tier: 'gold', websiteUrl: 'https://exemplo-grupo-industrial.com.br' },

  // Silver — 10 parceiros, somente logo (menor)
  { name: 'Parceiro Silver 01', tier: 'silver', websiteUrl: 'https://exemplo-silver-01.com.br' },
  { name: 'Parceiro Silver 02', tier: 'silver', websiteUrl: 'https://exemplo-silver-02.com.br' },
  { name: 'Parceiro Silver 03', tier: 'silver', websiteUrl: 'https://exemplo-silver-03.com.br' },
  { name: 'Parceiro Silver 04', tier: 'silver', websiteUrl: 'https://exemplo-silver-04.com.br' },
  { name: 'Parceiro Silver 05', tier: 'silver', websiteUrl: 'https://exemplo-silver-05.com.br' },
  { name: 'Parceiro Silver 06', tier: 'silver', websiteUrl: 'https://exemplo-silver-06.com.br' },
  { name: 'Parceiro Silver 07', tier: 'silver', websiteUrl: 'https://exemplo-silver-07.com.br' },
  { name: 'Parceiro Silver 08', tier: 'silver', websiteUrl: 'https://exemplo-silver-08.com.br' },
  { name: 'Parceiro Silver 09', tier: 'silver', websiteUrl: 'https://exemplo-silver-09.com.br' },
  { name: 'Parceiro Silver 10', tier: 'silver', websiteUrl: 'https://exemplo-silver-10.com.br' }
];

export const PARTNERS_MOCK: Partner[] = RAW_PARTNERS.map(p => ({ ...p, slug: slugify(p.name) }));

export const PLATINUM_PARTNERS: Partner[] = PARTNERS_MOCK.filter(p => p.tier === 'platinum');
export const GOLD_PARTNERS: Partner[] = PARTNERS_MOCK.filter(p => p.tier === 'gold');
export const SILVER_PARTNERS: Partner[] = PARTNERS_MOCK.filter(p => p.tier === 'silver');
