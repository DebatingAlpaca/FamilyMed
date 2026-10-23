import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { api } from '../src/api';
import PacienteForm from '../src/components/PacienteForm';
import { useSession } from '../src/session';
import { colors } from '../src/theme';

export default function NovoPaciente() {
  const router = useRouter();
  const { setPatient, bumpPatients } = useSession();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <PacienteForm
        label="Cadastrar familiar"
        onSubmit={async (d) => {
          const r = await api<{ id: string }>('/patients', { body: d });
          await setPatient(r.id);
          bumpPatients();
          router.back();
        }}
      />
    </ScrollView>
  );
}
