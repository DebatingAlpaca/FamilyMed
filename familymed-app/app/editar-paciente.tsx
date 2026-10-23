import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { api } from '../src/api';
import PacienteForm from '../src/components/PacienteForm';
import { useSession } from '../src/session';
import { colors, radius } from '../src/theme';

export default function EditarFamiliar() {
  const router = useRouter();
  const { bumpPatients } = useSession();
  const [familiar, setFamiliar] = useState<any>(null);

  useEffect(() => {
    api('/patient').then((d) => setFamiliar(d.paciente)).catch(() => {});
  }, []);

  if (!familiar) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  const remover = () =>
    Alert.alert('Remover familiar', `Remover ${familiar.nome} e todos os dados de medicação dele?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: async () => {
          try {
            await api('/patients/remove', { body: { id: familiar.id } });
            bumpPatients();
            router.back();
          } catch (e: any) {
            Alert.alert('Erro', e.message);
          }
        },
      },
    ]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <PacienteForm
        initial={familiar}
        label="Salvar alterações"
        onSubmit={async (d) => {
          await api('/patient/update', { body: d });
          bumpPatients();
          router.back();
        }}
      />
      <Pressable style={s.remover} onPress={remover}>
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
        <Text style={s.removerText}>Remover familiar</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  remover: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', height: 48, marginTop: 20,
    borderRadius: radius, borderWidth: 1, borderColor: colors.danger,
  },
  removerText: { color: colors.danger, fontWeight: '700' },
});
