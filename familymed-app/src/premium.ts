// ===== Configuração do "Premium" (simulação) =====
// Troque para false/0 para liberar cada recurso durante uma demonstração.
export const LOCKS = {
  profissionais: true,      // adicionar médicos e cuidadores
  exportarHistorico: true,  // exportar histórico
  temaEscuro: true,         // ativar o modo escuro
  maxFamiliares: 2,         // limite do plano grátis (0 = sem limite)
  maxMedicamentos: 3,       // por familiar, no plano grátis (0 = sem limite)
};

export type Feature = 'welcome' | 'profissionais' | 'exportar' | 'tema' | 'familiares' | 'medicamentos';

export const FEATURE_TEXT: Record<Feature, { titulo: string; sub: string }> = {
  welcome: { titulo: 'Cuide melhor da sua família', sub: 'Desbloqueie tudo com o FamilyMed Premium.' },
  profissionais: { titulo: 'Profissionais de apoio', sub: 'Adicionar médicos e cuidadores é um recurso Premium.' },
  exportar: { titulo: 'Exportar histórico', sub: 'Compartilhar o histórico de administração é um recurso Premium.' },
  tema: { titulo: 'Modo escuro', sub: 'O modo escuro está disponível no plano Premium.' },
  familiares: { titulo: 'Mais familiares', sub: `O plano grátis permite até ${LOCKS.maxFamiliares} familiares.` },
  medicamentos: { titulo: 'Mais medicamentos', sub: `O plano grátis permite até ${LOCKS.maxMedicamentos} medicamentos por familiar.` },
};

export const BENEFITS = [
  'Familiares e medicamentos ilimitados',
  'Profissionais de apoio (médicos e cuidadores)',
  'Exportação do histórico (CSV e PDF)',
  'Modo escuro e temas exclusivos',
  'Lembretes por SMS e WhatsApp',
  'Emergência com escalonamento automático',
  'Backup na nuvem e relatório mensal de adesão',
  'Suporte prioritário',
];
