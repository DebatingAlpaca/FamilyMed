import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SessionProvider, useSession } from '../src/session';
import { colors } from '../src/theme';

function Gate() {
  const { session, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!session && !inAuth) router.replace('/login');
    else if (session && inAuth) router.replace('/dashboard');
  }, [session, loading, segments]);

  const h = (title: string) => ({ headerShown: true, title, headerTintColor: colors.primary });
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="alertas" options={h('Alertas')} />
      <Stack.Screen name="novo-medicamento" options={h('Novo medicamento')} />
      <Stack.Screen name="novo-paciente" options={h('Novo familiar')} />
      <Stack.Screen name="editar-paciente" options={h('Editar familiar')} />
      <Stack.Screen name="novo-membro" options={h('Novo profissional')} />
      <Stack.Screen name="historico" options={h('Histórico de administração')} />
    </Stack>
  );
}

export default function Root() {
  return (
    <SessionProvider>
      <Gate />
    </SessionProvider>
  );
}
