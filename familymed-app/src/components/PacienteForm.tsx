import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Field, PrimaryButton } from './ui';
import Chips from './Chips';
import type { Colors } from '../theme';
import { useStyles } from '../ThemeContext';

const SANGUE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

type Props = { initial?: any; label: string; onSubmit: (d: any) => Promise<void> };

const str = (v: any) => (v === null || v === undefined ? '' : String(v));

export default function PacienteForm({ initial, label, onSubmit }: Props) {
  const s = useStyles(makeStyles);
  const [nome, setNome] = useState(str(initial?.nome));
  const [idade, setIdade] = useState(str(initial?.idade));
  const [sexo, setSexo] = useState<string>(initial?.sexo ?? 'Fem');
  const [sangue, setSangue] = useState<string | null>(initial?.tipoSanguineo ?? null);
  const [telefone, setTelefone] = useState(str(initial?.telefone));
  const [alergias, setAlergias] = useState(initial?.alergias && initial.alergias !== 'Nenhuma' ? initial.alergias : '');
  const [peso, setPeso] = useState(str(initial?.peso));
  const [altura, setAltura] = useState(str(initial?.altura));
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const salvar = async () => {
    setErro('');
    if (!nome.trim()) return setErro('O nome é obrigatório.');
    if (!sangue) return setErro('Escolha o tipo sanguíneo.');
    setLoading(true);
    try {
      await onSubmit({
        nome, idade: Number(idade), sexo, tipoSanguineo: sangue, alergias,
        peso: peso.replace(',', '.'), altura: altura.replace(',', '.'), telefone,
      });
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.card}>
      <Field label="Nome" icon="person-outline" value={nome} onChangeText={setNome} placeholder="Nome do familiar" />
      <Field label="Telefone (opcional)" icon="call-outline" value={telefone} onChangeText={setTelefone} placeholder="(11) 99999-0000" keyboardType="numeric" />
      <Field label="Idade" icon="calendar-outline" value={idade} onChangeText={setIdade} placeholder="Ex.: 78" keyboardType="numeric" />

      <Text style={s.label}>Sexo</Text>
      <Chips options={['Fem', 'Masc']} value={sexo} onChange={setSexo} />

      <Text style={s.label}>Tipo sanguíneo</Text>
      <Chips options={SANGUE} value={sangue} onChange={setSangue} />

      <Field label="Alergias" icon="alert-circle-outline" value={alergias} onChangeText={setAlergias} placeholder="Nenhuma" />

      <Text style={s.secao}>Medidas (opcional)</Text>
      <Field label="Peso (kg)" icon="barbell-outline" value={peso} onChangeText={setPeso} placeholder="Ex.: 70,5" keyboardType="decimal-pad" />
      <Field label="Altura (cm)" icon="resize-outline" value={altura} onChangeText={setAltura} placeholder="Ex.: 165" keyboardType="numeric" />

      {!!erro && <Text style={s.erro}>{erro}</Text>}
      <PrimaryButton title={label} onPress={salvar} loading={loading} />
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6 },
  secao: { fontSize: 14, fontWeight: '800', color: colors.primary, marginTop: 6, marginBottom: 10 },
  erro: { color: colors.danger, fontSize: 13, marginBottom: 4 },
});
