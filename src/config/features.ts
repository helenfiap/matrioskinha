const STORAGE_KEY = 'matrioskinha-feature-pedagogical-cycle';

function readPedagogicalCycleFlag(): boolean {
  const env = (import.meta.env as Record<string, string | boolean | undefined>).VITE_PEDAGOGICAL_CYCLE;
  if (env === 'true' || env === true) return true;
  if (env === 'false' || env === false) return false;
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'true') return true;
  if (stored === 'false') return false;
  const hashQuery = window.location.hash.split('?')[1] ?? '';
  if (new URLSearchParams(hashQuery).get('pedagogy') === '1') return true;
  // P1/P2 foram validadas no protótipo e promovidas para a versão principal.
  // A variável de ambiente `false` e o override local continuam funcionando
  // como kill switch em caso de necessidade operacional.
  return true;
}

export const featureFlags = Object.freeze({
  pedagogicalCycle: readPedagogicalCycleFlag(),
});

export function setPedagogicalCycleFlag(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, String(enabled));
}
