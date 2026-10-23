export const API_URL = 'https://familymed-api.jpsilva030107.workers.dev';

let userId: string | null = null;
let patientId: string | null = null;
export const setApiUser = (id: string | null) => { userId = id; };
export const setApiPatient = (id: string | null) => { patientId = id; };

export async function api<T = any>(
  path: string,
  opts: { method?: string; body?: any } = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method: opts.method ?? (opts.body ? 'POST' : 'GET'),
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {}),
        ...(patientId ? { 'x-patient-id': patientId } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new Error('Sem conexão com o servidor.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro ?? 'Erro inesperado.');
  return data as T;
}
