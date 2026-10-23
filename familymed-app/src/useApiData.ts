import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import { useSession } from './session';

// Carrega dados da API e recarrega quando: a tela ganha foco OU o familiar selecionado muda.
export function useApiData<T>(path: string) {
  const { patientId } = useSession();
  const [data, setData] = useState<T | null>(null);
  const [erro, setErro] = useState('');
  const req = useRef(0);

  const reload = useCallback(async () => {
    const id = ++req.current;
    try {
      const d = await api<T>(path);
      if (id === req.current) { setData(d); setErro(''); }
    } catch (e: any) {
      if (id === req.current) setErro(e.message);
    }
  }, [path, patientId]);

  // troca de familiar: limpa os dados antigos e carrega os novos
  useEffect(() => {
    setData(null);
    reload();
  }, [reload]);

  // volta para a aba: atualiza
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { data, erro, reload };
}
