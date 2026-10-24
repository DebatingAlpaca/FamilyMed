import { useTheme } from '../../src/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { api } from '../../src/api';
import Fab from '../../src/components/Fab';
import { useSession } from '../../src/session';
import { radius } from '../../src/theme';
import type { Colors } from '../../src/theme';
import { useColors, useStyles } from '../../src/ThemeContext';
import { useApiData } from '../../src/useApiData';

type Med = {
  id: string; nome: string; dosagem: string; frequencia: string; horarios: string[];
  estoque: number; estoqueMinimo: number; validade: string | null;
};

const br = (iso: string) => iso.split('-').reverse().join('/');

export default function Medicacoes() {
  const colors = useColors();
  const s = useStyles(makeStyles);
  useTheme();
  const router = useRouter();
  const { patientId } = useSession();
  const { data: meds, erro } = useApiData<Med[]>('/medications');


  if (!meds) {
    return (
      <View style={s.center}>
        {erro ? <Text style={{ color: colors.danger }}>{erro}</Text> : <ActivityIndicator color={colors.primary} />}
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <FlatList
        data={meds}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        ListEmptyComponent={<Text style={s.vazio}>Nenhum medicamento cadastrado. Toque em + para adicionar.</Text>}
        renderItem={({ item: m }) => {
          const baixo = m.estoque <= m.estoqueMinimo;
          return (
            <View style={[s.card, baixo && { borderLeftColor: colors.warn }]}>
              <View style={s.top}>
                <Text style={s.nome}>{m.nome.toUpperCase()}</Text>
                <Text style={s.dose}>{m.dosagem}</Text>
              </View>
              <Text style={s.linha}>
                <Ionicons name="time-outline" size={13} color={colors.muted} /> {m.horarios.join('  •  ')} ({m.frequencia})
              </Text>
              <View style={s.rodape}>
                <Text style={[s.badge, baixo && s.badgeWarn]}>Estoque: {m.estoque}{baixo ? ' (baixo)' : ''}</Text>
                {m.validade && <Text style={s.badge}>Validade: {br(m.validade)}</Text>}
              </View>
            </View>
          );
        }}
      />
      <Fab onPress={() => router.push('/novo-medicamento')} />
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  vazio: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  card: {
    backgroundColor: colors.card, borderRadius: radius, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nome: { fontSize: 15, fontWeight: '700', color: colors.text },
  dose: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  linha: { fontSize: 12, color: colors.muted, marginTop: 6 },
  rodape: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  badge: { fontSize: 11, color: colors.text, backgroundColor: colors.chip, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  badgeWarn: { backgroundColor: colors.warnBg, color: colors.warnFg },
});
