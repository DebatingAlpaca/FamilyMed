import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../../src/api';
import Fab from '../../src/components/Fab';
import { PrimaryButton } from '../../src/components/ui';
import { useSession } from '../../src/session';
import { colors, radius } from '../../src/theme';
import { useApiData } from '../../src/useApiData';

type Dose = { id: string; horario: string; medicamento: string; dosagem: string; status: 'administrada' | 'perdido' | 'proximo' | 'pendente' };

const STATUS = {
  perdido: { label: 'Perdido', bg: '#FDE8E8', fg: colors.danger },
  proximo: { label: 'Próximo', bg: '#CDEBFB', fg: colors.primary },
  pendente: { label: 'Pendente', bg: '#EEF2F6', fg: colors.muted },
  administrada: { label: 'Administrada', bg: '#E3F4E5', fg: colors.ok },
};

export default function Agenda() {
  const router = useRouter();
  const { patientId } = useSession();
  const { data: doses, erro, reload: carregar } = useApiData<Dose[]>('/schedule');
  const [sel, setSel] = useState<Dose | null>(null);
  const [qtd, setQtd] = useState(1);
  const [erroReg, setErroReg] = useState('');
  const [saving, setSaving] = useState(false);


  const abrir = (d: Dose) => {
    if (d.status === 'administrada') return;
    setSel(d); setQtd(1); setErroReg('');
  };

  const registrar = async () => {
    if (!sel) return;
    setSaving(true); setErroReg('');
    try {
      await api(`/doses/${sel.id}/administer`, { body: { quantidade: qtd } });
      setSel(null);
      carregar();
    } catch (e: any) {
      setErroReg(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!doses) {
    return (
      <View style={s.center}>
        {erro ? <Text style={{ color: colors.danger }}>{erro}</Text> : <ActivityIndicator color={colors.primary} />}
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <FlatList
        data={doses}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        ListHeaderComponent={<Text style={s.titulo}>AGENDA DE HOJE</Text>}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 30, gap: 12 }}>
            <Text style={s.vazio}>Nenhum medicamento hoje.</Text>
            <Pressable onPress={() => router.push('/novo-medicamento')}>
              <Text style={s.link}>Cadastrar medicamento</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item: d }) => {
          const st = STATUS[d.status];
          const feito = d.status === 'administrada';
          return (
            <Pressable style={[s.card, { borderLeftColor: st.fg }, feito && { opacity: 0.6 }]} onPress={() => abrir(d)}>
              <View style={{ width: 64 }}>
                <Text style={s.hora}>{d.horario}</Text>
                <Text style={[s.pill, { backgroundColor: st.bg, color: st.fg }]}>{st.label}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.med}>{d.medicamento}</Text>
                <Text style={s.dose}>{d.dosagem}</Text>
              </View>
              <Ionicons name={feito ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={feito ? colors.ok : st.fg} />
            </Pressable>
          );
        }}
      />
      <Fab onPress={() => router.push('/novo-medicamento')} />

      <Modal visible={!!sel} transparent animationType="slide" onRequestClose={() => setSel(null)}>
        <View style={s.modalBg}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Registrar administração</Text>
            <Text style={s.sheetMed}>{sel?.medicamento} • {sel?.dosagem}</Text>
            <Text style={s.sheetSub}>Horário previsto: {sel?.horario}</Text>

            <Text style={s.label}>Quantidade de doses</Text>
            <View style={s.stepper}>
              <Pressable style={s.stepBtn} onPress={() => setQtd(Math.max(1, qtd - 1))}>
                <Ionicons name="remove" size={20} color={colors.primary} />
              </Pressable>
              <Text style={s.qtd}>{qtd}</Text>
              <Pressable style={s.stepBtn} onPress={() => setQtd(qtd + 1)}>
                <Ionicons name="add" size={20} color={colors.primary} />
              </Pressable>
            </View>

            {!!erroReg && <Text style={s.erro}>{erroReg}</Text>}
            <PrimaryButton title="Confirmar administração" onPress={registrar} loading={saving} />
            <Pressable onPress={() => setSel(null)} style={{ alignItems: 'center', padding: 8 }}>
              <Text style={{ color: colors.muted }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  titulo: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 12 },
  vazio: { color: colors.muted },
  link: { color: colors.primary, fontWeight: '700' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: radius,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4,
  },
  hora: { fontSize: 17, fontWeight: '800', color: colors.text },
  pill: { fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden', marginTop: 4, alignSelf: 'flex-start' },
  med: { fontSize: 15, fontWeight: '700', color: colors.text },
  dose: { fontSize: 12, color: colors.muted, marginTop: 2 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 8 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },
  sheetMed: { fontSize: 15, fontWeight: '600', color: colors.text },
  sheetSub: { fontSize: 12, color: colors.muted, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '600', color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 20, marginVertical: 6 },
  stepBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  qtd: { fontSize: 22, fontWeight: '800', color: colors.text, minWidth: 30, textAlign: 'center' },
  erro: { color: colors.danger, fontSize: 13 },
});
