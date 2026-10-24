import { useTheme } from '../src/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../src/api';
import { Field, PrimaryButton } from '../src/components/ui';
import { radius } from '../src/theme';
import type { Colors } from '../src/theme';
import { useColors, useStyles } from '../src/ThemeContext';

const maskHora = (t: string) => {
  const d = t.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + ':' + d.slice(2) : d;
};
const maskData = (t: string) => {
  const d = t.replace(/\D/g, '').slice(0, 8);
  if (d.length > 4) return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4);
  if (d.length > 2) return d.slice(0, 2) + '/' + d.slice(2);
  return d;
};
const horaOk = (h: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(h);

export default function NovoMedicamento() {
  const colors = useColors();
  const s = useStyles(makeStyles);
  useTheme();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [hora, setHora] = useState('');
  const [horarios, setHorarios] = useState<string[]>([]);
  const [estoque, setEstoque] = useState('');
  const [minimo, setMinimo] = useState('5');
  const [validade, setValidade] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const addHora = () => {
    if (!horaOk(hora)) return setErro('Horário inválido. Use HH:MM (ex.: 08:00).');
    if (horarios.includes(hora)) return setErro('Esse horário já foi adicionado.');
    setErro('');
    setHorarios([...horarios, hora].sort());
    setHora('');
  };

  const salvar = async () => {
    setErro('');
    if (!nome.trim() || !dosagem.trim() || horarios.length === 0)
      return setErro('Nome, dosagem e ao menos um horário são obrigatórios.');
    const est = Number(estoque || 0);
    if (isNaN(est) || est < 0) return setErro('Estoque inicial inválido.');
    let iso: string | null = null;
    if (validade) {
      const [d, m, a] = validade.split('/');
      if (validade.length !== 10 || !a) return setErro('Validade inválida. Use DD/MM/AAAA.');
      iso = `${a}-${m}-${d}`;
    }
    setLoading(true);
    try {
      await api('/medications', {
        body: {
          nome: nome.trim(), dosagem: dosagem.trim(), horarios,
          estoque: est, estoqueMinimo: Number(minimo || 0), validade: iso,
        },
      });
      router.back();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={s.card}>
        <Field label="Nome do medicamento" icon="medkit-outline" value={nome} onChangeText={setNome} placeholder="Ex.: Losartana" />
        <Field label="Dosagem" icon="flask-outline" value={dosagem} onChangeText={setDosagem} placeholder="Ex.: 50mg" />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field label="Horários" icon="time-outline" value={hora} onChangeText={(t) => setHora(maskHora(t))} placeholder="08:00" keyboardType="numeric" />
          </View>
          <Pressable style={s.add} onPress={addHora}>
            <Text style={s.addText}>Adicionar</Text>
          </Pressable>
        </View>
        {horarios.length > 0 && (
          <View style={s.chips}>
            {horarios.map((h) => (
              <Pressable key={h} style={s.chip} onPress={() => setHorarios(horarios.filter((x) => x !== h))}>
                <Text style={s.chipText}>{h}</Text>
                <Ionicons name="close" size={14} color={colors.primary} />
              </Pressable>
            ))}
          </View>
        )}

        <Field label="Estoque inicial" icon="cube-outline" value={estoque} onChangeText={setEstoque} placeholder="Ex.: 30" keyboardType="numeric" />
        <Field label="Estoque mínimo (alerta)" icon="alert-circle-outline" value={minimo} onChangeText={setMinimo} placeholder="Ex.: 5" keyboardType="numeric" />
        <Field label="Validade" icon="calendar-outline" value={validade} onChangeText={(t) => setValidade(maskData(t))} placeholder="DD/MM/AAAA" keyboardType="numeric" />

        {!!erro && <Text style={s.erro}>{erro}</Text>}
        <PrimaryButton title="Salvar" onPress={salvar} loading={loading} />
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.border },
  add: {
    height: 48, paddingHorizontal: 14, borderRadius: radius, borderWidth: 1, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginBottom: 14,
  },
  addText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14, marginTop: -4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.tint, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  chipText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  erro: { color: colors.danger, fontSize: 13, marginBottom: 4 },
});
