/**
 * Realm roles as configured in Keycloak (realm: qualificando-mvp).
 * These must match the role names EXACTLY as they exist in Keycloak -
 * keycloak-js's hasRealmRole() checks the raw realm_access.roles claim,
 * which does NOT carry a "ROLE_" prefix (that prefix is a Spring Security
 * convention applied only on the backend when building authorities).
 */
export enum AppRole {
  ADMIN = 'ROLE_ADMIN',
  EMPRESARIO = 'ROLE_EMPRESARIO',
  ALUNO = 'ROLE_ALUNO',
  PODER_PUBLICO = 'ROLE_PODER_PUBLICO',
  TALENTO = 'ROLE_TALENTO',
  TALENTO_EMPRESA = 'ROLE_TALENTO_EMPRESA'
}
