import { useTheme } from '../src/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { api } from '../src/api';
import { Field } from '../src/components/ui';
import { useSession } from '../src/session';
import { radius } from '../src/theme';
import type { Colors } from '../src/theme';
import { useColors, useStyles } from '../src/ThemeContext';

type Reg = { id: string; medicamento: string; dosagem: string; quantidade: number; data: string; hora: string; responsavel: string };
type Med = { id: string; nome: string };

const maskData = (t: string) => {
  const d = t.replace(/\D/g, '').slice(0, 8);
  if (d.length > 4) return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4);
  if (d.length > 2) return d.slice(0, 2) + '/' + d.slice(2);
  return d;
};
const iso = (br: string) => {
  if (br.length !== 10) return '';
  const [d, m, a] = br.split('/');
  return `${a}-${m}-${d}`;
};
const br = (i: string) => i.split('-').reverse().join('/');

export default function Historico() {
  const colors = useColors();
  const s = useStyles(makeStyles);
  useTheme();
  const { patientId } = useSession();
  const [meds, setMeds] = useState<Med[]>([]);
  const [medId, setMedId] = useState<string | null>(null);
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [itens, setItens] = useState<Reg[] | null>(null);
  const [erro, setErro] = useState('');

  useFocusEffect(
    useCallback(() => {
      api<Med[]>('/medications').then(setMeds).catch(() => {});
    }, [patientId])
  );

  useFocusEffect(
    useCallback(() => {
      const q = new URLSearchParams();
      if (medId) q.set('medId', medId);
      if (iso(de)) q.set('de', iso(de));
      if (iso(ate)) q.set('ate', iso(ate));
      api<Reg[]>('/history?' + q.toString())
        .then((d) => { setErro(''); setItens(d); })
        .catch((e) => { setErro(e.message); setItens([]); });
    }, [patientId, medId, de, ate])
  );

  const exportar = () => {
    if (!itens || itens.length === 0) return;
    const csv = ['data;hora;medicamento;dosagem;quantidade;responsavel']
      .concat(itens.map((r) => [br(r.data), r.hora, r.medicamento, r.dosagem, r.quantidade, r.responsavel].join(';')))
      .join('\n');
    Share.share({ title: 'Histórico FamilyMed', message: csv });
  };

  return (
    <View style={s.screen}>
      <FlatList
        data={itens ?? []}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            <Text style={s.label}>Medicamento</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 14 }}>
              {[{ id: '', nome: 'Todos' }, ...meds].map((m) => {
                const on = (m.id || null) === medId;
                return (
                  <Pressable key={m.id || 'todos'} style={[s.chip, on && s.chipOn]} onPress={() => setMedId(m.id || null)}>
                    <Text style={[s.chipText, on && { color: '#fff' }]}>{m.nome}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field label="De" icon="calendar-outline" value={de} onChangeText={(t) => setDe(maskData(t))} placeholder="DD/MM/AAAA" keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Até" icon="calendar-outline" value={ate} onChangeText={(t) => setAte(maskData(t))} placeholder="DD/MM/AAAA" keyboardType="numeric" />
              </View>
            </View>
            {!!erro && <Text style={{ color: colors.danger, marginBottom: 8 }}>{erro}</Text>}
            <Pressable style={s.export} onPress={exportar}>
              <Ionicons name="share-outline" size={16} color={colors.primary} />
              <Text style={s.exportText}>Exportar</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          itens ? <Text style={s.vazio}>Nenhum registro para os filtros selecionados.</Text> : null
        }
        renderItem={({ item: r }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.med}>{r.medicamento} • {r.dosagem}</Text>
              <Text style={s.sub}>Qtd: {r.quantidade}  •  por {r.responsavel}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.data}>{br(r.data)}</Text>
              <Text style={s.sub}>{r.hora}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  export: { flexDirection: 'row', gap: 6, alignItems: 'center', alignSelf: 'flex-end', marginBottom: 12 },
  exportText: { color: colors.primary, fontWeight: '700' },
  vazio: { textAlign: 'center', color: colors.muted, marginTop: 30 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.ok,
  },
  med: { fontSize: 14, fontWeight: '700', color: colors.text },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  data: { fontSize: 13, fontWeight: '700', color: colors.text },
});
