import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../api';
import { useSession } from '../session';
import Avatar from './Avatar';
import { colors, radius } from '../theme';

type P = { id: string; nome: string; idade: number; sexo: string };

export default function PatientSwitcher() {
  const router = useRouter();
  const { session, patientId, setPatient, patientsVersion } = useSession();
  const [list, setList] = useState<P[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!session) return;
    api<P[]>('/patients')
      .then((l) => {
        setList(l);
        if (l.length === 0) router.push('/novo-paciente');
        else if (!l.some((p) => p.id === patientId)) setPatient(l[0].id);
      })
      .catch(() => {});
  }, [patientsVersion, session?.userId]);

  const atual = list.find((p) => p.id === patientId);

  return (
    <>
      <Pressable style={s.btn} onPress={() => setOpen(true)}>
        <Text style={s.nome} numberOfLines={1}>{atual?.nome ?? 'FamilyMed'}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.primary} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.bg} onPress={() => setOpen(false)}>
          <View style={s.sheet}>
            <Text style={s.titulo}>Escolher familiar</Text>
            {list.map((p) => {
              const on = p.id === patientId;
              return (
                <Pressable
                  key={p.id}
                  style={[s.item, on && s.itemOn]}
                  onPress={() => { setPatient(p.id); setOpen(false); }}
                >
                  <Avatar sexo={p.sexo} size={38} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemNome}>{p.nome}</Text>
                    <Text style={s.itemSub}>{p.idade} anos - {p.sexo}</Text>
                  </View>
                  {on && <Ionicons name="checkmark-circle" size={22} color={colors.ok} />}
                </Pressable>
              );
            })}
            <Pressable style={s.add} onPress={() => { setOpen(false); router.push('/novo-paciente'); }}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={s.addText}>Adicionar familiar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: 220 },
  nome: { fontSize: 18, fontWeight: '800', color: colors.primary, flexShrink: 1 },
  bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 8 },
  titulo: { fontSize: 17, fontWeight: '800', color: colors.primary, marginBottom: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: radius, borderWidth: 1, borderColor: colors.border },
  itemOn: { borderColor: colors.primary, backgroundColor: '#F0F7FF' },
  itemNome: { fontSize: 15, fontWeight: '700', color: colors.text },
  itemSub: { fontSize: 12, color: colors.muted },
  add: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 14 },
  addText: { color: colors.primary, fontWeight: '700' },
});
