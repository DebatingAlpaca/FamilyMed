import { useTheme } from '../src/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { api } from '../src/api';
import { Field, PrimaryButton } from '../src/components/ui';
import type { Colors } from '../src/theme';
import { useColors, useStyles } from '../src/ThemeContext';

export default function NovoProfissional() {
  const colors = useColors();
  const s = useStyles(makeStyles);
  useTheme();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [vinculo, setVinculo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const salvar = async () => {
    setErro('');
    if (!nome.trim() || !vinculo.trim() || !telefone.trim()) return setErro('Preencha nome, função e telefone.');
    setLoading(true);
    try {
      await api('/network', { body: { nome, vinculo, telefone, tipo: 'profissional' } });
      router.back();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <View style={s.card}>
        <Field label="Nome" icon="person-outline" value={nome} onChangeText={setNome} placeholder="Nome completo" />
        <Field label="Função" icon="medkit-outline" value={vinculo} onChangeText={setVinculo} placeholder="Ex.: Cuidador diário, Médica" />
        <Field label="Telefone" icon="call-outline" value={telefone} onChangeText={setTelefone} placeholder="(11) 99999-0000" keyboardType="numeric" />
        {!!erro && <Text style={s.erro}>{erro}</Text>}
        <PrimaryButton title="Adicionar profissional" onPress={salvar} loading={loading} />
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.border },
  erro: { color: colors.danger, fontSize: 13, marginBottom: 4 },
});
