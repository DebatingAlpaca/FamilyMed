import { useTheme } from '../../src/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Avatar from '../../src/components/Avatar';
import { radius } from '../../src/theme';
import type { Colors } from '../../src/theme';
import { useColors, useStyles } from '../../src/ThemeContext';
import { useApiData } from '../../src/useApiData';

type Data = {
  paciente: {
    nome: string; idade: number; sexo: string; tipoSanguineo: string; alergias: string;
    peso?: number | null; altura?: number | null;
  } | null;
  medicamentosRecentes: { id: string; nome: string; dosagem: string; estoque: number }[];
};

type Dose = { id: string; horario: string; medicamento: string; dosagem: string; status: string };

function calcImc(peso?: number | null, altura?: number | null) {
  if (!peso || !altura) return null;
  const v = peso / Math.pow(altura / 100, 2);
  const cls = v < 18.5 ? 'Abaixo do peso' : v < 25 ? 'Peso normal' : v < 30 ? 'Sobrepeso' : 'Obesidade';
  return { valor: v.toFixed(1).replace('.', ','), cls };
}

function Stat({ icon, color, label, value, sub, extra, full }: { icon: any; color: string; label: string; value: string; sub?: string; extra?: string; full?: boolean }) {
  const s = useStyles(makeStyles);
  return (
    <View style={[s.stat, full && { width: '100%' }]}>
      <View style={[s.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
      {!!sub && <Text style={s.statSub} numberOfLines={2}>{sub}</Text>}
      {!!extra && <Text style={s.statExtra}>{extra}</Text>}
    </View>
  );
}

export default function Dashboard() {
  const colors = useColors();
  const s = useStyles(makeStyles);
  useTheme();
  const router = useRouter();
  const { data, erro, reload } = useApiData<Data>('/patient');
  const agenda = useApiData<Dose[]>('/schedule');
  const [refreshing, setRefreshing] = useState(false);

  if (!data) {
    return (
      <View style={s.center}>
        {erro ? <Text style={{ color: colors.danger }}>{erro}</Text> : <ActivityIndicator color={colors.primary} />}
      </View>
    );
  }

  if (!data.paciente) {
    return (
      <View style={s.center}>
        <Text style={{ color: colors.muted, marginBottom: 12 }}>Nenhum familiar cadastrado.</Text>
        <Pressable style={[s.btnOutline, { flex: 0, paddingHorizontal: 20 }]} onPress={() => router.push('/novo-paciente')}>
          <Text style={s.btnOutlineText}>Cadastrar familiar</Text>
        </Pressable>
      </View>
    );
  }

  const p = data.paciente;
  const imc = calcImc(p.peso, p.altura);

  const lista = agenda.data ?? [];
  const prox = lista.find((d) => d.status === 'proximo') ?? lista.find((d) => d.status === 'pendente');
  const perdida = lista.find((d) => d.status === 'perdido');
  const restantes = lista.filter((d) => d.status === 'proximo' || d.status === 'pendente').length;
  const proxSub = prox
    ? `${prox.medicamento} • ${prox.dosagem}`
    : perdida
    ? `Perdida: ${perdida.medicamento} (${perdida.horario})`
    : lista.length > 0
    ? 'Tudo em dia hoje'
    : 'Sem doses hoje';

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await Promise.all([reload(), agenda.reload()]);
            setRefreshing(false);
          }}
        />
      }
    >
      <View style={s.card}>
        <Avatar sexo={p.sexo} size={88} />
        <Text style={s.nome}>{p.nome.toUpperCase()}</Text>
        <Text style={s.meta}>{p.idade} anos - {p.sexo}</Text>
        <Text style={s.meta}>Tipo: {p.tipoSanguineo}   Alergias: {p.alergias}</Text>
        <View style={s.row}>
          <Pressable style={s.btnOutline} onPress={() => router.push('/editar-paciente')}>
            <Ionicons name="create-outline" size={14} color={colors.primary} />
            <Text style={s.btnOutlineText}>Editar Perfil</Text>
          </Pressable>
          <Pressable style={s.btnOutline} onPress={() => router.push('/historico')}>
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text style={s.btnOutlineText}>Histórico</Text>
          </Pressable>
        </View>
      </View>

      <Text style={s.section}>Medidas</Text>
      <View style={s.grid}>
        <Stat icon="barbell" color="#EF6C00" label="Peso" value={p.peso ? `${String(p.peso).replace('.', ',')} kg` : '—'} />
        <Stat icon="resize" color="#0288D1" label="Altura" value={p.altura ? `${p.altura} cm` : '—'} />
        <Stat
          icon="speedometer" color="#2E7D32" label="IMC"
          value={imc ? imc.valor : '—'}
          sub={imc ? imc.cls : 'Informe peso e altura'}
        />
        <Stat
          icon="alarm" color="#8E24AA" label="Próxima dose"
          value={prox ? prox.horario : '—'}
          sub={proxSub}
          extra={prox ? `${restantes} dose(s) restante(s) hoje` : undefined}
        />
      </View>

      <Text style={s.section}>Medicamentos Recentes</Text>
      {data.medicamentosRecentes.length === 0 ? (
        <Text style={s.vazio}>Nenhum medicamento cadastrado ainda.</Text>
      ) : (
        data.medicamentosRecentes.map((m) => (
          <View key={m.id} style={s.med}>
            <View style={{ flex: 1 }}>
              <Text style={s.medNome}>{m.nome.toUpperCase()}</Text>
              <Text style={s.medSub}>{m.dosagem} • estoque: {m.estoque}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color={colors.ok} />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card, borderRadius: 16, padding: 18, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, gap: 2,
  },
  nome: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 10 },
  meta: { fontSize: 12, color: colors.muted, marginTop: 3 },
  row: { flexDirection: 'row', gap: 10, marginTop: 14, alignSelf: 'stretch' },
  btnOutline: {
    flex: 1, flexDirection: 'row', gap: 6, height: 38, borderRadius: radius, borderWidth: 1,
    borderColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  btnOutlineText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  section: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 22, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: {
    width: '48%', backgroundColor: colors.card, borderRadius: radius, padding: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  statIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 11, color: colors.muted, marginTop: 8 },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 2 },
  statExtra: { fontSize: 11, color: colors.primary, fontWeight: '700', marginTop: 4 },
  statSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  med: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  medNome: { fontSize: 14, fontWeight: '700', color: colors.text },
  medSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  vazio: { color: colors.muted, fontSize: 13 },
});
